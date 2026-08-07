"use client";

import { useState, useTransition } from "react";
import { setCefrLevel } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Level = (typeof LEVELS)[number];

const TOTAL = 10; // questions per run
const PASS = 2; // correct answers needed to "own" a level

type Item = {
  level: Level;
  promptEn: string;
  promptPt?: string;
  options: string[];
  answer: string;
};

/** Hand-written, European Portuguese only. Four items per level. */
const BANK: Item[] = [
  // ── A1 ──────────────────────────────────────────────────────────────
  {
    level: "A1",
    promptEn: "“I am Robert.” — which verb form fits?",
    promptPt: "Eu ___ o Robert.",
    options: ["sou", "estou", "és", "é"],
    answer: "sou",
  },
  {
    level: "A1",
    promptEn: "It's 9 in the morning and you meet a neighbour. You say…",
    options: ["Bom dia", "Boa tarde", "Boa noite", "Até logo"],
    answer: "Bom dia",
  },
  {
    level: "A1",
    promptEn: "“The house is big.” — which article?",
    promptPt: "___ casa é grande.",
    options: ["O", "A", "Os", "As"],
    answer: "A",
  },
  {
    level: "A1",
    promptEn: "In Portugal, “the bus” is…",
    options: ["o autocarro", "o ônibus", "o comboio", "o elétrico"],
    answer: "o autocarro",
  },

  // ── A2 ──────────────────────────────────────────────────────────────
  {
    level: "A2",
    promptEn: "“Yesterday we spoke to the teacher.” — past tense, Portugal spelling.",
    promptPt: "Ontem nós ___ com a professora.",
    options: ["falamos", "falámos", "falávamos", "falaremos"],
    answer: "falámos",
  },
  {
    level: "A2",
    promptEn: "“Tomorrow I'm going to Lisbon.” — which preposition?",
    promptPt: "Amanhã vou ___ Lisboa.",
    options: ["a", "em", "de", "por"],
    answer: "a",
  },
  {
    level: "A2",
    promptEn: "Breakfast, as the Portuguese say it:",
    options: ["o pequeno-almoço", "o café da manhã", "o almoço", "o lanche"],
    answer: "o pequeno-almoço",
  },
  {
    level: "A2",
    promptEn: "“Last Saturday I went to the market.”",
    promptPt: "No sábado passado, eu ___ ao mercado.",
    options: ["fui", "fiz", "vim", "ia"],
    answer: "fui",
  },

  // ── B1 ──────────────────────────────────────────────────────────────
  {
    level: "B1",
    promptEn: "“When I was little, I always used to go to the beach with my grandad.”",
    promptPt: "Quando era pequeno, ___ sempre à praia com o meu avô.",
    options: ["fui", "ia", "tinha ido", "vou"],
    answer: "ia",
  },
  {
    level: "B1",
    promptEn: "“I didn't see you yesterday.” — which sentence is correct?",
    options: [
      "Não te vi ontem.",
      "Não vi-te ontem.",
      "Não vi te ontem.",
      "Te não vi ontem.",
    ],
    answer: "Não te vi ontem.",
  },
  {
    level: "B1",
    promptEn: "“I hope you have time tomorrow.” — after «espero que»…",
    promptPt: "Espero que tu ___ tempo amanhã.",
    options: ["tens", "tenhas", "tinhas", "terás"],
    answer: "tenhas",
  },
  {
    level: "B1",
    promptEn: "“When you get to Portugal, call me.” — after «quando» about the future.",
    promptPt: "Quando ___ a Portugal, liga-me.",
    options: ["chegas", "chegares", "chegaste", "chegarias"],
    answer: "chegares",
  },

  // ── B2 ──────────────────────────────────────────────────────────────
  {
    level: "B2",
    promptEn: "“If I had more time, I'd go to the gym more often.”",
    promptPt: "Se eu ___ mais tempo, iria mais vezes ao ginásio.",
    options: ["tinha", "tivesse", "tiver", "teria"],
    answer: "tivesse",
  },
  {
    level: "B2",
    promptEn: "Conditional (condicional) of «dizer», first person singular:",
    options: ["direi", "diria", "dissesse", "dizia"],
    answer: "diria",
  },
  {
    level: "B2",
    promptEn: "The expression «estar com os azeites» means…",
    options: [
      "estar zangado",
      "estar com pressa",
      "estar apaixonado",
      "estar cheio de fome",
    ],
    answer: "estar zangado",
  },
  {
    level: "B2",
    promptEn: "“You'd better leave now.” — personal infinitive after «é melhor».",
    promptPt: "É melhor vocês ___ agora.",
    options: ["sair", "saem", "saírem", "saiam"],
    answer: "saírem",
  },
];

const BLURB: Record<Level, { pt: string; en: string }> = {
  A1: {
    pt: "Iniciante — cumprimentos, presente e frases curtas do dia a dia.",
    en: "Beginner: greetings, present tense, ordering a coffee.",
  },
  A2: {
    pt: "Elementar — já contas o que fizeste ontem e desenrascas-te no mercado.",
    en: "Elementary: past tense, everyday errands, short conversations.",
  },
  B1: {
    pt: "Intermédio — passado, futuro e conjuntivo a entrar em cena.",
    en: "Intermediate: imperfect vs perfect, pronouns, first subjunctives.",
  },
  B2: {
    pt: "Avançado — opiniões, hipóteses e conjuntivo com à-vontade.",
    en: "Upper intermediate: opinions, hypotheticals, idioms.",
  },
};

