"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bi } from "@/components/bilingual";
import { setMyPrefs } from "@/lib/actions/profile";
import {
  DEFAULT_PREFS,
  PATHS,
  QUESTIONS,
  dailyGoal,
  gameQuota,
  pathFor,
  type Prefs,
} from "@/lib/learning-path";

/**
 * Five questions, one screen at a time.
 *
 * One-at-a-time matters more than it sounds: a five-question form is a wall,
 * and the person this is for is the person a wall turns away. Each answer is a
 * single tap that advances, so the whole thing is five taps and no typing.
 */
export function LearningQuestionnaire({
  initial,
  onDone,
}: {
  initial: Prefs | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<Partial<Prefs>>(initial ?? {});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[at];
  const done = at >= QUESTIONS.length;

  function choose(value: string) {
    const next = { ...answers, [question.id]: value } as Partial<Prefs>;
    setAnswers(next);

    if (at + 1 < QUESTIONS.length) {
      setAt(at + 1);
      return;
    }
    setAt(at + 1);
    setError(null);
    start(async () => {
      try {
        await setMyPrefs(next);
        setSaved(true);
        router.refresh();
        onDone?.();
      } catch {
        setError("Não deu para guardar. Tenta outra vez.");
      }
    });
  }

  if (done) {
    const prefs = { ...DEFAULT_PREFS, ...answers } as Prefs;
    const path = pathFor(prefs);
    const games = gameQuota(prefs);
    return (
      <section className="card p-6">
        <p className="text-xs uppercase tracking-wide text-ink-faint">
          O teu caminho
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          {path.namePt}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{path.blurbEn}</p>

        <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
          <li>
            ⏱️ <strong>{dailyGoal(prefs)}</strong>{" "}
            {dailyGoal(prefs) === 1 ? "atividade" : "atividades"} por dia — depois
            disso o dia fica feito.
          </li>
          <li>
            🎲{" "}
            {games === 0
              ? "Poucos jogos — sobretudo trabalho a sério."
              : `${games} ${games === 1 ? "jogo" : "jogos"} em cada unidade.`}
          </li>
          <li>
            🎙️{" "}
            {prefs.voice === "avontade"
              ? "Falas com a Sandra desde o início."
              : prefs.voice === "nervoso"
                ? "Começas por ler em voz alta; a conversa vem depois."
                : "Começas por escrever; o microfone fica para depois."}
          </li>
        </ul>

        {pending && <p className="mt-4 text-xs text-ink-faint">A guardar…</p>}
        {error && <p className="mt-4 text-xs text-terra">{error}</p>}
        {saved && (
          <p className="mt-4 text-xs text-sage">
            Guardado — podes mudar isto quando quiseres.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setAt(0);
            setSaved(false);
          }}
          className="mt-4 text-xs text-ink-soft underline underline-offset-2"
        >
          <Bi pt="Responder outra vez" en="Answer again" inline />
        </button>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2">
        {QUESTIONS.map((q, i) => (
          <span
            key={q.id}
            className={`h-1.5 flex-1 rounded-full ${
              i <= at ? "bg-sage" : "bg-sand"
            }`}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        Pergunta {at + 1} de {QUESTIONS.length}
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold">{question.pt}</h2>
      <p className="mt-1 text-sm text-ink-soft">{question.en}</p>

      <div className="mt-4 space-y-2">
        {question.options.map((o) => {
          const chosen = answers[question.id] === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              className={`block w-full rounded-xl border p-3 text-left transition-colors ${
                chosen
                  ? "border-sage bg-sage-pale"
                  : "border-sand bg-white hover:border-sage"
              }`}
            >
              <span className="block font-medium">{o.pt}</span>
              <span className="block text-xs text-ink-soft">{o.en}</span>
            </button>
          );
        })}
      </div>

      {at > 0 && (
        <button
          type="button"
          onClick={() => setAt(at - 1)}
          className="mt-4 text-xs text-ink-soft underline underline-offset-2"
        >
          <Bi pt="← Voltar" en="Back" inline />
        </button>
      )}
    </section>
  );
}

/** The saved answers as a one-line summary, for the placement page. */
export function PathSummary({ prefs }: { prefs: Prefs }) {
  const path = PATHS[pathFor(prefs).id];
  return (
    <p className="text-sm text-ink-soft">
      O teu caminho: <strong>{path.namePt}</strong> · {dailyGoal(prefs)} por dia
    </p>
  );
}
