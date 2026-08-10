"use client";

import { useState, useTransition } from "react";
import { AudioButton } from "@/components/audio-button";
import { Recorder } from "@/components/recorder";
import { gradeCard } from "@/lib/actions/review";
import type { ReviewRating } from "@/lib/srs";
import { cn } from "@/lib/utils";

type QueueCard = {
  id: number;
  kind: string;
  front: string;
  back: string;
  note: string | null;
};

const GRADES: { rating: ReviewRating; label: string; hint: string; cls: string }[] = [
  { rating: 1, label: "Errei", hint: "outra vez já", cls: "bg-terra text-paper hover:bg-terra-dark" },
  { rating: 2, label: "Difícil", hint: "repete a seguir", cls: "bg-sand text-ink hover:bg-sage-light" },
  { rating: 3, label: "Bom", hint: "completo ✓", cls: "bg-olive text-paper hover:bg-ink" },
  { rating: 4, label: "Fácil", hint: "completo ✓", cls: "bg-azul text-paper hover:bg-ink" },
];

export function ReviewPlayer({
  initialQueue,
  flash = false,
}: {
  initialQueue: QueueCard[];
  flash?: boolean;
}) {
  const [queue, setQueue] = useState(initialQueue);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [justPassed, setJustPassed] = useState(false);
  const [, startTransition] = useTransition();

  // Stable session size: completed + still queued (repeats don't grow it).
  const total = doneCount + queue.length;
  const card = queue[0];

  if (!card) {
    return (
      <div className="card p-8 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          {flash ? "⚡" : "🎉"}
        </div>
        <p className="font-medium">
          {flash
            ? `Sanity check feito — ${doneCount} ${doneCount === 1 ? "cartão" : "cartões"} ✓`
            : `Sessão feita — ${doneCount} ${doneCount === 1 ? "cartão" : "cartões"}!`}
        </p>
        <button
          className="btn-ghost mt-3"
          onClick={() => {
            // router.refresh() left the page showing "all done" while cards
            // were still due — a full navigation is what actually refetches.
            window.location.href = flash
              ? "/practice/rever?flash=1"
              : "/practice/rever";
          }}
        >
          {flash ? "Outra ronda ⚡" : "Ver se há mais"}
        </button>
      </div>
    );
  }

  function grade(rating: ReviewRating) {
    const current = card;
    // A card is only COMPLETE at Bom or above — Errei/Difícil repeat in this
    // same session until it passes. FSRS records every grade either way.
    const passed = rating >= 3;
    setQueue((q) => {
      const rest = q.slice(1);
      return passed ? rest : [...rest, current];
    });
    if (passed) {
      setDoneCount((n) => n + 1);
      setJustPassed(true);
      setTimeout(() => setJustPassed(false), 600);
    }
    setRevealed(false);
    startTransition(() => gradeCard(current.id, rating));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
          <div
            className={cn(
              "h-full rounded-full bg-olive transition-all duration-500",
              justPassed && "bg-terra"
            )}
            style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-soft tabular-nums">
          {doneCount}/{total} ✓
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span>
          {flash ? "⚡ Flash review" : `${queue.length} na fila`}
          {card.kind === "mistake" ? " · dos teus erros 🔧" : ""}
        </span>
        {justPassed ? (
          <span className="font-semibold text-olive">completo ✓</span>
        ) : null}
      </div>

      <div className="card min-h-56 p-6">
        <div className="text-2xs font-semibold tracking-wide text-ink-faint uppercase">
          {card.kind === "mistake" ? "Corrige-te" : "Como se diz…"}
        </div>
        <p className="mt-2 font-display text-2xl leading-snug">{card.front}</p>

        {revealed ? (
          <div className="mt-5 space-y-2 border-t border-sand pt-4">
            <div className="flex items-center gap-3">
              <p className="font-display text-2xl text-olive">{card.back}</p>
              <AudioButton text={card.back} />
            </div>
            {card.note ? (
              <p className="text-sm text-ink-soft">{card.note}</p>
            ) : null}
            {/* key on card.id: speaking state must reset with each new card */}
            <SpeakCheck key={card.id} target={card.back} />
          </div>
        ) : null}
      </div>

      {!revealed ? (
        <button
          className="btn-primary w-full py-4 text-base"
          onClick={() => setRevealed(true)}
        >
          Mostrar resposta
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.rating}
              onClick={() => grade(g.rating)}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-xl px-1 py-2 transition-colors",
                g.cls
              )}
            >
              <span className="text-sm font-bold">{g.label}</span>
              <span className="text-2xs opacity-80">{g.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Optional per-card speaking check: say the answer, get accent + word score.
 *  Own component so its state resets when the card changes (keyed by card). */
function SpeakCheck({ target }: { target: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        className="btn-ghost mt-1 text-xs"
        onClick={() => setOpen(true)}
      >
        🎙️ Diz tu — a Sandra avalia a pronúncia
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-xl border border-sand bg-cream/50 p-3">
      <Recorder mode="read" target={target} autoStart />
    </div>
  );
}
