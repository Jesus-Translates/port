"use client";

import { useState, useTransition } from "react";
import { setMyPrefs } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

/**
 * Turn full immersion on or off.
 *
 * It was only ever askable once, buried in the onboarding questionnaire, and
 * there was no way back: choosing it meant Sandra never used English again,
 * with no visible control to undo that. A setting a learner can walk into and
 * not out of is a trap, especially this one — the person most likely to try
 * immersion is a beginner, and the person most likely to need it off is the
 * same beginner an hour later.
 */
export function ImmersionToggle({
  initial,
  followingFamily = false,
}: {
  initial: boolean;
  /** True while this person has made no choice and is inheriting the house. */
  followingFamily?: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [owned, setOwned] = useState(!followingFamily);
  const [busy, start] = useTransition();

  function flip() {
    const next = !on;
    setOn(next); // optimistic: the switch must move under the finger
    // Touching it is the choice: from here this person no longer follows the
    // household default, even if they flip it back to where it was.
    setOwned(true);
    start(async () => {
      try {
        await setMyPrefs({ immersion: next ? "total" : "ajuda" });
      } catch {
        setOn(!next);
      }
    });
  }

  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium">Imersão total</span>
        <span className="block text-xs text-ink-faint">
          {on
            ? "A Sandra só fala português — nunca traduz."
            : "A Sandra explica em inglês quando precisas."}
          {!owned ? " · como a tua família escolheu" : ""}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Imersão total"
        disabled={busy}
        onClick={flip}
        className={cn(
          "tap-44 flex h-7 w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors disabled:opacity-60",
          on ? "justify-end bg-olive" : "justify-start bg-sand"
        )}
      >
        <span className="size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)]" />
      </button>
    </div>
  );
}
