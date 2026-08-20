import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioButton } from "@/components/audio-button";
import { AnswerDiff } from "@/components/answer-diff";
import { Bi } from "@/components/bilingual";
import { QuizPlayer } from "@/components/quiz-player";
import { UnitContinue, UnitReturn } from "@/components/unit-return";
import type { QuizQuestions } from "@/lib/ai";
import { cloneQuiz } from "@/lib/actions/quiz";
import type { GradedResult } from "@/lib/actions/quiz";
import { requireSession } from "@/lib/auth";
import { checkAnswer } from "@/lib/diff";
import { getQuiz } from "@/lib/data";
import { unitContextFrom } from "@/lib/unit-context";

export default async function QuizPage(props: PageProps<"/practice/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;
  const quizId = Number(id);
  if (!Number.isInteger(quizId)) notFound();
  const quiz = await getQuiz(quizId);
  if (!quiz) notFound();

  // The quiz id only exists after the AI wrote it, so the unit that asked for
  // this quiz travels in the URL — see QuizUnitForm.
  const unit = await unitContextFrom(await props.searchParams);

  const isOwner = quiz.username === session.username;
  const { questions } = quiz.questions as QuizQuestions;
  const hasAudio = Boolean(
    (quiz.questions as { audioScript?: string }).audioScript
  );
  const cloneThis = cloneQuiz.bind(null, quiz.id);

  return (
    <div className="space-y-5">
      <header>
        {unit ? (
          <UnitReturn unit={unit} />
        ) : (
          <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
            <Bi pt="← Praticar" en="Practice" inline />
          </Link>
        )}
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
          <AudioButton quizId={quiz.id} label="Ouvir o áudio" labelEn="Play the audio" />
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
          {/* Done, and it came from a unit: the way onward is the course. */}
          <UnitContinue unit={unit} />
          <form action={cloneThis}>
            <button type="submit" className="btn-ghost">
              <Bi pt="🔁 Fazer este teste também" en="Take this test too" inline />
            </button>
          </form>
        </>
      ) : isOwner ? (
        <QuizPlayer
          quizId={quiz.id}
          // Deliberately field-by-field, not a spread: `answer` and
          // `explanation` must not travel to the browser. Grading happens in
          // gradeStep()/submitQuiz() precisely so they never do.
          questions={questions.map((q) => ({
            type: q.type,
            promptPt: q.promptPt,
            promptEn: q.promptEn,
            options: q.options,
            speakerPt: q.speakerPt,
            speakerEn: q.speakerEn,
          }))}
          unitItemId={unit?.itemId ?? null}
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
              <Bi pt="🔁 Fazer uma cópia para mim" en="Make a copy for myself" inline />
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
                ? "Fantástico! Estás em grande!"
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
          // Show WHICH word slipped, not just the right answer. Only for free
          // text — a multiple-choice miss has nothing meaningful to diff.
          const given = (answers[i] ?? "").trim();
          const checked =
            q.type === "translate" && given && r?.correctedPt
              ? checkAnswer(r.correctedPt, given)
              : null;
          const diff = checked && checked.verdict !== "certo" ? checked : null;
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
                  {diff ? (
                    <AnswerDiff check={diff} nearMiss={near} className="mt-1.5" />
                  ) : (
                    <>
                      <p className="mt-1.5 text-sm">
                        <span className="text-ink-faint">A tua resposta: </span>
                        {answers[i] || (
                          <em className="text-ink-faint">em branco</em>
                        )}
                      </p>

                      {near ? (
                        <p className="mt-1.5 text-sm font-semibold text-terra-dark">
                          Quase! Só escorregou a escrita — a ideia estava certa.
                        </p>
                      ) : null}

                      {r?.correctedPt ? (
                        <div className="mt-1.5 rounded-lg border border-sage bg-sage-pale/60 px-2.5 py-1.5">
                          <div className="text-2xs font-semibold tracking-wide text-olive uppercase">
                            Assim fica certo
                          </div>
                          <p className="font-display text-[16px]">
                            {r.correctedPt}
                          </p>
                        </div>
                      ) : null}
                    </>
                  )}

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

      {/*
       * Every miss above already became a review card — addMistakeCard fires
       * from the grading path. The learner was never told, so the page ended
       * on a list of errors with no way to act on them. This is the one
       * button that turns a bad score into progress.
       */}
      {score < total ? (
        <Link href="/practice/rever" className="btn-primary block w-full text-center">
          <Bi pt="Rever os erros agora →" en="Review the mistakes now" inline />
        </Link>
      ) : (
        <Link href="/practice" className="btn-primary block w-full text-center">
          <Bi pt="Praticar outra coisa →" en="Practise something else" inline />
        </Link>
      )}
    </div>
  );
}
