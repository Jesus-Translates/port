"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AudioButton } from "@/components/audio-button";
import { getStartUnit } from "@/lib/actions/course";
import {
  gradePlacement,
  nextPlacementItem,
  placementBlockSizes,
} from "@/lib/actions/placement";
import { setCefrLevel } from "@/lib/actions/profile";
import {
  BLOCK_SIZE,
  LEVELS,
  passMarkFor,
  placeAt,
  type Level,
  type PublicItem,
} from "@/lib/placement";
import type { PlacementSummary } from "@/lib/placement-record";
import { cn } from "@/lib/utils";

/** What the summary endpoint returns — the record shape minus what we add. */
type PlacementSummaryView = Omit<PlacementSummary, "level" | "gaps" | "at"> & {
  gapsEn: { topicEn: string; whyEn: string }[];
};

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
  const [asked, setAsked] = useState<PublicItem[]>([]);
  const [levelIdx, setLevelIdx] = useState(0); // A1, and only ever upwards
  const [scores, setScores] = useState(emptyScores);
  const [nearMisses, setNearMisses] = useState(0);
  /** Right answers in the CURRENT block; reset when a new level opens. */
  const [blockRight, setBlockRight] = useState(0);
  const [blockAsked, setBlockAsked] = useState(0);
  const [blocksPassed, setBlocksPassed] = useState(0);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  /** Set when a block ends, so the learner is told before anything moves. */
  const [gate, setGate] = useState<
    { level: Level; right: number; of: number; passed: boolean } | null
  >(null);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string[]>([]); // wordbank tiles chosen
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
  const [pending, startTransition] = useTransition();

  const current = asked[asked.length - 1];

  function reset() {
    setAsked([]);
    setLevelIdx(0);
    setScores(emptyScores());
    setNearMisses(0);
    setBlockRight(0);
    setBlockAsked(0);
    setBlocksPassed(0);
    setMisses([]);
    setSummary(null);
    setSummaryState("idle");
    setGate(null);
    setTyped("");
    setPicked([]);
    setResult(null);
    setSaved(false);
    setStartUnit(null);
    setError(null);
  }

  async function start() {
    setBusy(true);
    const [first, blockSizes] = await Promise.all([
      nextPlacementItem([], 0),
      placementBlockSizes().catch(() => ({})),
    ]);
    setBusy(false);
    if (!first) {
      setError("O teste não está disponível.");
      return;
    }
    reset();
    setSizes(blockSizes);
    setAsked([first]);
    setBlockAsked(1);
  }

  /**
   * "I have never learned any Portuguese" — the honest answer for a lot of
   * people, and until now the app made them prove it.
   *
   * A true beginner facing a test they cannot answer is the worst possible
   * first screen: seven questions of failure to arrive at the level they
   * already told us they were. The placement exists to find people who are
   * FURTHER ALONG than A1; somebody who says they are not needs no test.
   *
   * Same end state as a completed run — setCefrLevel writes the "Nível
   * definido" activity row that hasBeenPlaced() reads, so onboarding advances
   * exactly as it would have. No AI summary: there are no answers to read, and
   * inventing an assessment of somebody who answered nothing would be a lie.
   */
  function startAtA1() {
    setError(null);
    startTransition(async () => {
      try {
        await setCefrLevel("A1");
        reset();
        setResult("A1");
        setSaved(true);
        setStartUnit(await getStartUnit().catch(() => null));
      } catch {
        setError("Não deu para guardar. Tenta outra vez.");
      }
    });
  }

  /** The learner's answer for the current kind, as one string. */
  function answerText(): string {
    if (!current) return "";
    return current.kind === "wordbank" ? picked.join(" ") : typed;
  }

  /**
   * Answer, and move straight on — WITHOUT saying whether it was right.
   *
   * This used to grade in view: a tick, a cross, and the correct answer, one
   * question at a time. On a practice screen that is the right call. On a
   * PLACEMENT test it hands out the answer key one question at a time, and it
   * tells you the moment you are off course — so the cheapest move is to
   * restart and run the same block again knowing what is coming. A test you
   * can re-roll until it flatters you does not measure anything, and the prize
   * for winning it is being put in a level you cannot follow.
   *
   * So nothing is revealed until the whole run ends. Every correction still
   * gets shown — at the end, with the level, where it teaches instead of
   * steering. Grading stays on the server either way; this only changes what
   * comes back down.
   */
  async function check(explicit?: string) {
    if (!current || busy) return;
    const given = explicit ?? answerText();
    if (!given.trim()) return;
    setBusy(true);
    const m = await gradePlacement(current.id, given);
    if (!m) {
      setBusy(false);
      return;
    }

    // Tallied into a local as well as into state: the block decision below
    // runs in this same tick, and setBlockRight has not landed yet. Reading
    // the state variable here would decide the block on a stale count and
    // fail somebody who had just passed.
    const right = blockRight + (m.correct ? 1 : 0);
    if (m.correct) {
      setScores((s) => ({ ...s, [m.level]: s[m.level] + 1 }));
      setBlockRight(right);
      if (m.mark === "quase") setNearMisses((n) => n + 1);
    } else {
      setMisses((list) => [...list, { id: current.id, given }]);
    }

    setTyped("");
    setPicked([]);

    const next = await nextPlacementItem(
      asked.map((a) => a.id),
      levelIdx
    );
    setBusy(false);

    if (next) {
      setAsked([...asked, next]);
      setBlockAsked((n) => n + 1);
      return;
    }

    // Block finished. The block is the unit of decision, not the question.
    const level = LEVELS[levelIdx];
    const of = sizes[level] ?? blockAsked;
    const passed = right >= passMarkFor(of);
    setGate({ level, right, of, passed });
    if (passed) setBlocksPassed(levelIdx + 1);
  }

  /** Continue past a cleared block, or end the test at a failed one. */
  async function continuePastGate() {
    if (!gate) return;
    const passedSoFar = gate.passed ? levelIdx + 1 : levelIdx;

    if (!gate.passed || levelIdx + 1 >= LEVELS.length) {
      setGate(null);
      const placed = placeAt(passedSoFar);
      setResult(placed);
      void loadSummary(placed);
      return;
    }

    const nextIdx = levelIdx + 1;
    setBusy(true);
    const next = await nextPlacementItem(
      asked.map((a) => a.id),
      nextIdx
    );
    setBusy(false);
    if (!next) {
      setGate(null);
      const placed = placeAt(passedSoFar);
      setResult(placed);
      void loadSummary(placed);
      return;
    }
    setGate(null);
    setLevelIdx(nextIdx);
    setBlockRight(0);
    setBlockAsked(1);
    setAsked([...asked, next]);
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
        (acc, l) => ({
          ...acc,
          [l]: { right: scores[l], asked: asked.filter((a) => a.level === l).length },
        }),
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
        {gate.passed ? (
          <p className="text-sm text-ink-soft">
            {nextLevel ? (
              <>
                Passaste. A seguir vêm as perguntas de{" "}
                <strong>{nextLevel}</strong> — se ficarem difíceis, para aí
                mesmo. É suposto.
              </>
            ) : (
              <>Passaste tudo. Não há nível acima deste no teste.</>
            )}
          </p>
        ) : (
          /* Failing is the mechanism, not a verdict on the person. Say what
             happens next in the same breath as what went wrong. */
          <p className="text-sm text-ink-soft">
            Precisavas de {passMarkFor(gate.of)} para avançar, por isso o teste
            fica por aqui — é assim que funciona. Começas em{" "}
            <strong>{placeAt(levelIdx)}</strong>, que é exatamente onde o curso
            te vai ser útil.
          </p>
        )}
        <button
          className="btn-primary w-full"
          disabled={busy}
          onClick={() => void continuePastGate()}
        >
          {busy
            ? "Um momento…"
            : gate.passed && nextLevel
              ? `Continuar para ${nextLevel} →`
              : "Ver o meu nível"}
        </button>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────
  if (result) {
    const total = LEVELS.reduce((sum, l) => sum + scores[l], 0);
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          {asked.length > 0 ? (
            <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Acertaste {total} de {asked.length}
              {nearMisses > 0
                ? ` · ${nearMisses} com pequenos erros de escrita`
                : ""}
            </p>
          ) : (
            <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Começar do início
            </p>
          )}
          <h2 className="mt-2 font-display text-3xl font-semibold">
            O teu nível: {result}
          </h2>
          <p className="mt-2 text-ink-soft">{BLURB[result].pt}</p>
          <p className="mt-1 text-sm text-ink-faint">{BLURB[result].en}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {LEVELS.map((l) => {
              const n = asked.filter((a) => a.level === l).length;
              return n > 0 ? (
                <span key={l} className="chip">
                  {l} · {scores[l]}/{n}
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
                  <p className="label">Já consegues</p>
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
                  <p className="label">A trabalhar</p>
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

              <div className="rounded-xl bg-azul-pale/60 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-azul uppercase">
                  Primeiro passo
                </p>
                <p className="mt-0.5 text-sm text-azul">{summary.focusEn}</p>
              </div>

              <p className="rounded-xl bg-sage-pale/60 px-3 py-2 text-sm text-olive">
                👩‍🏫 {summary.encouragementPt}
              </p>
              <p className="text-2xs text-ink-faint">
                A seguir, umas perguntas rápidas sobre como gostas de estudar —
                é com elas que a Sandra monta o teu plano.
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button className="btn-terra" onClick={save} disabled={pending || saved}>
              {saved ? "Guardado ✓" : pending ? "A guardar…" : "Guardar o meu nível"}
            </button>
            <button className="btn-ghost" onClick={start}>
              Repetir
            </button>
          </div>

          {saved && startUnit ? (
            <Link
              href={`/unidades/${startUnit.slug}`}
              className="group mt-5 block rounded-2xl border border-olive/30 bg-sage-pale/70 p-4 text-left transition-all hover:border-olive hover:shadow-md"
            >
              <div className="text-2xs font-semibold tracking-widest text-olive/70 uppercase">
                Começa aqui
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
            </p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-terra-dark">{error}</p> : null}
        </div>
      </div>
    );
  }

  // ── Intro ───────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="card space-y-3 p-6">
        <p className="text-ink-soft">
          Começas em A1 com {sizes.A1 ?? BLOCK_SIZE} perguntas. Se passares,
          abre a secção A2, depois B1, depois B2 — e o teste pára assim que uma
          secção te escapar. Escolher, completar, ouvir e escrever, construir
          frases.
        </p>
        <p className="text-sm text-ink-faint">
          A ladder, not a quiz: {BLOCK_SIZE} questions per level, and it stops
          at the first section you don&apos;t clear — so you are never asked to
          guess at grammar you haven&apos;t met. Small typos and missing accents
          still count as correct.
        </p>
        {savedLevel ? (
          <p className="text-sm text-ink-soft">
            Nível guardado neste momento: <span className="chip">{savedLevel}</span>
          </p>
        ) : null}
        {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
        <button className="btn-terra" onClick={start} disabled={busy || pending}>
          {busy ? "A preparar…" : "Começar 🧭"}
        </button>

        {/* The way out for somebody who does not need testing. Low emphasis,
            but plainly there — a beginner should not have to fail seven
            questions to be told what they already said. */}
        <button
          className="btn-ghost w-full"
          onClick={startAtA1}
          disabled={busy || pending}
        >
          {pending ? "A preparar…" : "Sou mesmo principiante — começar do início"}
        </button>
        <p className="text-2xs text-ink-faint">
          Nunca aprendeste português? Salta o teste. Ficas em A1 e podes fazer o
          teste mais tarde, a partir do teu perfil.
        </p>
      </div>
    );
  }

  // ── Question ────────────────────────────────────────────────────────
  const typedKind = current.kind === "dictation" || current.kind === "write";
  const blockLength = sizes[LEVELS[levelIdx]] ?? BLOCK_SIZE;

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
      <div className="flex items-center gap-1.5">
        {Array.from({ length: blockLength }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < blockAsked - 1
                ? "bg-olive"
                : i === blockAsked - 1
                  ? "bg-terra"
                  : "bg-sand"
            )}
          />
        ))}
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {LEVELS[levelIdx]} · pergunta {blockAsked} de {blockLength}
          </p>
          <span className="chip bg-cream text-ink-soft">
            {KIND_LABEL[current.kind]}
          </span>
        </div>

        <h2 className="mt-2 text-lg font-semibold">{current.promptEn}</h2>
        {current.promptPt ? (
          <p className="mt-1 font-display text-xl text-ink-soft">
            {current.promptPt}
          </p>
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
              // Selected is shown; RIGHT is not. The tap registers and the
              // next question arrives — no colour telling them how it went.
              const chosen = typed === opt;
              return (
                <button
                  key={opt}
                  disabled={busy}
                  onClick={() => {
                    setTyped(opt);
                    void check(opt);
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
                        setPicked((p) => p.filter((_, j) => j !== i))
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
                    onClick={() => setPicked((p) => [...p, w])}
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
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void check();
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
        One button, one meaning: record it and move on. The old pair —
        "Verificar" then "Continuar" — existed to show a result in between,
        and there is no result to show any more. Choice and gap submit on tap.
      */}
      {typedKind || current.kind === "wordbank" ? (
        <button
          className="btn-terra w-full"
          onClick={() => void check()}
          disabled={busy || !answerText().trim()}
        >
          {busy
            ? "A guardar…"
            : blockAsked >= blockLength
              ? `Terminar secção ${LEVELS[levelIdx]} →`
              : "Responder →"}
        </button>
      ) : null}

      <button className="btn-ghost" onClick={reset} disabled={busy}>
        Recomeçar
      </button>
    </div>
  );
}
