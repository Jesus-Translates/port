import { formatEur, getSpend } from "@/lib/usage";

/** Server component streamed inside <Suspense>: the spend query must never
 *  block a page render just to paint a header chip. */
export async function SpendChip({ username }: { username: string }) {
  // Missing table / transient DB issue: show nothing, never break the nav.
  const spend = await getSpend(username).catch(() => null);
  if (!spend) return null;
  return (
    <span className="border-l border-sage/40 pl-1.5 text-[11px] font-semibold text-terra-dark tabular-nums">
      {formatEur(spend.monthEur)}
    </span>
  );
}
