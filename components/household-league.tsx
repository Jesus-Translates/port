"use client";

import { useState } from "react";
import { Bi } from "@/components/bilingual";
import type { LeagueRow } from "@/lib/actions/progress";
import { titleCase } from "@/lib/people";
import { cn } from "@/lib/utils";

type Range = "week" | "month" | "all";

const RANGES: { id: Range; pt: string; en: string; notePt: string; noteEn: string }[] = [
  { id: "week", pt: "Semana", en: "Week", notePt: "desde segunda", noteEn: "since Monday" },
  { id: "month", pt: "Mês", en: "Month", notePt: "este mês", noteEn: "this month" },
  { id: "all", pt: "Sempre", en: "All time", notePt: "desde o início", noteEn: "since the start" },
];

/**
 * The family league, over three windows.
 *
 * All three arrive together from one query, so switching is instant and costs
 * nothing — the point of the toggle is that the same family looks different
 * depending on the window, and you should be able to see that in one tap.
 *
 * Why three and not just the week: an all-time board is won permanently by
 * whoever started first, which for a family means a parent or the eldest
 * child, and a scoreboard a nine-year-old can never top is a scoreboard they
 * stop looking at. The week resets, so everyone starts level every Monday.
 * The month sits between them — long enough to reward consistency, short
 * enough to still be winnable.
 */
export function HouseholdLeague({ rows }: { rows: LeagueRow[] }) {
  const [range, setRange] = useState<Range>("week");
  const meta = RANGES.find((r) => r.id === range)!;

  const ranked = [...rows].sort((a, b) => b[range] - a[range]);
  // Nobody has scored in this window yet — rank numbers would be meaningless.
  const allZero = ranked.every((r) => r[range] === 0);

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="label mb-0">
          <Bi pt="A tua casa" en="Your household" inline />
        </p>
        <span className="text-2xs text-ink-faint">
          <Bi pt={meta.notePt} en={meta.noteEn} inline />
        </span>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-1 rounded-2xl border border-sand bg-white/60 p-1">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            aria-pressed={range === r.id}
            className={cn(
              "tap-44 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors",
              range === r.id
                ? "bg-olive text-paper"
                : "text-ink-soft hover:bg-sage-pale"
            )}
          >
            <Bi pt={r.pt} en={r.en} inline />
          </button>
        ))}
      </div>

      <div className="card divide-y divide-cream overflow-hidden">
        {ranked.map((r, i) => (
          <div
            key={r.username}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              r.isMe && "bg-sage-pale"
            )}
          >
            <span
              className={cn(
                "grid size-[26px] shrink-0 place-items-center rounded-[9px] font-display text-[13px] font-semibold",
                !allZero && i < 3 ? "bg-terra text-paper" : "bg-cream text-ink-faint"
              )}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14.5px]">
              {titleCase(r.username)}
            </span>
            <span className="font-display text-[15px] font-semibold text-ink-soft tabular-nums">
              {r[range]} XP
            </span>
          </div>
        ))}
      </div>

      {allZero ? (
        <p className="mt-1.5 text-2xs text-ink-faint">
          <Bi
            pt="Ainda ninguém marcou nesta janela — a semana recomeça à segunda."
            en="Nobody has scored in this window yet — the week restarts on Monday."
            inline
          />
        </p>
      ) : null}
    </section>
  );
}
