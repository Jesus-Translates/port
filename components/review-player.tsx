"use client";

import { useRouter } from "next/navigation";
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
  { rating: 2, label: "Difícil", hint: "volta cedo", cls: "bg-sand text-ink hover:bg-sage-light" },
  { rating: 3, label: "Bom", hint: "normal", cls: "bg-olive text-paper hover:bg-ink" },
  { rating: 4, label: "Fácil", hint: "volta tarde", cls: "bg-azul text-paper hover:bg-ink" },
];

export function ReviewPlayer({ initialQueue }: { initialQueue: QueueCard[] }) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialQueue);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [, startTransition] = useTransition();

  const card = queue[0];
  if (!card) {
    return (
      <div className="card p-8 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          🎉
        </div>
        <p className="font-medium">
          Sessão feita — {doneCount} {doneCount === 1 ? "cartão" : "cartões"}!
        </p>
        <button className="btn-ghost mt-3" onClick={() => router.refresh()}>
          Ver se há mais
        </button>
      </div>
    );
  }

  function grade(rating: ReviewRating) {
    const current = card;
    // Optimistic: advance immediately; the action reschedules in background.
    setQueue((q) => {
      const rest = q.slice(1);
      // "Errei" comes back at the end of this same session.
      return rating === 1 ? [...rest, current] : rest;
    });
    if (rating !== 1) setDoneCount((n) => n + 1);
    setRevealed(false);
    startTransition(() => gradeCard(current.id, rating));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span>
          {queue.length} na fila
          {card.kind === "mistake" ? " · dos teus erros 🔧" : ""}
        </span>
        <span>{doneCount} feitos</span>
      </div>

      <div className="card min-h-56 p-6">
        <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
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
              <span className="text-[10px] opacity-80">{g.hint}</span>
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
        🎙️ Diz tu — a Luna avalia a pronúncia
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-xl border border-sand bg-cream/50 p-3">
      <Recorder mode="read" target={target} autoStart />
    </div>
  );
}
