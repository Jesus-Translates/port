import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuizPlayer } from "@/components/quiz-player";
import type { QuizQuestions } from "@/lib/ai";
import { requireSession } from "@/lib/auth";
import { getQuiz } from "@/lib/data";
import type { GradedResult } from "@/lib/actions/quiz";

export default async function QuizPage(props: PageProps<"/practice/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;
  const quiz = await getQuiz(Number(id));
  if (!quiz || Number.isNaN(Number(id))) notFound();
  if (quiz.username !== session.username) redirect("/practice");

  const { questions } = quiz.questions as QuizQuestions;

  return (
    <div className="space-y-5">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🎯 {quiz.topic}
        </h1>
        <p className="text-sm text-ink-soft">
          {quiz.level} · {questions.length} perguntas
        </p>
      </header>

      {quiz.status === "completed" ? (
        <CompletedView
          questions={questions}
          answers={(quiz.answers as string[]) ?? []}
          results={(quiz.feedback as GradedResult[]) ?? []}
          score={quiz.score ?? 0}
          total={quiz.total ?? questions.length}
        />
      ) : (
        <QuizPlayer
          quizId={quiz.id}
          questions={questions.map((q) => ({
            type: q.type,
            promptPt: q.promptPt,
            promptEn: q.promptEn,
            options: q.options,
          }))}
        />
      )}
    </div>
  );
}

function CompletedView({
  questions,
  answers,
  results,
  score,
  total,
}: {
  questions: QuizQuestions["questions"];
  answers: string[];
  results: GradedResult[];
  score: number;
  total: number;
}) {
  return (
    <div className="space-y-4">
      <div className="card flex items-center gap-4 p-5">
        <div className="text-4xl" aria-hidden>
          {score / total >= 0.8 ? "🏆" : score / total >= 0.5 ? "💪" : "🌱"}
        </div>
        <div>
          <div className="text-xl font-bold">
            {score}/{total}
          </div>
          <div className="text-sm text-ink-soft">
            {score / total >= 0.8
              ? "Fantástico! Estás em chamas."
              : score / total >= 0.5
                ? "Bom trabalho — continua!"
                : "Tudo bem — errar faz parte de aprender."}
          </div>
        </div>
      </div>
      <ol className="space-y-3">
        {questions.map((q, i) => {
          const r = results.find((x) => x.index === i);
          return (
            <li key={i} className="card p-4">
              <div className="flex items-start gap-2">
                <span aria-hidden>{r?.correct ? "✅" : "❌"}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {i + 1}. {q.promptEn}
                  </p>
                  {q.promptPt ? (
                    <p className="text-sm text-ink-soft">{q.promptPt}</p>
                  ) : null}
                  <p className="mt-1.5 text-sm">
                    <span className="text-ink-faint">Your answer: </span>
                    {answers[i] || <em className="text-ink-faint">blank</em>}
                  </p>
                  {r?.comment ? (
                    <p className="mt-1 rounded-lg bg-sage-pale/70 px-2.5 py-1.5 text-sm text-olive">
                      {r.comment}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <Link href="/practice" className="btn-primary">
        Outro teste →
      </Link>
    </div>
  );
}
