"use client";

import { useState, useTransition } from "react";
import { AudioButton } from "@/components/audio-button";
import { finishVerbCards } from "@/lib/actions/verbs";
import { personLabel, TENSE_LABEL, type Tense, type Verb } from "@/lib/verbs";
import { cn } from "@/lib/utils";

/** The form to run the deck in. "inf" asks the meaning; a tense asks a form. */
export type CardMode = "inf" | Tense;

const MODE_LABEL: Record<CardMode, string> = {
  inf: "Infinitivo",
  presente: TENSE_LABEL.presente,
  perfeito: TENSE_LABEL.perfeito,
  imperfeito: TENSE_LABEL.imperfeito,
  futuro: TENSE_LABEL.futuro,
  conjuntivo: TENSE_LABEL.conjuntivo,
  imperativo: TENSE_LABEL.imperativo,
};

const ROUND = 12;

type Card = {
  verb: Verb;
  /** Which person slot this card asks about; -1 for the infinitive mode. */
  slot: number;
};

/**
 * Verb flashcards.
 *
 * The oldest study tool there is, and the one the app was missing: everything
 * else here marks you, which is useful but slow. A card you flip and judge
 * yourself covers thirty forms in the time a graded drill covers eight, and
 * recall-then-check is what actually moves a paradigm into memory.
 *
 * You choose the form. In "Infinitivo" the card asks what the verb means; in
 * any tense it names a verb and a person and asks for that form. Same deck,
 * six different things to practise.
 *
 * Self-graded on purpose. There is no typing, so there is nothing to mark —
 * and the honest answer to "did you know it?" is one only the learner has.
 * Missed cards go to the review deck, where the grading does happen.
 */
