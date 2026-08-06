"use server";

import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { gradeSchema, getModel, PT_STYLE, type QuizQuestions } from "@/lib/ai";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, quizzes } from "@/lib/db";

export type GradedResult = {
  index: number;
  correct: boolean;
  comment: string;
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
      graded.set(i, {
        index: i,
        correct: given === q.answer,
        comment:
          given === q.answer
            ? q.explanation
            : `Correct answer: **${q.answer}** — ${q.explanation}`,
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
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({ schema: gradeSchema }),
        instructions: `You are grading a European Portuguese quiz for a kind family learning app. ${PT_STYLE}
For each item decide if the learner's answer is an acceptable pt-PT answer (allow small variation: contractions,
optional subject pronouns, synonyms). Empty answers are incorrect. Comments: one warm line each; when wrong,
show the corrected pt-PT.`,
        prompt: JSON.stringify(toGrade),
      });
      for (const r of output.results) {
        const item = toGrade.find((t) => t.index === r.index);
        if (item && !graded.has(r.index)) {
          graded.set(r.index, {
            index: r.index,
            correct: r.correct,
            comment: r.comment,
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
