import { Suspense } from "react";
import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { GlobalLeaderboard } from "@/components/global-leaderboard";
import { IconFlame } from "@/components/icons";
import { requireSession } from "@/lib/auth";
import { getCefrFor, getStats } from "@/lib/data";
import {
  getHeatmap,
  getHouseholdLeague,
  getWeeklyXp,
} from "@/lib/actions/progress";
import { titleCase } from "@/lib/people";
import { cn } from "@/lib/utils";

export const metadata = { title: "Progresso" };

/**
 * Progresso — the streak, the week, and where you stand.
 *
 * Every number here is real: derived from the activity rows the app already
 * writes, day-bucketed in Lisbon so a late-evening session lands on the day
 * the learner thinks it did.
 */
export default async function ProgressoPage() {
  const session = await requireSession();
  const [stats, cefr, week, heat, league] = await Promise.all([
    getStats(session.username),
    getCefrFor(session.username).catch(() => null),
    getWeeklyXp().catch(() => []),
    getHeatmap().catch(() => []),
    getHouseholdLeague().catch(() => []),
  ]);

  const peak = Math.max(1, ...week.map((d) => d.xp));

  return (
    <div className="space-y-6">
      <AzulejoHeader
        variant="full"
        eyebrow="O teu caminho"
        title="Progresso"
        subtitle={`${stats.activeThisWeek} ${
          stats.activeThisWeek === 1 ? "dia ativo" : "dias ativos"
        } esta semana`}
      >
        {/* The week, in the band. Bars are terra-light because full terra is
            too close to olive in value to read on this background. */}
        <div className="flex h-20 items-end gap-1.5">
          {week.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-full rounded-t-md rounded-b-[3px]",
                  d.xp > 0 ? "bg-terra-light" : "bg-paper/20"
                )}
                style={{ height: `${Math.max(6, (d.xp / peak) * 62)}px` }}
                title={`${d.xp} XP`}
              />
              <span
                className={cn(
                  "text-[10.5px]",
                  d.isToday ? "font-semibold text-paper" : "text-paper/60"
                )}
              >
                {d.letter}
              </span>
            </div>
          ))}
        </div>
      </AzulejoHeader>

      <section className="grid grid-cols-3 gap-2.5">
        <Stat
          icon={<IconFlame size={14} className="text-terra" />}
          value={String(stats.streakDays)}
          caption="dias seguidos"
          tone="text-terra"
        />
        <Stat
          value={stats.xp.toLocaleString("pt-PT")}
          caption="XP no total"
          tone="text-olive"
        />
        <Stat value={cefr ?? "—"} caption="nível atual" tone="text-azul" />
      </section>

      {heat.length > 0 ? (
        <section>
          <p className="label">Últimas 5 semanas</p>
          {/* Capped width: aspect-square in a 7-column grid across the full
              5xl column turned each day into a 130px tile. A heatmap is meant
              to be read as a shape at a glance, not a wall. */}
          <div className="card grid max-w-[300px] grid-cols-7 gap-[5px] p-4">
            {heat.map((c) => (
              <span
                key={c.day}
                title={c.day}
                className={cn(
                  "aspect-square rounded-[5px]",
                  c.level === 0
                    ? "bg-cream"
                    : c.level === 1
                      ? "bg-[#dfe3d8]"
                      : c.level === 2
                        ? "bg-sage-light"
                        : "bg-sage"
                )}
              />
            ))}
          </div>
        </section>
      ) : null}

      {league.length > 1 ? (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="label mb-0">A tua casa</p>
            <span className="text-2xs text-ink-faint">últimos 7 dias</span>
          </div>
          <div className="card divide-y divide-cream overflow-hidden">
            {league.map((r, i) => (
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
                    i < 3 ? "bg-terra text-paper" : "bg-cream text-ink-faint"
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14.5px]">
                  {titleCase(r.username)}
                </span>
                <span className="font-display text-[15px] font-semibold text-ink-soft tabular-nums">
                  {r.xp} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* The only cross-family surface in the app. Names are masked in the
          query, so this stays a scoreboard rather than a directory. */}
      <section>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="label mb-0">Tabela de hoje</p>
          <span className="text-2xs text-ink-faint">todas as famílias</span>
        </div>
        <Suspense
          fallback={
            <p className="card p-6 text-center text-sm text-ink-faint">
              A contar os pontos…
            </p>
          }
        >
          <GlobalLeaderboard limit={12} />
        </Suspense>
      </section>

      <Link href="/jogos" className="btn-ghost w-full">
        🎮 Jogos — ganha XP em rondas rápidas
      </Link>
    </div>
  );
}

function Stat({
  icon,
  value,
  caption,
  tone,
}: {
  icon?: React.ReactNode;
  value: string;
  caption: string;
  tone: string;
}) {
  return (
    <div className="card p-4 text-center">
      <p
        className={cn(
          "flex items-center justify-center gap-1 font-display text-[28px] leading-none font-semibold",
          tone
        )}
      >
        {icon}
        {value}
      </p>
      <p className="mt-1.5 text-[11.5px] text-ink-faint">{caption}</p>
    </div>
  );
}
