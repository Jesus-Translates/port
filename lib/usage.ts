import { and, desc, eq, gte, sql } from "drizzle-orm";
import { aiUsage, getDb } from "@/lib/db";

/**
 * USD per token, from the Vercel AI Gateway model catalogue.
 * Override per-deploy with AI_PRICE_INPUT / AI_PRICE_OUTPUT if prices change.
 */
const DEFAULT_PRICES: Record<string, { input: number; output: number }> = {
  "gpt-5.6-luna": { input: 0.0000002, output: 0.0000012 },
  "gpt-5.6-sol": { input: 0.0000005, output: 0.000004 },
  "gpt-oss-120b": { input: 0.00000005, output: 0.00000025 },
};
const FALLBACK = { input: 0.0000002, output: 0.0000012 };

export function priceFor(model: string): { input: number; output: number } {
  const envIn = Number(process.env.AI_PRICE_INPUT);
  const envOut = Number(process.env.AI_PRICE_OUTPUT);
  if (envIn > 0 && envOut > 0) return { input: envIn, output: envOut };
  const key = model.replace(/^openai\//, "");
  return DEFAULT_PRICES[key] ?? FALLBACK;
}

/** Euros per US dollar. Their spend is in EUR, the invoices are in USD. */
export function usdToEur(): number {
  const v = Number(process.env.USD_TO_EUR);
  return v > 0 ? v : 0.85;
}

export type TokenUsage = {
  inputTokens?: number | null;
  outputTokens?: number | null;
};

/** Fire-and-forget: a billing hiccup must never break a lesson. */
export async function recordUsage(
  username: string,
  kind: string,
  model: string,
  usage: TokenUsage | null | undefined
): Promise<void> {
  try {
    const inTok = Math.max(0, Math.round(usage?.inputTokens ?? 0));
    const outTok = Math.max(0, Math.round(usage?.outputTokens ?? 0));
    if (inTok === 0 && outTok === 0) return;
    const p = priceFor(model);
    const costMicroUsd = Math.round(
      (inTok * p.input + outTok * p.output) * 1_000_000
    );
    await getDb()
      .insert(aiUsage)
      .values({
        username,
        kind,
        model,
        inputTokens: inTok,
        outputTokens: outTok,
        costMicroUsd,
      });
  } catch {
    // Never surface billing errors to the learner.
  }
}

export function modelId(): string {
  return process.env.AI_MODEL ?? "openai/gpt-5.6-luna";
}

export type SpendSummary = {
  monthEur: number;
  allTimeEur: number;
  calls: number;
};

export async function getSpend(username: string): Promise<SpendSummary> {
  const db = getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [month] = await db
    .select({
      micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
      calls: sql<number>`count(*)::int`,
    })
    .from(aiUsage)
    .where(
      and(eq(aiUsage.username, username), gte(aiUsage.createdAt, monthStart))
    );

  const [all] = await db
    .select({ micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint` })
    .from(aiUsage)
    .where(eq(aiUsage.username, username));

  const rate = usdToEur();
  return {
    monthEur: (Number(month?.micro ?? 0) / 1_000_000) * rate,
    allTimeEur: (Number(all?.micro ?? 0) / 1_000_000) * rate,
    calls: Number(month?.calls ?? 0),
  };
}

/** Per-person spend this month, for the family breakdown. */
export async function getSpendByUser(): Promise<
  { username: string; monthEur: number; calls: number }[]
> {
  const db = getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const rows = await db
    .select({
      username: aiUsage.username,
      micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
      calls: sql<number>`count(*)::int`,
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, monthStart))
    .groupBy(aiUsage.username)
    .orderBy(desc(sql`sum(${aiUsage.costMicroUsd})`));
  const rate = usdToEur();
  return rows.map((r) => ({
    username: r.username,
    monthEur: (Number(r.micro) / 1_000_000) * rate,
    calls: Number(r.calls),
  }));
}

export function formatEur(v: number): string {
  // Sub-cent spend should read as "<0,01 €", not "0,00 €".
  if (v > 0 && v < 0.01) return "<0,01 €";
  return `${v.toFixed(2).replace(".", ",")} €`;
}
