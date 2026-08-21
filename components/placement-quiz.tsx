"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AudioButton } from "@/components/audio-button";
import { LearningPlanCard } from "@/components/learning-plan";
import { Bi } from "@/components/bilingual";
import { getStartUnit } from "@/lib/actions/course";
import { gradeBlock, placementBlock } from "@/lib/actions/placement";
import { setCefrLevel } from "@/lib/actions/profile";
import {
  BLOCK_SIZE,
  LEVELS,
  passMarkFor,
  placeAt,
  type Level,
} from "@/lib/placement-types";
import type { PublicItem } from "@/lib/placement";
import type { PlacementSummary } from "@/lib/placement-record";
import { cn } from "@/lib/utils";

/** What the summary endpoint returns — the record shape minus what we add. */
type PlacementSummaryView = Omit<PlacementSummary, "level" | "gaps" | "at"> & {
  gapsEn: { topicEn: string; whyEn: string }[];
  /** The actual questions they missed. Absent when they missed nothing. */
  review?: {
    level: string;
    asked: string;
    pt: string;
    given: string;
    correct: string;
  }[];
};

/**
 * Portuguese with the English under it — ALWAYS, not via <Bi>.
 *
 * <Bi> follows the household's bilingual setting, which defaults to OFF and
 * belongs to a household that has not been created yet when somebody sits this
 * test. The placement result is the first thing a learner reads about their own
 * Portuguese, and it is read by people who may not have any: telling them in
 * Portuguese alone that the test has ended and where they have been placed is
 * the one place in the app that cannot afford to be misunderstood.
 *
 * The intro screen already prints both. This is the rest of the screen catching
 * up with it.
 */
function Both({ pt, en }: { pt: React.ReactNode; en: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-ink-soft">{pt}</p>
      <p className="text-sm text-ink-faint">{en}</p>
    </div>
  );
}

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

type Tally = { right: number; asked: number };
const emptyScores = (): Record<Level, Tally> => ({
  A1: { right: 0, asked: 0 },
  A2: { right: 0, asked: 0 },
  B1: { right: 0, asked: 0 },
  B2: { right: 0, asked: 0 },
});

const KIND_LABEL: Record<PublicItem["kind"], string> = {
  choice: "Escolhe",
  gap: "Completa a frase",
  dictation: "Ouve e escreve",
  write: "Escreve em português",
  wordbank: "Constrói a frase",
};

/**
 * The placement test.
 *
 * Five kinds of question, not one. A test made entirely of four-option
 * multiple choice measures recognition and nothing else — you can pass it
 * without ever producing a word of Portuguese, which is exactly the skill a
 * placement needs to measure. Typing what you heard, writing a sentence from
 * scratch and reordering one you are given each probe something recognition
 * hides.
 *
 * It starts at A1 and climbs. Everyone begins a beginner unless they show
 * otherwise, so the first question is one an A1 learner can answer — starting
 * at A2 opened the test with something a true beginner cannot do, which is a
 * discouraging first impression of a language app.
 *
 * The bank and the marking live on the server (lib/placement.ts); this holds
 * only what has been asked and how it went.
 */