export function VerbCards({ verbs }: { verbs: Verb[] }) {
  const [mode, setMode] = useState<CardMode>("inf");
  const [deck, setDeck] = useState<Card[]>([]);
  const [at, setAt] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knew, setKnew] = useState<Card[]>([]);
  const [missed, setMissed] = useState<Card[]>([]);
  const [done, setDone] = useState(false);
  const [saving, startSave] = useTransition();

  /** Verbs that actually carry the chosen form. */
  function eligible(m: CardMode): Verb[] {
    if (m === "inf") return verbs.filter((v) => v.en.trim().length > 0);
    return verbs.filter((v) => (v.forms[m] ?? []).some((f) => f));
  }

  const available = eligible(mode).length;

  function build(m: CardMode) {
    const pool = eligible(m);
    const cards: Card[] = [];
    for (const verb of pool) {
      if (m === "inf") cards.push({ verb, slot: -1 });
      else {
        const forms = verb.forms[m] ?? [];
        forms.forEach((f, i) => {
          if (f) cards.push({ verb, slot: i });
        });
      }
    }
    // Shuffle on a click, never during render.
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setDeck(cards.slice(0, ROUND));
    setAt(0);
    setFlipped(false);
    setKnew([]);
    setMissed([]);
    setDone(false);
  }

  const card = deck[at];

  /** What the card shows before and after the flip. */
  function front(c: Card): string {
    return c.verb.inf;
  }
  function back(c: Card): string {
    if (mode === "inf") return c.verb.en;
    return (c.verb.forms[mode] ?? [])[c.slot] ?? "";
  }

  function judge(ok: boolean) {
    if (!card) return;
    const nextKnew = ok ? [...knew, card] : knew;
    const nextMissed = ok ? missed : [...missed, card];
    setKnew(nextKnew);
    setMissed(nextMissed);
    setFlipped(false);

    if (at + 1 >= deck.length) {
      setDone(true);
      startSave(async () => {
        await finishVerbCards(
          mode,
          nextKnew.length,
          deck.length,
          nextMissed.map((c) => ({
            inf: c.verb.inf,
            prompt:
              mode === "inf"
                ? c.verb.inf
                : `${c.verb.inf} — ${personLabel(mode, c.slot)}, ${TENSE_LABEL[mode]}`,
            answer: back(c),
            en: c.verb.en,
          }))
        ).catch(() => {});
      });
    } else setAt(at + 1);
  }

  // ── Result ──────────────────────────────────────────────────────────
  if (done) {
    const pct = deck.length > 0 ? knew.length / deck.length : 0;
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            {pct >= 0.85 ? "🏆" : pct >= 0.6 ? "💪" : "🌱"}
          </div>
          <p className="font-display text-2xl font-semibold">
            {knew.length}/{deck.length} de cor
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {missed.length === 0
              ? "Sem falhas. Escolhe outro tempo e continua."
              : `As ${missed.length} que falharam foram para o teu baralho de revisão.`}
            {saving ? " A guardar…" : ""}
          </p>

          {missed.length > 0 ? (
            <div className="mt-4 space-y-1.5 text-left">
              {missed.map((c, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm"
                >
                  <span className="text-ink-soft">
                    {c.verb.inf}
                    {mode !== "inf" ? (
                      <span className="text-ink-faint">
                        {" "}
                        · {personLabel(mode, c.slot)}
                      </span>
                    ) : null}
                  </span>
                  <strong className="font-display text-base text-olive">
                    {back(c)}
                  </strong>
                </div>
              ))}
            </div>
          ) : null}

          <button className="btn-primary mt-5 w-full" onClick={() => build(mode)}>
            Outra ronda →
          </button>
          <button className="btn-ghost mt-2 w-full" onClick={() => setDeck([])}>
            Mudar de tempo
          </button>
        </div>
      </div>
    );
  }

  // ── Picker ──────────────────────────────────────────────────────────
  if (!card) {
    return (
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <span className="label">Em que forma queres treinar?</span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(MODE_LABEL) as CardMode[]).map((m) => {
              const n = eligible(m).length;
              return (
                <button
                  key={m}
                  disabled={n === 0}
                  onClick={() => setMode(m)}
                  aria-pressed={m === mode}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40",
                    m === mode
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  {MODE_LABEL[m]}
                  <span className="ml-1 text-xs opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-ink-soft">
            {mode === "inf"
              ? "O verbo à frente, o significado atrás."
              : `O verbo e a pessoa à frente, a forma do ${MODE_LABEL[mode].toLowerCase()} atrás.`}
          </p>
        </div>
        <button
          className="btn-terra w-full"
          disabled={available === 0}
          onClick={() => build(mode)}
        >
          {available === 0 ? "Sem verbos nesta forma" : "Começar 🎴"}
        </button>
      </div>
    );
  }

  // ── Card ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {deck.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < at ? "bg-olive" : i === at ? "bg-terra" : "bg-sand"
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFlipped(true)}
        className="card block w-full p-8 text-center transition-colors hover:bg-sage-pale/30"
      >
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          {MODE_LABEL[mode]}
          {mode !== "inf" ? ` · ${personLabel(mode, card.slot)}` : ""}
        </p>
        <p className="mt-3 font-display text-4xl leading-tight font-semibold">
          {front(card)}
        </p>

        {flipped ? (
          <div className="animate-ph-rise mt-5 border-t border-sand pt-4">
            <p className="font-display text-3xl font-semibold text-olive">
              {back(card)}
            </p>
            {mode !== "inf" && card.verb.en ? (
              <p className="mt-1 text-sm text-ink-soft">{card.verb.en}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-faint">
            Toca para ver a resposta
          </p>
        )}
      </button>

      {flipped ? (
        <>
          <div className="flex justify-center">
            <AudioButton
              text={back(card) || front(card)}
              label="Ouvir"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => judge(false)}>
              Não sabia
            </button>
            <button className="btn-primary flex-1" onClick={() => judge(true)}>
              Sabia ✓
            </button>
          </div>
        </>
      ) : (
        <button className="btn-terra w-full" onClick={() => setFlipped(true)}>
          Ver a resposta
        </button>
      )}
    </div>
  );
}
