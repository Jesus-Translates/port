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
  const results: GradedResult[] = [];
  const toGrade: { index: number; question: string; expected: string; given: string }[] =
    [];

  questions.forEach((q, i) => {
    const given = (answers[i] ?? "").trim();
    if (q.type === "multiple") {
      results.push({
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
      if (item) {
        results.push({ index: r.index, correct: r.correct, comment: r.comment });
      }
    }
    // Any items the model skipped: mark by exact match as fallback.
    for (const t of toGrade) {
      if (!results.some((r) => r.index === t.index)) {
        results.push({
          index: t.index,
          correct: t.given.toLowerCase() === t.expected.toLowerCase(),
          comment: `Expected: ${t.expected}`,
        });
      }
    }
  }

  results.sort((a, b) => a.index - b.index);
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