export function PlacementQuiz({ savedLevel }: { savedLevel?: string }) {
  /**
   * The WHOLE current section, held client-side.
   *
   * One question at a time made going back impossible — the previous question
   * was gone and nothing could rebuild it. A section is a fixed set, so it is
   * fetched whole (answers stripped server-side) and the learner moves around
   * inside it like a paper exam: reread, change an answer, come back to the
   * one they skipped. Nothing is marked until they submit the section.
   */
  const [block, setBlock] = useState<PublicItem[]>([]);
  const [idx, setIdx] = useState(0);
  /** questionId → what they typed or tapped. The single source of an answer. */
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [levelIdx, setLevelIdx] = useState(0); // A1, and only ever upwards
  const [scores, setScores] = useState(emptyScores);
  const [nearMisses, setNearMisses] = useState(0);
  const [blocksPassed, setBlocksPassed] = useState(0);
  /** Set when a block ends, so the learner is told before anything moves. */
  const [gate, setGate] = useState<
    { level: Level; right: number; of: number; passed: boolean } | null
  >(null);
  /** What they got wrong, for the AI summary. Ids only — the server re-reads
      the questions itself and never trusts the client for a right answer. */
  const [misses, setMisses] = useState<{ id: string; given: string }[]>([]);
  const [summary, setSummary] = useState<PlacementSummaryView | null>(null);
  const [summaryState, setSummaryState] = useState<"idle" | "loading" | "off">("idle");
  const [result, setResult] = useState<Level | null>(null);
  const [saved, setSaved] = useState(false);
  const [startUnit, setStartUnit] = useState<{
    slug: string;
    title: string;
    titlePt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** "Recomeçar" asks twice — it discards a whole section's answers. */
  const [confirmReset, setConfirmReset] = useState(false);
  const [pending, startTransition] = useTransition();

  const current = block[idx];
  /** The answer held for the question on screen, in each kind's own shape. */
  const given = current ? (answers[current.id] ?? "") : "";
  const picked = given ? given.split(" ").filter(Boolean) : [];
  const answeredCount = block.filter((q) => (answers[q.id] ?? "").trim()).length;

  function setAnswer(value: string) {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: value }));
  }

  function reset() {
    setBlock([]);
    setIdx(0);
    setAnswers({});
    setLevelIdx(0);
    setScores(emptyScores());
    setNearMisses(0);
    setBlocksPassed(0);
    setMisses([]);
    setSummary(null);
    setSummaryState("idle");
    setGate(null);
    setResult(null);
    setSaved(false);
    setStartUnit(null);
    setError(null);
    setConfirmReset(false);
  }

  async function start() {
    setBusy(true);
    const first = await placementBlock(0).catch(() => []);
    setBusy(false);
    if (first.length === 0) {
      setError("O teste não está disponível.");
      return;
    }
    reset();
    setBlock(first);
    setIdx(0);
  }

  /** Move inside the section. Both directions, freely, before submitting. */
  function goTo(next: number) {
    if (busy) return;
    setIdx(Math.max(0, Math.min(block.length - 1, next)));
  }

  /**
   * Submit the whole section and mark it — once.
   *
   * Nothing is graded until this runs, which is what makes going back
   * possible: an answer can be changed as often as they like right up to here,
   * with no running total to unpick. It is also what keeps the test honest —
   * marking each answer as it was given told the browser how every question
   * landed, one at a time, which is the answer key in instalments.
   *
   * Unanswered questions are marked wrong by the server, so skipping is never
   * cheaper than guessing.
   */
  async function submitBlock() {
    if (busy || block.length === 0) return;
    setBusy(true);
    const level = LEVELS[levelIdx];
    let res;
    try {
      res = await gradeBlock(levelIdx, answers);
    } catch {
      setBusy(false);
      setError("Não deu para corrigir a secção. Tenta outra vez.");
      return;
    }
    setBusy(false);

    setScores((sc) => ({ ...sc, [level]: { right: res.right, asked: res.of } }));
    setNearMisses((n) => n + res.nearMisses);
    setMisses((list) => [...list, ...res.misses]);
    if (res.passed) setBlocksPassed(levelIdx + 1);
    setGate({ level, right: res.right, of: res.of, passed: res.passed });
  }

  /** Continue past a cleared block, or end the test at a failed one. */
  async function continuePastGate() {
    if (!gate) return;
    const passedSoFar = gate.passed ? levelIdx + 1 : levelIdx;

    // A failed section ends the test THERE. Nothing above it can be cleared
    // once a level has been missed, so asking more questions would only be
    // asking somebody to guess at grammar they have not met.
    if (!gate.passed || levelIdx + 1 >= LEVELS.length) {
      setGate(null);
      const placed = placeAt(passedSoFar);
      setResult(placed);
      void loadSummary(placed);
      return;
    }

    const nextIdx = levelIdx + 1;
    setBusy(true);
    const next = await placementBlock(nextIdx).catch(() => []);
    setBusy(false);
    if (next.length === 0) {
      setGate(null);
      const placed = placeAt(passedSoFar);
      setResult(placed);
      void loadSummary(placed);
      return;
    }
    setGate(null);
    setLevelIdx(nextIdx);
    setBlock(next);
    setIdx(0);
  }

  /**
   * Sandra's read on the result.
   *
   * Fetched once, and allowed to fail: the level is already decided and saved
   * without it. If the household has spent its AI allowance, or the model is
   * unreachable, the result screen simply has one card fewer rather than a
   * broken placement.
   */
  async function loadSummary(level: Level) {
    setSummaryState("loading");
    try {
      const perLevel = LEVELS.reduce(
        (acc, l) => ({ ...acc, [l]: scores[l] }),
        {} as Record<string, { right: number; asked: number }>
      );
      const res = await fetch("/api/ai/placement-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, perLevel, nearMisses, misses }),
      });
      if (!res.ok) return setSummaryState("off");
      setSummary(await res.json());
      setSummaryState("idle");
    } catch {
      setSummaryState("off");
    }
  }

  function save() {
    if (!result) return;
    setError(null);
    startTransition(async () => {
      try {
        await setCefrLevel(result);
        setSaved(true);
        setStartUnit(await getStartUnit().catch(() => null));
      } catch {
        setError("Não deu para guardar. Tenta outra vez.");
      }
    });
  }

  // ── Between sections ────────────────────────────────────────────────
  if (gate) {
    const nextLevel = LEVELS[levelIdx + 1];
    return (
      <div className="card space-y-3 p-6 text-center">
        <div className="text-4xl" aria-hidden>
          {gate.passed ? "🎉" : "🌱"}
        </div>
        {/*
          A score mid-test is a result, and a result mid-test is a reason to
          restart. Somebody who cleared A1 is told only that they cleared it;
          the numbers arrive with the level at the end. When the run is OVER
          the score is not a steer any more, so a failed section shows it.
        */}
        <h2 className="font-display text-2xl font-semibold">
          {gate.passed
            ? `Secção ${gate.level} terminada`
            : `Secção ${gate.level}: ${gate.right}/${gate.of}`}
        </h2>
        <p className="-mt-2 text-xs text-ink-faint">
          {gate.passed
            ? `Section ${gate.level} finished`
            : `Section ${gate.level}: ${gate.right} of ${gate.of}`}
        </p>
        {gate.passed ? (
          nextLevel ? (
            <Both
              pt={
                <>
                  Passaste. A seguir vêm as perguntas de{" "}
                  <strong>{nextLevel}</strong> — se ficarem difíceis, para aí
                  mesmo. É suposto.
                </>
              }
              en={
                <>
                  You passed. Next come the <strong>{nextLevel}</strong>{" "}
                  questions — if they get hard, stop there. That is how this
                  works.
                </>
              }
            />
          ) : (
            <Both
              pt="Passaste tudo. Não há nível acima deste no teste."
              en="You cleared everything. There is no level above this one in the test."
            />
          )
        ) : (
          /* Failing is the mechanism, not a verdict on the person. Say what
             happens next in the same breath as what went wrong — and say it in
             both languages, because this is the sentence that tells somebody
             the test is over. */
          <Both
            pt={
              <>
                Precisavas de {passMarkFor(gate.of)} para avançar, por isso o
                teste fica por aqui — é assim que funciona. Começas em{" "}
                <strong>{placeAt(levelIdx)}</strong>, que é exatamente onde o
                curso te vai ser útil.
              </>
            }
            en={
              <>
                You needed {passMarkFor(gate.of)} to move up, so the test stops
                here — that is how it is meant to work. You start at{" "}
                <strong>{placeAt(levelIdx)}</strong>, which is exactly where the
                course will be useful to you.
              </>
            }
          />
        )}
        <button
          className="btn-primary w-full"
          disabled={busy}
          onClick={() => void continuePastGate()}
        >
          {busy ? (
            <Bi pt="Um momento…" en="One moment…" inline />
          ) : gate.passed && nextLevel ? (
            <Bi
              pt={`Continuar para ${nextLevel} →`}
              en={`Continue to ${nextLevel}`}
              inline
            />
          ) : (
            <Bi pt="Ver o meu nível" en="See my level" inline />
          )}
        </button>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────
  if (result) {
    const total = LEVELS.reduce((sum, l) => sum + scores[l].right, 0);
    const totalAsked = LEVELS.reduce((sum, l) => sum + scores[l].asked, 0);
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          {totalAsked > 0 ? (
            <div>
              <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                Acertaste {total} de {totalAsked}
                {nearMisses > 0
                  ? ` · ${nearMisses} com pequenos erros de escrita`
                  : ""}
              </p>
              <p className="text-xs text-ink-faint">
                You got {total} of {totalAsked} right
                {nearMisses > 0
                  ? ` · ${nearMisses} counted despite small spelling slips`
                  : ""}
              </p>
            </div>
          ) : (
            <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Começar do início · Starting from the beginning
            </p>
          )}
          <h2 className="mt-2 font-display text-3xl font-semibold">
            O teu nível: {result}
          </h2>
          <p className="text-xs text-ink-faint">Your level: {result}</p>
          <p className="mt-2 text-ink-soft">{BLURB[result].pt}</p>
          <p className="mt-1 text-sm text-ink-faint">{BLURB[result].en}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {LEVELS.map((l) => {
              const n = scores[l].asked;
              return n > 0 ? (
                <span key={l} className="chip">
                  {l} · {scores[l].right}/{n}
                </span>
              ) : null;
            })}
          </div>

          {/* Sandra's read, grounded in what they actually missed. Additive:
              if the AI is unavailable the level still stands. */}
          {summaryState === "loading" ? (
            <p className="mt-4 text-sm text-ink-faint">
              A Sandra está a ler as tuas respostas…
            </p>
          ) : summary ? (
            <div className="mt-5 space-y-3 border-t border-sand pt-4 text-left">
              <p className="text-sm text-ink">{summary.headlineEn}</p>

              {summary.canDoEn?.length > 0 ? (
                <div>
                  <p className="label">Já consegues · What you can do</p>
                  <ul className="mt-1 space-y-1">
                    {summary.canDoEn.map((c, i) => (
                      <li key={i} className="text-sm text-ink-soft">
                        ✓ {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {summary.gapsEn?.length > 0 ? (
                <div>
                  <p className="label">A trabalhar · To work on</p>
                  <div className="mt-1 space-y-1.5">
                    {summary.gapsEn.map((g, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-sand bg-white/70 px-3 py-2"
                      >
                        <p className="text-sm font-medium">{g.topicEn}</p>
                        <p className="text-xs text-ink-soft">{g.whyEn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/*
                The questions themselves, not just the themes.
                Nothing is shown during the run any more, so this is the only
                moment a learner finds out what they actually missed — and a
                theme is not reviewable without the sentence that produced it.
                "Your past tense is inconsistent" teaches nobody; the sentence
                they wrote, next to the one they meant, teaches immediately.
              */}
              {summary.review && summary.review.length > 0 ? (
                <div>
                  <p className="label">O que escapou · What slipped</p>
                  <div className="mt-1 space-y-1.5">
                    {summary.review.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-sand bg-white/70 px-3 py-2"
                      >
                        <p className="text-xs text-ink-faint">
                          {r.level} · {r.asked}
                          {r.pt ? ` — ${r.pt}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-terra-dark line-through decoration-terra/50">
                          {r.given || "(em branco)"}
                        </p>
                        {/* Here the answer is already shown, so hearing it is
                            the point — this is the correction, not the test. */}
                        <div className="flex items-center gap-2">
                          <p className="font-display text-base font-semibold text-olive">
                            {r.correct}
                          </p>
                          <AudioButton text={r.correct} className="shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl bg-azul-pale/60 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-azul uppercase">
                  Primeiro passo · First step
                </p>
                <p className="mt-0.5 text-sm text-azul">{summary.focusEn}</p>
              </div>

              <p className="rounded-xl bg-sage-pale/60 px-3 py-2 text-sm text-olive">
                👩‍🏫 {summary.encouragementPt}
              </p>
              <p className="text-2xs text-ink-faint">
                O plano em baixo vem destes resultados. A seguir, umas
                perguntas rápidas sobre como gostas de estudar — a Sandra refaz
                o plano com essas respostas.
                <span className="mt-1 block text-ink-faint">
                  The plan below comes from these results. Next come a few quick
                  questions about how you like to study — Sandra rebuilds the
                  plan with those answers.
                </span>
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button className="btn-terra" onClick={save} disabled={pending || saved}>
              {saved ? (
                <Bi pt="Guardado ✓" en="Saved" inline />
              ) : pending ? (
                <Bi pt="A guardar…" en="Saving…" inline />
              ) : (
                <Bi pt="Guardar o meu nível" en="Save my level" inline />
              )}
            </button>
            <button className="btn-ghost" onClick={start}>
              <Bi pt="Repetir" en="Take it again" inline />
            </button>
          </div>

          {saved && startUnit ? (
            <Link
              href={`/unidades/${startUnit.slug}`}
              className="group mt-5 block rounded-2xl border border-olive/30 bg-sage-pale/70 p-4 text-left transition-all hover:border-olive hover:shadow-md"
            >
              <div className="text-2xs font-semibold tracking-widest text-olive/70 uppercase">
                Começa aqui · Start here
              </div>
              <div className="font-display text-lg font-semibold text-olive group-hover:underline">
                {startUnit.title}
              </div>
              {startUnit.titlePt ? (
                <div className="text-sm text-ink-faint">{startUnit.titlePt}</div>
              ) : null}
              <p className="mt-1 text-sm text-ink-soft">
                The first unit of your {result} course — read the note, then work
                the path through it. →
              </p>
            </Link>
          ) : saved ? (
            <p className="mt-3 text-sm text-olive">
              Nível guardado. Os testes, lições e histórias já vêm em {result}.
              <span className="mt-0.5 block text-ink-faint">
                Level saved. Quizzes, lessons and stories now arrive at {result}.
              </span>
            </p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-terra-dark">{error}</p> : null}
        </div>

        {/*
          The plan, on the same screen as the result.

          Knowing you are A2 is a filing code; knowing what to open first is
          the answer to the question the learner actually asked. It builds from
          the gaps this run just found (the summary endpoint stores them), so
          it can only appear once the level is saved — and the questionnaire
          rebuilds it afterwards with how they like to study, which is the
          other half of a plan.
        */}
        {saved ? (
          <div className="text-left">
            <p className="label mb-2">
              O teu plano · Your plan
            </p>
            <LearningPlanCard initial={null} />
          </div>
        ) : null}
      </div>
    );
  }

  // ── Intro ───────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="card space-y-3 p-6">
        <p className="text-ink-soft">
          Começas em A1 com {BLOCK_SIZE} perguntas, das mais fáceis para as mais
          difíceis. Precisas de {passMarkFor(BLOCK_SIZE)} certas para abrir a
          secção A2, depois B1, depois B2 — e o teste para assim que uma secção
          te escapar. Podes voltar atrás e mudar respostas antes de entregar.
        </p>
        <p className="text-sm text-ink-faint">
          A ladder, not a quiz: {BLOCK_SIZE} questions per level, easiest first,
          and it stops at the first section you don&apos;t clear — so you are
          never asked to guess at grammar you haven&apos;t met. You can move
          back and forth and change any answer before you hand a section in.
          Small typos and missing accents still count as correct.
        </p>
        {savedLevel ? (
          <p className="text-sm text-ink-soft">
            <Bi pt="Nível guardado neste momento" en="Your saved level" inline />:{" "}
            <span className="chip">{savedLevel}</span>
          </p>
        ) : null}
        {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
        {/*
          ONE button. There used to be a second, low-emphasis one underneath
          that placed you at A1 on the spot — and in Portuguese only, so it read
          as "some other way to begin" to anyone who could not read it. People
          were ending the test by pressing it.

          It is not needed any more either: a true beginner who simply answers
          the A1 section is placed at A1 anyway (a missed first section places
          you at the floor), and nothing is marked in front of them while they
          do it, so it is no longer seven questions of visible failure.
        */}
        <button className="btn-terra" onClick={start} disabled={busy || pending}>
          {busy ? (
            <Bi pt="A preparar…" en="Getting ready…" inline />
          ) : (
            <Bi pt="Começar 🧭" en="Start" inline />
          )}
        </button>
      </div>
    );
  }

  // ── Question ────────────────────────────────────────────────────────
  const typedKind = current.kind === "dictation" || current.kind === "write";
  const blockLength = block.length;
  const onLast = idx === blockLength - 1;

  return (
    <div className="space-y-4">
      {/* Progress is within the SECTION, not the whole test — the whole test
          has no fixed length any more, and "3 of 7 at A1" is a promise the
          screen can keep. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="chip bg-olive text-paper">
          Secção {LEVELS[levelIdx]}
        </span>
        <span className="text-xs text-ink-faint">
          {blocksPassed > 0
            ? `${LEVELS.slice(0, blocksPassed).join(" · ")} ✓`
            : "a começar"}
        </span>
      </div>
      {/*
        Tappable, not decorative. Once the learner can move around the section,
        the progress bar is the map — filled means answered, and any square is
        one tap away. Real tap targets (h-1.5 alone is unhittable on a phone),
        so each bar sits inside a 44px-tall button.
      */}
      <div className="flex items-center gap-1.5">
        {block.map((q, i) => {
          const done = (answers[q.id] ?? "").trim().length > 0;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => goTo(i)}
              disabled={busy}
              aria-label={`Pergunta ${i + 1}${done ? " (respondida)" : ""}`}
              aria-current={i === idx ? "step" : undefined}
              className="tap-44 flex flex-1 items-center py-2"
            >
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  i === idx
                    ? "bg-terra"
                    : done
                      ? "bg-olive"
                      : "bg-sand"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {LEVELS[levelIdx]} · <Bi pt="pergunta" en="question" inline />{" "}
            {idx + 1} / {blockLength}
          </p>
          <span className="chip bg-cream text-ink-soft">
            {KIND_LABEL[current.kind]}
          </span>
        </div>

        <h2 className="mt-2 text-lg font-semibold">{current.promptEn}</h2>
        {/*
          Hear the sentence — but ONLY the prompt, never an answer.

          A gap or a choice shows its Portuguese on screen already, so reading
          it aloud adds listening practice and gives nothing away. A `write` or
          `wordbank` item is the opposite: its answer is the thing being asked
          for and never leaves the server, so there is deliberately no speak
          button on those. Dictation has its own, below — there, the audio IS
          the question.
        */}
        {current.promptPt ? (
          <div className="mt-1 flex items-start gap-2">
            <p className="font-display text-xl text-ink-soft">
              {current.promptPt}
            </p>
            <AudioButton
              text={current.promptPt}
              className="mt-1 shrink-0"
            />
          </div>
        ) : null}

        {/* Dictation: the sentence never comes to the browser, so the audio is
            requested by item id exactly like ditado does it. */}
        {current.kind === "dictation" ? (
          <div className="mt-3 flex items-center gap-3">
            <AudioButton placementId={current.id} label="Ouvir" />
            <span className="text-xs text-ink-faint">
              (ouve as vezes que precisares)
            </span>
          </div>
        ) : null}

        {/* Choice and gap */}
        {current.options ? (
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => {
              // Selected is shown; RIGHT is not. Tapping records the choice
              // and moves on, but the choice stays changeable — come back and
              // tap another and it simply replaces this one.
              const chosen = given === opt;
              return (
                <button
                  key={opt}
                  disabled={busy}
                  onClick={() => {
                    setAnswer(opt);
                    if (!onLast) goTo(idx + 1);
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition-all",
                    chosen
                      ? "border-olive bg-cream"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Wordbank: tap tiles in order, tap a chosen one to take it back. */}
        {current.kind === "wordbank" && current.tiles ? (
          <div className="mt-4 space-y-3">
            <div className="min-h-[52px] rounded-xl border border-dashed border-sand bg-cream/60 p-2">
              {picked.length === 0 ? (
                <span className="text-sm text-ink-faint">
                  Toca nas palavras pela ordem certa…
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {picked.map((w, i) => (
                    <button
                      key={`${w}-${i}`}
                      disabled={busy}
                      onClick={() =>
                        setAnswer(picked.filter((_, j) => j !== i).join(" "))
                      }
                      className="rounded-lg bg-olive px-2.5 py-1.5 text-sm text-paper"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {current.tiles.map((w, i) => {
                // A word can legitimately appear twice, so spend tiles by
                // POSITION rather than by value.
                const spent = picked.filter((p) => p === w).length;
                const before = current.tiles!.slice(0, i).filter((t) => t === w).length;
                const used = before < spent;
                return (
                  <button
                    key={`${w}-${i}`}
                    disabled={used || busy}
                    onClick={() => setAnswer([...picked, w].join(" "))}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-sm transition-all",
                      used
                        ? "border-sand/60 bg-cream text-ink-faint/50"
                        : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Dictation and free writing */}
        {typedKind ? (
          <textarea
            value={given}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                if (onLast) void submitBlock();
                else goTo(idx + 1);
              }
            }}
            rows={2}
            disabled={busy}
            className="input mt-4 resize-y"
            placeholder={
              current.kind === "dictation"
                ? "Escreve o que ouves…"
                : "Escreve em português…"
            }
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        ) : null}

      </div>

      {/*
        Move, don't commit. Nothing is marked until the section is handed in,
        so every one of these is reversible — which is the whole point of being
        able to go back. Bilingual because a learner who cannot read the button
        cannot know which of these ends anything.
      */}
      <div className="flex items-center gap-2">
        <button
          className="btn-ghost"
          onClick={() => goTo(idx - 1)}
          disabled={busy || idx === 0}
        >
          <Bi pt="← Anterior" en="Back" inline />
        </button>

        {onLast ? (
          <button
            className="btn-terra flex-1"
            onClick={() => void submitBlock()}
            disabled={busy}
          >
            {busy ? (
              <Bi pt="A corrigir…" en="Marking…" inline />
            ) : (
              <Bi
                pt={`Entregar secção ${LEVELS[levelIdx]}`}
                en="Hand in this section"
                inline
              />
            )}
          </button>
        ) : (
          <button
            className="btn-primary flex-1"
            onClick={() => goTo(idx + 1)}
            disabled={busy}
          >
            <Bi pt="Seguinte →" en="Next" inline />
          </button>
        )}
      </div>

      {/* Answered count, and the early way out once everything is filled in —
          nobody should have to walk back to the last question to hand in. */}
      <p className="text-center text-xs text-ink-faint">
        <Bi
          pt={`${answeredCount} de ${blockLength} respondidas`}
          en={`${answeredCount} of ${blockLength} answered`}
          inline
        />
        {answeredCount < blockLength ? (
          <>
            {" · "}
            <Bi
              pt="as que ficarem em branco contam como erradas"
              en="blanks count as wrong"
              inline
            />
          </>
        ) : null}
      </p>
      {!onLast && answeredCount === blockLength ? (
        <button
          className="btn-ghost w-full"
          onClick={() => void submitBlock()}
          disabled={busy}
        >
          <Bi
            pt={`Entregar secção ${LEVELS[levelIdx]}`}
            en="Hand in this section"
            inline
          />
        </button>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      {/* Two taps, because it throws away every answer in the section. */}
      <button
        className="btn-ghost"
        onClick={() => {
          if (confirmReset) reset();
          else setConfirmReset(true);
        }}
        disabled={busy}
      >
        {confirmReset ? (
          <Bi
            pt="Tens a certeza? Perdes as respostas"
            en="Sure? This clears your answers"
            inline
          />
        ) : (
          <Bi pt="Recomeçar" en="Start over" inline />
        )}
      </button>
    </div>
  );
}
