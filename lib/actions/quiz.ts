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
import { logActivity } from "@/lib/data";
import { getDb, quizzes } from "@/lib/db";
import { addMistakeCard } from "@/lib/srs";
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
    if (q.type === "multiple") {
      const right = given === q.answer;
      graded.set(i, {
        index: i,
        correct: right,
        verdict: right ? "certo" : "errado",
        comment: right
          ? q.explanation
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
  for (const r of results) {
    if (r.correct) continue;
    const q = questions[r.index];
    if (!q) continue;
    const back = r.correctedPt ?? q.answer;
    if (back) {
      await addMistakeCard(session.username, q.promptEn, back, r.tip ?? q.explanation);
    }
  }

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
  if (!quiz) return;
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
