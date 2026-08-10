import { getGlobalLeaderboard } from "@/lib/actions/leaderboard";
import { cn } from "@/lib/utils";

/**
 * Today's XP across every family, with names masked.
 *
 * A server component on purpose: the masking happens before the data leaves
 * the database, so no browser ever receives another learner's real name.
 */
export async function GlobalLeaderboard({ limit = 12 }: { limit?: number }) {
  const rows = await getGlobalLeaderboard(limit).catch(() => []);

  if (rows.length === 0) {
    return (
      <p className="card p-6 text-center text-sm text-ink-soft">
        Ainda ninguém marcou pontos hoje. Sê o primeiro.
      </p>
    );
  }

  return (
    <div className="card divide-y divide-cream overflow-hidden">
      {rows.map((r, i) => (
        <div
          key={`${r.masked}-${i}`}
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
          <span className="min-w-0 flex-1 truncate font-display text-[15px] tracking-wide">
            {r.masked}
            {r.isMe ? (
              <span className="ml-2 text-xs font-sans text-olive">tu</span>
            ) : null}
          </span>
          <span className="font-display text-[15px] font-semibold text-terra tabular-nums">
            {r.xp} XP
          </span>
          <span className="text-2xs text-ink-faint">hoje</span>
        </div>
      ))}
    </div>
  );
}
