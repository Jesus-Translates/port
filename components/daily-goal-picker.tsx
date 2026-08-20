"use client";

import { useState, useTransition } from "react";
import { Bi } from "@/components/bilingual";
import { setMyPrefs } from "@/lib/actions/profile";
import type { Minutes } from "@/lib/learning-path";
import { cn } from "@/lib/utils";

/**
 * How much a day is worth to this learner.
 *
 * It was asked once during onboarding and never again, which is exactly
 * backwards: nobody knows how much time they have before they have used the
 * app, and the honest answer changes in September. The value drives the daily
 * goal ring on Hoje, so moving it visibly moves something.
 */
const CHOICES: { value: Minutes; minutes: string; label: string; labelEn: string }[] = [
  { value: "5", minutes: "5", label: "Calma", labelEn: "Calm" },
  { value: "15", minutes: "15", label: "A sério", labelEn: "Serious" },
  { value: "30", minutes: "30", label: "Intenso", labelEn: "Intense" },
];

export function DailyGoalPicker({ initial }: { initial: Minutes }) {
  const [value, setValue] = useState<Minutes>(initial);
  const [busy, start] = useTransition();

  function pick(next: Minutes) {
    if (next === value || busy) return;
    const prev = value;
    setValue(next);
    start(async () => {
      try {
        await setMyPrefs({ minutes: next });
      } catch {
        setValue(prev);
      }
    });
  }

  return (
    <div className="flex gap-2.5">
      {CHOICES.map((c) => {
        const on = c.value === value;
        return (
          <button
            key={c.value}
            type="button"
            disabled={busy}
            onClick={() => pick(c.value)}
            aria-pressed={on}
            className={cn(
              "flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] transition-colors disabled:opacity-60",
              on
                ? "border-olive bg-sage-pale text-olive"
                : "border-sand bg-white/60 text-ink hover:border-sage"
            )}
          >
            <span className="font-display text-[17px] font-semibold">
              {c.minutes} min
            </span>
            <span
              className={cn(
                "text-[10.5px]",
                on ? "text-olive" : "text-ink-faint"
              )}
            >
              <Bi pt={c.label} en={c.labelEn} inline />
            </span>
          </button>
        );
      })}
    </div>
  );
}
