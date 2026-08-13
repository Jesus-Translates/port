"use server";

import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FEEDBACK_COACHING,
  gradeSchema,
  getModel,
  type QuizQuestions,
} from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { requireSession } from "@/lib/auth";
import { inMyHousehold } from "@/lib/tenant";
import { logActivity } from "@/lib/data";
import { checkAnswer, type AnswerCheck } from "@/lib/diff";
import { getDb, quizzes } from "@/lib/db";
import { addMistakeCards } from "@/lib/srs";
import { modelId, recordUsage } from "@/lib/usage";

export type GradedResult = {
  index: number;
  correct: boolean;
  comment: string;
  // Added later — older stored results won't have these.
  verdict?: string;
  correctedPt?: string | null;
  tip?: string | null;
};

export async function submitQuiz(
  id: number,
  answers: string[]
): Promise<GradedResult[] | null> {
  const session = await requireSession();
  const db = getDb();
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  if (!quiz || quiz.username !== session.username || quiz.status === "completed")
    return null;

  const { questions } = quiz.questions as QuizQuestions;
  // Keyed by question index so a confused grader can never double-count.
  const graded = new Map<number, GradedResult>();
  const toGrade: { index: number; question: string; expected: string; given: string }[] =
    [];

  questions.forEach((q, i) => {
    const given = (answers[i] ?? "").trim();

    // Read-aloud is scored by the Recorder against the learner's voice, not by
    // comparing text. Marking it correct on arrival is honest: the pronunciation
    // score already happened, and re-grading the sentence they were shown
    // would be marking them on their ability to read.
    if (q.type === "speak") {
      graded.set(i, {
        index: i,
        correct: true,
        verdict: "certo",
        comment: q.explanation || "Lido em voz alta. ✓",
        correctedPt: null,
        tip: null,
      });
      return;
    }

    // Word bank and dialogue are exact comparisons — the learner picked from a
    // closed set, so there is nothing for a model to interpret and no reason
    // to pay for one.
    if (q.type === "wordbank" || q.type === "dialogue" || q.type === "multiple") {
      const right =
        q.type === "wordbank"
          ? given.replace(/\s+/g, " ") === q.answer.replace(/\s+/g, " ")
          : given === q.answer;
      graded.set(i, {
        index: i,
        correct: right,
        verdict: right ? "certo" : "errado",
        comment: right
          ? q.explanation
          : q.type === "wordbank"
            ? `You built **${given || "nothing"}**. ${q.explanation}`
            : `You picked **${given || "nothing"}**. ${q.explanation}`,
        correctedPt: right ? null : q.answer,
        tip: null,
      });
    } else {
      toGrade.push({
        index: i,
        question: q.promptEn + (q.promptPt ? ` (${q.promptPt})` : ""),
        expected: q.answer,
        given,
      });
    }
  });

  if (toGrade.length > 0) {
    try {
      const { output, usage } = await generateText({
        model: getModel(),
        output: Output.object({ schema: gradeSchema }),
        instructions: `You are grading a European Portuguese quiz for a family learning app. ${await currentStyle()}
Decide if each answer is acceptable pt-PT (allow contractions, optional subject pronouns, synonyms).
Treat a right-meaning answer with only spelling/accent slips as CORRECT, verdict "quase" — the learner understood,
they just mis-typed. Empty answers are wrong.
${FEEDBACK_COACHING}`,
        prompt: JSON.stringify(toGrade),
      });
      await recordUsage(session.username, "grade", modelId(), usage);
      for (const r of output.results) {
        const item = toGrade.find((t) => t.index === r.index);
        if (item && !graded.has(r.index)) {
          graded.set(r.index, {
            index: r.index,
            correct: r.correct,
            verdict: r.verdict,
            comment: r.comment,
            correctedPt: r.correctedPt,
            tip: r.tip,
          });
        }
      }
    } catch {
      // AI grader unavailable — don't lose the submission; grade strictly instead.
    }
    // Any items the model skipped: mark by exact match as fallback.
    for (const t of toGrade) {
      if (!graded.has(t.index)) {
        graded.set(t.index, {
          index: t.index,
          correct: t.given.toLowerCase() === t.expected.toLowerCase(),
          comment: `Expected: ${t.expected}`,
        });
      }
    }
  }

  const results = [...graded.values()].sort((a, b) => a.index - b.index);
  const score = results.filter((r) => r.correct).length;

  // Missed items → review cards (translate: corrected pt; multiple: the answer).
  const misses = results.flatMap((r) => {
    if (r.correct) return [];
    const q = questions[r.index];
    const back = r.correctedPt ?? q?.answer;
    if (!q || !back) return [];
    return [{ prompt: q.promptEn, correctedPt: back, tip: r.tip ?? q.explanation }];
  });
  await addMistakeCards(session.username, misses);

  await db
    .update(quizzes)
    .set({
      answers,
      score,
      total: questions.length,
      feedback: results,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(quizzes.id, id));

  await logActivity(
    session.username,
    "quiz",
    `Scored ${score}/${questions.length} on “${quiz.topic}”`,
    10 + score * 2
  );
  revalidatePath("/practice");
  revalidatePath(`/practice/${id}`);
  return results;
}

/** Copy someone's quiz so the current user can take the same questions. */
export async function cloneQuiz(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  /*
   * Every other quiz action checks the owner; this one checked only that the
   * row existed, and then copied its questions — answers included — into the
   * caller's account. Walking ids read other families' quizzes.
   */
  if (!quiz || !(await inMyHousehold(quiz.username))) return;
  const [row] = await db
    .insert(quizzes)
    .values({
      username: session.username,
      topic: quiz.topic,
      level: quiz.level,
      questions: quiz.questions,
      status: "ready",
    })
    .returning({ id: quizzes.id });
  revalidatePath("/practice");
  redirect(`/practice/${row.id}`);
}

export async function deleteQuiz(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [quiz] = await db
    .select({ username: quizzes.username })
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  if (!quiz || quiz.username !== session.username) return;
  await db.delete(quizzes).where(eq(quizzes.id, id));
  revalidatePath("/practice");
  redirect("/practice");
}

/**
 * Grade ONE step, for the drill's Verificar button.
 *
 * Deterministic and free — no model call. The existing submitQuiz() batches
 * every typed answer into a SINGLE AI request on hand-in, which is a real cost
 * decision; grading each step through that path would multiply it by the
 * number of questions and add a wait to every tap.
 *
 * So the in-flight check is a string comparison (choices, word bank) or
 * checkAnswer() (typed answers — local, accent-significant, and already what
 * AnswerDiff renders everywhere else in the app). The AI grade on hand-in
 * stays the record of truth; it is more lenient, so it can only ever upgrade
 * a verdict the learner already saw, never take one away.
 *
 * The answer is never sent to the browser. That is the whole reason this is a
 * server action rather than a comparison in the component.
 */
export async function gradeStep(
  quizId: number,
  index: number,
  given: string
): Promise<{
  correct: boolean;
  verdict: "certo" | "quase" | "errado";
  answer: string;
  explanation: string;
  /** Present for typed answers, so the player can render an AnswerDiff. */
  check: AnswerCheck | null;
} | null> {
  const session = await requireSession();
  const [quiz] = await getDb()
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);
  if (!quiz || quiz.username !== session.username) return null;

  const { questions } = quiz.questions as QuizQuestions;
  const q = questions[index];
  if (!q) return null;

  const typed = (given ?? "").trim();

  if (q.type === "speak") {
    return {
      correct: true,
      verdict: "certo",
      answer: q.answer,
      explanation: q.explanation ?? "",
      check: null,
    };
  }

  if (q.type === "translate") {
    const check = checkAnswer(q.answer, typed);
    return {
      // "quase" is a near miss, not a failure — the app never scolds, and an
      // accent slip with the right words is a correction.
      correct: check.verdict === "certo" || check.verdict === "quase",
      verdict:
        check.verdict === "certo"
          ? "certo"
          : check.verdict === "quase"
            ? "quase"
            : "errado",
      answer: q.answer,
      explanation: q.explanation ?? "",
      check,
    };
  }

  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const right =
    q.type === "wordbank" ? norm(typed) === norm(q.answer) : typed === q.answer;
  return {
    correct: right,
    verdict: right ? "certo" : "errado",
    answer: q.answer,
    explanation: q.explanation ?? "",
    check: null,
  };
}
