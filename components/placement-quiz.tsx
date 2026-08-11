"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AudioButton } from "@/components/audio-button";
import { getStartUnit } from "@/lib/actions/course";
import { gradePlacement, nextPlacementItem } from "@/lib/actions/placement";
import { setCefrLevel } from "@/lib/actions/profile";
import { LEVELS, RUN_LENGTH, verdict, type Level, type PublicItem } from "@/lib/placement";
import { cn } from "@/lib/utils";

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
  const [levelIdx, setLevelIdx] = useState(0); // start at A1
  const [scores, setScores] = useState(emptyScores);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string[]>([]); // wordbank tiles chosen
  const [mark, setMark] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
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
    setTyped("");
    setPicked([]);
    setMark(null);
    setResult(null);
    setSaved(false);
    setStartUnit(null);
    setError(null);
  }

  async function start() {
    setBusy(true);
    const first = await nextPlacementItem([], 0);
    setBusy(false);
    if (!first) {
      setError("O teste não está disponível.");
      return;
    }
    reset();
    setAsked([first]);
  }

  /** The learner's answer for the current kind, as one string. */
  function answerText(): string {
    if (!current) return "";
    return current.kind === "wordbank" ? picked.join(" ") : typed;
  }

  async function check(explicit?: string) {
    if (!current || busy || mark) return;
    const given = explicit ?? answerText();
    if (!given.trim()) return;
    setBusy(true);
    const m = await gradePlacement(current.id, given);
    setBusy(false);
    if (!m) return;
    setMark({ correct: m.correct, correctAnswer: m.correctAnswer });
    setScores((s) => (m.correct ? { ...s, [m.level]: s[m.level] + 1 } : s));
  }

  async function advance() {
    if (!current || !mark) return;
    const nextIdx = mark.correct
      ? Math.min(LEVELS.length - 1, levelIdx + 1)
      : Math.max(0, levelIdx - 1);
    setLevelIdx(nextIdx);
    setTyped("");
    setPicked([]);
    setMark(null);

    if (asked.length >= RUN_LENGTH) return finish();
    setBusy(true);
    const next = await nextPlacementItem(
      asked.map((a) => a.id),
      nextIdx
    );
    setBusy(false);
    if (next) setAsked([...asked, next]);
    else finish();
  }

  function finish() {
    // The verdict needs the DENOMINATOR per level, not just the hits.
    const perLevel = LEVELS.reduce(
      (acc, l) => ({ ...acc, [l]: asked.filter((a) => a.level === l).length }),
      {} as Record<Level, number>
    );
    setResult(verdict(scores, perLevel));
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
            {LEVELS.map((l) => {
              const n = asked.filter((a) => a.level === l).length;
              return n > 0 ? (
                <span key={l} className="chip">
                  {l} · {scores[l]}/{n}
                </span>
              ) : null;
            })}
          </div>

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
          Quinze perguntas, cerca de cinco minutos. Vais escolher, completar,
          ouvir e escrever, e construir frases. As perguntas ficam mais difíceis
          quando acertas e mais fáceis quando falhas — por isso não faz mal
          errar.
        </p>
        <p className="text-sm text-ink-faint">
          Fifteen adaptive questions in European Portuguese: multiple choice,
          gap-fill, dictation, free writing and sentence building. Everyone
          starts at A1 — this is how you test up.
        </p>
        {savedLevel ? (
          <p className="text-sm text-ink-soft">
            Nível guardado neste momento: <span className="chip">{savedLevel}</span>
          </p>
        ) : null}
        {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
        <button className="btn-terra" onClick={start} disabled={busy}>
          {busy ? "A preparar…" : "Começar 🧭"}
        </button>
      </div>
    );
  }

  // ── Question ────────────────────────────────────────────────────────
  const typedKind = current.kind === "dictation" || current.kind === "write";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: RUN_LENGTH }, (_, i) => (
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Pergunta {asked.length} de {RUN_LENGTH}
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
              const chosen = typed === opt;
              const isAnswer = mark && opt === mark.correctAnswer;
              return (
                <button
                  key={opt}
                  disabled={!!mark || busy}
                  onClick={() => {
                    setTyped(opt);
                    void check(opt);
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition-all",
                    isAnswer
                      ? "border-olive bg-sage-pale text-olive"
                      : chosen && mark && !mark.correct
                        ? "border-terra bg-terra-pale text-terra-dark"
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
                      disabled={!!mark}
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
                    disabled={used || !!mark}
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
            disabled={!!mark}
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

        {mark ? (
          <div
            className={cn(
              "mt-3 rounded-xl px-3 py-2 text-sm",
              mark.correct
                ? "bg-sage-pale text-olive"
                : "bg-terra-pale text-terra-dark"
            )}
          >
            {mark.correct ? (
              <>Certo! ✓</>
            ) : (
              <>
                Era:{" "}
                <strong className="font-display text-base">
                  {mark.correctAnswer}
                </strong>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Choice and gap grade on tap; the rest need a Verificar. */}
      {!mark && (typedKind || current.kind === "wordbank") ? (
        <button
          className="btn-terra w-full"
          onClick={() => void check()}
          disabled={busy || !answerText().trim()}
        >
          {busy ? "A corrigir…" : "Verificar ✓"}
        </button>
      ) : null}

      {mark ? (
        <button className="btn-primary w-full" onClick={() => void advance()} disabled={busy}>
          {asked.length >= RUN_LENGTH ? "Ver o resultado" : "Continuar →"}
        </button>
      ) : null}

      <button className="btn-ghost" onClick={reset} disabled={busy}>
        Recomeçar
      </button>
    </div>
  );
}
