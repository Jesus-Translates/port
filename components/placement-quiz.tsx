"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { getStartUnit } from "@/lib/actions/course";
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

/**
 * The highest level whose ladder you actually own.
 *
 * The old rule returned the highest level with PASS correct answers and looked
 * no lower — so two lucky B2 guesses placed you at B2 while you had failed
 * everything beneath. A real tester got B2 having missed BOTH subjunctive
 * items, and was then told B2 means "conjuntivo com à-vontade". Now you climb:
 * a level counts only if you got at least half of what was ASKED at that level
 * (and at least PASS where enough were asked), and the climb stops at the first
 * level you did not own. Levels that were never asked don't break the chain.
 */
function verdict(
  scores: Record<Level, number>,
  askedPerLevel: Record<Level, number>
): Level {
  let best: Level = "A1";
  for (const level of LEVELS) {
    const n = askedPerLevel[level] ?? 0;
    if (n === 0) continue; // not tested here — neither owned nor failed
    const got = scores[level] ?? 0;
    // Below half at this level: you don't get to climb past it.
    if (got * 2 < n) break;
    // To actually CLAIM a level you need two thirds, not a coin flip — these
    // are four-option questions, so 50% is barely above guessing. This is what
    // stops 2-of-4 at B2 (having missed both subjunctive items) reading as
    // "conjuntivo com à-vontade".
    if (got >= PASS && got * 3 >= n * 2) best = level;
  }
  return best;
}

export function PlacementQuiz({ savedLevel }: { savedLevel?: string }) {
  const [asked, setAsked] = useState<Item[]>([]);
  const [levelIdx, setLevelIdx] = useState(1); // start at A2
  const [scores, setScores] = useState(emptyScores);
  const [result, setResult] = useState<Level | null>(null);
  const [saved, setSaved] = useState(false);
  const [startUnit, setStartUnit] = useState<{
    slug: string;
    title: string;
    titlePt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = asked[asked.length - 1];

  function reset() {
    setAsked([]);
    setLevelIdx(1);
    setScores(emptyScores());
    setResult(null);
    setSaved(false);
    setStartUnit(null);
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
    setStartUnit(null);
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
    else {
      // How many were actually ASKED at each level — the verdict needs the
      // denominator, not just the count of right answers.
      const perLevel = LEVELS.reduce(
        (acc, l) => ({ ...acc, [l]: asked.filter((a) => a.level === l).length }),
        {} as Record<Level, number>
      );
      setResult(verdict(nextScores, perLevel));
    }
  }

  function save() {
    if (!result) return;
    setError(null);
    startTransition(async () => {
      try {
        await setCefrLevel(result);
        setSaved(true);
        // A score is not an answer to "what now?" — fetch the actual unit
        // this learner should open first.
        setStartUnit(await getStartUnit().catch(() => null));
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
                {l} · {scores[l]}/
                {asked.filter((a) => a.level === l).length}
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

          {saved && startUnit ? (
            <Link
              href={`/unidades/${startUnit.slug}`}
              className="group mt-5 block rounded-2xl border border-olive/30 bg-sage-pale/70 p-4 text-left transition-all hover:border-olive hover:shadow-md"
            >
              <div className="text-[11px] font-semibold tracking-widest text-olive/70 uppercase">
                Começa aqui
              </div>
              <div className="font-display text-lg font-semibold text-olive group-hover:underline">
                {startUnit.title}
              </div>
              {startUnit.titlePt ? (
                <div className="text-sm text-ink-faint">{startUnit.titlePt}</div>
              ) : null}
              <p className="mt-1 text-sm text-ink-soft">
                The first unit of your {result} course — read the note, then
                work the path through it. →
              </p>
            </Link>
          ) : saved ? (
            <p className="mt-3 text-sm text-olive">
              Nível guardado. Os testes, lições e histórias já vêm em {result}.
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
