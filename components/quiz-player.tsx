"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitQuiz } from "@/lib/actions/quiz";
import { cn } from "@/lib/utils";

type PlayerQuestion = {
  type: "multiple" | "translate";
  promptPt?: string;
  promptEn: string;
  options?: string[];
};

export function QuizPlayer({
  quizId,
  questions,
}: {
  quizId: number;
  questions: PlayerQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const q = questions[index];
  const last = index === questions.length - 1;

  function setAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function finish() {
    setBusy(true);
    setFailed(false);
    try {
      await submitQuiz(quizId, answers);
      router.refresh();
    } catch {
      // Handing back the whole quiz is the highest-stakes moment here: an
      // alert() that can be dismissed leaves the learner unsure whether their
      // answers survived. Stay on the page, keep every answer, offer a retry.
      setBusy(false);
      setFailed(true);
    }
  }

  if (busy) {
    return (
      <div className="card p-10 text-center">
        <div className="mb-3 animate-pulse text-4xl" aria-hidden>
          🌙
        </div>
        <p className="font-medium">A Luna está a corrigir…</p>
        <p className="mt-1 text-sm text-ink-soft">
          Grading your answers — a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i === index
                ? "bg-terra"
                : answers[i]
                  ? "bg-olive"
                  : "bg-sand"
            )}
            aria-label={`Pergunta ${i + 1}`}
          />
        ))}
      </div>

      <div className="card p-5">
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          Pergunta {index + 1} de {questions.length}
        </p>
        <h2 className="mt-2 text-lg font-semibold">{q.promptEn}</h2>
        {q.promptPt ? (
          <p className="mt-1 font-display text-ink-soft">{q.promptPt}</p>
        ) : null}

        {q.type === "multiple" && q.options ? (
          <div className="mt-4 grid gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-all",
                  answers[index] === opt
                    ? "border-olive bg-olive text-paper shadow"
                    : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <input
              value={answers[index]}
              onChange={(e) => setAnswer(e.target.value)}
              className="input"
              placeholder="Escreve em português…"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-ink-faint">
              Type your answer in Portuguese. Accents welcome but Luna is
              forgiving.
            </p>
          </div>
        )}
      </div>

      {failed ? (
        <div
          role="alert"
          className="card space-y-2 border-terra/50 bg-terra-pale/60 p-4"
        >
          <p className="text-sm font-semibold text-terra-dark">
            A entrega não foi — mas nada se perdeu.
          </p>
          <p className="text-sm text-ink-soft">
            Couldn&apos;t hand this in. Every answer is still here on this
            screen — check your connection and try again.
          </p>
          <button className="btn-terra" onClick={finish}>
            Tentar entregar outra vez ✓
          </button>
        </div>
      ) : null}

      <div className="flex justify-between">
        <button
          className="btn-ghost"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          ← Anterior
        </button>
        {last ? (
          <button className="btn-terra" onClick={finish}>
            Entregar ✓
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setIndex((i) => i + 1)}>
            Próxima →
          </button>
        )}
      </div>
    </div>
  );
}
