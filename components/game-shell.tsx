"use client";

import Link from "next/link";
import { AudioButton } from "@/components/audio-button";
import { Bi } from "@/components/bilingual";
import { UnitContinue } from "@/components/unit-return";
import type { UnitContext } from "@/lib/unit-context";

/**
 * The end of every quick game: one score out of 100, a tier, what you missed,
 * and — the part that was missing — an obvious way onward.
 */
export function GameResult({
  score,
  right,
  total,
  misses,
  replayHref,
  unit,
  saving,
  saveError,
}: {
  score: number;
  right: number;
  total: number;
  misses: { pt: string; en: string }[];
  replayHref: string;
  unit?: UnitContext | null;
  saving?: boolean;
  saveError?: string | null;
}) {
  const tier = score >= 85 ? "🏆" : score >= 60 ? "💪" : "🌱";
  const line =
    score >= 85
      ? "Muito bem!"
      : score >= 60
        ? "Boa — já lá vais."
        : "Continua: estes voltam ao teu baralho.";

  return (
    <div className="space-y-5">
      <section className="card p-6 text-center">
        <div className="text-4xl">{tier}</div>
        <p className="mt-2 font-display text-3xl font-semibold">{score}/100</p>
        <p className="mt-1 text-sm text-ink-soft">
          {right} de {total} certas · {line}
        </p>
        {saving && <p className="mt-2 text-xs text-ink-faint">A guardar…</p>}
        {saveError && <p className="mt-2 text-xs text-terra">{saveError}</p>}
      </section>

      {misses.length > 0 && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold">
            Para rever · added to your deck
          </h2>
          <ul className="mt-2 divide-y divide-sand/70">
            {misses.slice(0, 10).map((m, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                <span className="flex min-w-0 items-center gap-1.5">
                  <AudioButton text={m.pt} className="min-h-7 min-w-7 shrink-0 px-1.5" />
                  <span className="truncate font-medium">{m.pt}</span>
                </span>
                <span className="shrink-0 text-ink-soft">{m.en}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {unit ? (
        <UnitContinue unit={unit} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {/* The real button primitives — the ad-hoc bg-sage/text-white pair
              read at 2.72:1, and neither link met the 44px tap target. */}
          <Link href={replayHref} className="btn-primary">
            <Bi pt="Jogar outra vez" en="Play again" inline />
          </Link>
          <Link href="/jogos" className="btn-ghost">
            <Bi pt="Outros jogos" en="Other games" inline />
          </Link>
        </div>
      )}
    </div>
  );
}

/** Progress pips shared by the quick games. */
export function GameProgress({ at, of }: { at: number; of: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full bg-sage transition-all"
          style={{ width: `${Math.round((at / Math.max(1, of)) * 100)}%` }}
        />
      </div>
      <span className="shrink-0 text-xs text-ink-faint">
        {at}/{of}
      </span>
    </div>
  );
}
