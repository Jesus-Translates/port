import Link from "next/link";
import { Suspense } from "react";
import { AzulejoHeader, BandTile } from "@/components/azulejo-header";
import { GlobalLeaderboard } from "@/components/global-leaderboard";
import { IconFlame } from "@/components/icons";
import { requireSession } from "@/lib/auth";
import { getCefrFor, getStats } from "@/lib/data";

export const metadata = { title: "Progresso" };

/**
 * Progresso — streak, XP and level.
 *
 * The weekly chart, the 35-day heatmap and the household league are the next
 * pass; this exists now because the tab bar points at it, and a tab that 404s
 * is worse than a thin screen. Everything here is real data from getStats().
 */
export default async function ProgressoPage() {
  const session = await requireSession();
  const [stats, cefr] = await Promise.all([
    getStats(session.username),
    getCefrFor(session.username).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <AzulejoHeader
        eyebrow="O teu caminho"
        title="Progresso"
        subtitle={`${stats.activeThisWeek} ${
          stats.activeThisWeek === 1 ? "dia ativo" : "dias ativos"
        } esta semana`}
      >
        <div className="flex gap-2.5">
          <BandTile label="Fogo">
            <IconFlame size={15} className="mr-1 text-terra-light" />
            <span className="font-display text-[27px] leading-none font-semibold">
              {stats.streakDays}
            </span>
            <span className="text-[13px] text-paper/60">
              {stats.streakDays === 1 ? "dia" : "dias"}
            </span>
          </BandTile>
          <BandTile label="XP total">
            <span className="font-display text-[27px] leading-none font-semibold">
              {stats.xp.toLocaleString("pt-PT")}
            </span>
          </BandTile>
        </div>
      </AzulejoHeader>

      <section className="grid gap-2.5 sm:grid-cols-3">
        <Stat value={String(stats.streakDays)} caption="dias seguidos" tone="text-terra" />
        <Stat
          value={stats.xp.toLocaleString("pt-PT")}
          caption="XP no total"
          tone="text-olive"
        />
        <Stat value={cefr ?? "—"} caption="nível atual" tone="text-azul" />
      </section>

      {/* The only cross-family surface in the app. Names are masked in the
          query, so this stays a scoreboard rather than a directory. */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
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

      <section className="space-y-2">
        <p className="label">O que fizeste</p>
        {stats.recent.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Ainda nada esta semana — começa por{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-olive">
              hoje
            </Link>
            .
          </p>
        ) : (
          <div className="card divide-y divide-cream">
            {stats.recent.slice(0, 12).map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {r.summary}
                </span>
                <span className="chip bg-cream text-ink-soft">{r.kind}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/jogos" className="btn-ghost w-full">
        🎮 Jogos — ganha XP em rondas rápidas
      </Link>
    </div>
  );
}

function Stat({
  value,
  caption,
  tone,
}: {
  value: string;
  caption: string;
  tone: string;
}) {
  return (
    <div className="card p-4 text-center">
      <p className={`font-display text-[28px] leading-none font-semibold ${tone}`}>
        {value}
      </p>
      <p className="mt-1 text-[11.5px] text-ink-faint">{caption}</p>
    </div>
  );
}
