import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioButton } from "@/components/audio-button";
import { QuizPlayer } from "@/components/quiz-player";
import type { QuizQuestions } from "@/lib/ai";
import { cloneQuiz } from "@/lib/actions/quiz";
import type { GradedResult } from "@/lib/actions/quiz";
import { requireSession } from "@/lib/auth";
import { getQuiz } from "@/lib/data";

export default async function QuizPage(props: PageProps<"/practice/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;
  const quizId = Number(id);
  if (!Number.isInteger(quizId)) notFound();
  const quiz = await getQuiz(quizId);
  if (!quiz) notFound();

  const isOwner = quiz.username === session.username;
  const { questions } = quiz.questions as QuizQuestions;
  const hasAudio = Boolean(
    (quiz.questions as { audioScript?: string }).audioScript
  );
  const cloneThis = cloneQuiz.bind(null, quiz.id);

  return (
    <div className="space-y-5">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            🎯 {quiz.topic}
          </h1>
          <span className="chip capitalize">{quiz.username}</span>
        </div>
        <p className="text-sm text-ink-soft">
          {quiz.level} · {questions.length} perguntas
        </p>
      </header>

      {hasAudio ? (
        <div className="card flex items-center gap-3 border-azul/30 bg-azul-pale/50 p-4">
          <AudioButton quizId={quiz.id} label="Ouvir o áudio" />
          <p className="text-sm text-azul">
            Ouve primeiro — no exame real o áudio passa duas vezes. O texto
            nunca é mostrado.
          </p>
        </div>
      ) : null}

      {quiz.status === "completed" ? (
        <>
          <CompletedView
            questions={questions}
            answers={(quiz.answers as string[]) ?? []}
            results={(quiz.feedback as GradedResult[]) ?? []}
            score={quiz.score ?? 0}
            total={quiz.total ?? questions.length}
            ownerName={quiz.username}
            isOwner={isOwner}
          />
          <form action={cloneThis}>
            <button type="submit" className="btn-ghost">
              🔁 Fazer este teste também
            </button>
          </form>
        </>
      ) : isOwner ? (
        <QuizPlayer
          quizId={quiz.id}
          questions={questions.map((q) => ({
            type: q.type,
            promptPt: q.promptPt,
            promptEn: q.promptEn,
            options: q.options,
          }))}
        />
      ) : (
        <div className="card space-y-3 p-6 text-center">
          <p className="text-sm text-ink-soft">
            Este teste é de{" "}
            <span className="font-semibold capitalize">{quiz.username}</span> e
            ainda está por fazer — as perguntas ficam escondidas até ser
            entregue.
          </p>
          <form action={cloneThis}>
            <button type="submit" className="btn-terra">
              🔁 Fazer uma cópia para mim
            </button>
          </form>
        </div>
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
  ownerName,
  isOwner,
}: {
  questions: QuizQuestions["questions"];
  answers: string[];
  results: GradedResult[];
  score: number;
  total: number;
  ownerName: string;
  isOwner: boolean;
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
            {isOwner
              ? score / total >= 0.8
                ? "Fantástico! Estás em chamas."
                : score / total >= 0.5
                  ? "Bom trabalho — continua!"
                  : "Tudo bem — errar faz parte de aprender."
              : `Resultado de ${ownerName.charAt(0).toUpperCase()}${ownerName.slice(1)}.`}
          </div>
        </div>
      </div>
      <ol className="space-y-3">
        {questions.map((q, i) => {
          const r = results.find((x) => x.index === i);
          const near = r?.verdict === "quase";
          return (
            <li key={i} className="card p-4">
              <div className="flex items-start gap-2">
                <span aria-hidden>
                  {r?.correct ? (near ? "🟡" : "✅") : "❌"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {i + 1}. {q.promptEn}
                  </p>
                  {q.promptPt ? (
                    <p className="text-sm text-ink-soft">{q.promptPt}</p>
                  ) : null}
                  <p className="mt-1.5 text-sm">
                    <span className="text-ink-faint">Answer given: </span>
                    {answers[i] || <em className="text-ink-faint">blank</em>}
                  </p>

                  {near ? (
                    <p className="mt-1.5 text-sm font-semibold text-terra-dark">
                      Quase! Só escorregou a escrita — a ideia estava certa.
                    </p>
                  ) : null}

                  {r?.correctedPt ? (
                    <div className="mt-1.5 rounded-lg border border-sage bg-sage-pale/60 px-2.5 py-1.5">
                      <div className="text-[10px] font-semibold tracking-wide text-olive uppercase">
                        Assim fica certo
                      </div>
                      <p className="font-display text-[16px]">{r.correctedPt}</p>
                    </div>
                  ) : null}

                  {r?.comment ? (
                    <p className="mt-1.5 text-sm text-ink-soft">{r.comment}</p>
                  ) : null}

                  {r?.tip ? (
                    <p className="mt-1.5 rounded-lg bg-azul-pale px-2.5 py-1.5 text-sm text-azul">
                      💡 <span className="font-semibold">Para a próxima:</span>{" "}
                      {r.tip}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