const emptyScores = (): Record<Level, number> => ({ A1: 0, A2: 0, B1: 0, B2: 0 });

/** Pick an unused item, preferring `levelIdx` and widening outwards. */
function pick(levelIdx: number, asked: Item[]): Item | null {
  const order = LEVELS.map((_, i) => i).sort(
    (a, b) => Math.abs(a - levelIdx) - Math.abs(b - levelIdx)
  );
  for (const idx of order) {
    const pool = BANK.filter(
      (i) => i.level === LEVELS[idx] && !asked.includes(i)
    );
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  }
  return null;
}

/** Highest level with at least PASS correct answers, else A1. */
function verdict(scores: Record<Level, number>): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (scores[LEVELS[i]] >= PASS) return LEVELS[i];
  }
  return "A1";
}

export function PlacementQuiz({ savedLevel }: { savedLevel?: string }) {
  const [asked, setAsked] = useState<Item[]>([]);
  const [levelIdx, setLevelIdx] = useState(1); // start at A2
  const [scores, setScores] = useState(emptyScores);
  const [result, setResult] = useState<Level | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = asked[asked.length - 1];

  function reset() {
    setAsked([]);
    setLevelIdx(1);
    setScores(emptyScores());
    setResult(null);
    setSaved(false);
    setError(null);
  }

  function start() {
    // Randomness only ever runs on a click, never during render — no
    // server/client hydration mismatch.
    const first = pick(1, []);
    if (!first) return;
    setAsked([first]);
    setLevelIdx(1);
    setScores(emptyScores());
    setResult(null);
    setSaved(false);
    setError(null);
  }

  function answer(option: string) {
    if (!current) return;
    const ok = option === current.answer;
    const nextScores = ok
      ? { ...scores, [current.level]: scores[current.level] + 1 }
      : scores;
    const nextIdx = ok
      ? Math.min(LEVELS.length - 1, levelIdx + 1)
      : Math.max(0, levelIdx - 1);

    setScores(nextScores);
    setLevelIdx(nextIdx);

    const next = asked.length >= TOTAL ? null : pick(nextIdx, asked);
    if (next) setAsked([...asked, next]);
    else setResult(verdict(nextScores));
  }

  function save() {
    if (!result) return;
    setError(null);
    startTransition(async () => {
      try {
        await setCefrLevel(result);
        setSaved(true);
      } catch {
        setError("Não deu para guardar. Tenta outra vez.");
      }
    });
  }

  // ── Result ──────────────────────────────────────────────────────────
  if (result) {
    const total = LEVELS.reduce((sum, l) => sum + scores[l], 0);
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Acertaste {total} de {asked.length}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            O teu nível: {result}
          </h2>
          <p className="mt-2 text-ink-soft">{BLURB[result].pt}</p>
          <p className="mt-1 text-sm text-ink-faint">{BLURB[result].en}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {LEVELS.map((l) => (
              <span key={l} className="chip">
                {l} · {scores[l]}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              className="btn-terra"
              onClick={save}
              disabled={pending || saved}
            >
              {saved
                ? "Guardado ✓"
                : pending
                  ? "A guardar…"
                  : "Guardar o meu nível"}
            </button>
            <button className="btn-ghost" onClick={reset}>
              Repetir
            </button>
          </div>

          {saved ? (
            <p className="mt-3 text-sm text-olive">
              Os testes, lições e histórias já vêm em {result} por omissão.
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm text-terra-dark">{error}</p>
          ) : null}
        </div>
      </div>
    );
  }

  // ── Intro ───────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="card space-y-3 p-6">
        <p className="text-ink-soft">
          Dez perguntas, cerca de três minutos. As perguntas ficam mais difíceis
          quando acertas e mais fáceis quando falhas — por isso não faz mal
          errar.
        </p>
        <p className="text-sm text-ink-faint">
          Ten adaptive multiple-choice questions in European Portuguese. No
          feedback along the way — just answer with your gut.
        </p>
        {savedLevel ? (
          <p className="text-sm text-ink-soft">
            Nível guardado neste momento: <span className="chip">{savedLevel}</span>
          </p>
        ) : null}
        <button className="btn-terra" onClick={start}>
          Começar 🧭
        </button>
      </div>
    );
  }

  // ── Question ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < asked.length - 1
                ? "bg-olive"
                : i === asked.length - 1
                  ? "bg-terra"
                  : "bg-sand"
            )}
          />
        ))}
      </div>

      <div className="card p-5">
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          Pergunta {asked.length} de {TOTAL}
        </p>
        <h2 className="mt-2 text-lg font-semibold">{current.promptEn}</h2>
        {current.promptPt ? (
          <p className="mt-1 font-display text-xl text-ink-soft">
            {current.promptPt}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => answer(opt)}
              className="rounded-xl border border-sand bg-white/70 px-4 py-3 text-left transition-all hover:border-sage hover:bg-sage-pale"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-ghost" onClick={reset}>
        Recomeçar
      </button>
    </div>
  );
}
