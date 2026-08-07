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
  // audio: input = text tokens, output = audio tokens
  "gpt-4o-mini-tts": { input: 0.0000006, output: 0.000012 },
  "gpt-4o-mini-transcribe": { input: 0.000003, output: 0.000005 },
  // Azure neural TTS: $16 per 1M characters, modeled as char = input token.
  "neural-tts": { input: 0.000016, output: 0 },
};
const FALLBACK = { input: 0.0000002, output: 0.0000012 };

export function priceFor(model: string): { input: number; output: number } {
  const envIn = Number(process.env.AI_PRICE_INPUT);
  const envOut = Number(process.env.AI_PRICE_OUTPUT);
  if (envIn > 0 && envOut > 0) return { input: envIn, output: envOut };
  // Strip ANY provider prefix, not just openai/. Matching only openai/ sent
  // "azure/neural-tts" to FALLBACK — which happens to equal the text-model
  // rate, silently pricing speech at 1/80th of the real $16/M characters.
  const key = model.replace(/^[a-z0-9.-]+\//i, "");
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
  /** AI SDK v7 reports the cached slice of the prompt here. */
  inputTokenDetails?: { cacheReadTokens?: number | null } | null;
};

/** Cached prompt tokens bill at ~10% of the normal input rate. Our long
 *  instruction blocks are identical call to call, so most of the prompt is
 *  served from cache — charging full rate overstates the family's spend. */
const CACHE_READ_RATE = 0.1;

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
    // cacheReadTokens is a SUBSET of inputTokens, not an addition to it.
    const cached = Math.min(
      inTok,
      Math.max(0, Math.round(usage?.inputTokenDetails?.cacheReadTokens ?? 0))
    );
    const fullPriceIn = inTok - cached;
    const p = priceFor(model);
    const costMicroUsd = Math.round(
      (fullPriceIn * p.input +
        cached * p.input * CACHE_READ_RATE +
        outTok * p.output) *
        1_000_000
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

/** First instant of the current month in the family's timezone (±1h at the
 *  DST boundary — fine for a spend display, and it keeps the month label on
 *  /gastos and the totals in agreement). */
function lisbonMonthStart(): Date {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon",
  });
  return new Date(`${day.slice(0, 7)}-01T00:00:00Z`);
}

/** One round-trip: month + all-time via FILTER. This runs in the layout on
 *  every page render, so it must stay a single query. */
export async function getSpend(username: string): Promise<SpendSummary> {
  const db = getDb();
  const monthStart = lisbonMonthStart();

  const [row] = await db
    .select({
      monthMicro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}) filter (where ${aiUsage.createdAt} >= ${monthStart}), 0)::bigint`,
      allMicro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
      calls: sql<number>`count(*) filter (where ${aiUsage.createdAt} >= ${monthStart})::int`,
    })
    .from(aiUsage)
    .where(eq(aiUsage.username, username));

  const rate = usdToEur();
  return {
    monthEur: (Number(row?.monthMicro ?? 0) / 1_000_000) * rate,
    allTimeEur: (Number(row?.allMicro ?? 0) / 1_000_000) * rate,
    calls: Number(row?.calls ?? 0),
  };
}

/** True when this user has made too many AI calls recently. Uses the ai_usage
 *  table we already write, so a scripted loop can't burn tokens unbounded. */
export async function aiRateLimited(username: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const [row] = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(aiUsage)
      .where(and(eq(aiUsage.username, username), gte(aiUsage.createdAt, since)));
    return Number(row?.count ?? 0) >= 30;
  } catch {
    return false; // never block learning on a telemetry failure
  }
}

/** Per-person spend this month, for the family breakdown. */
export async function getSpendByUser(): Promise<
  { username: string; monthEur: number; calls: number }[]
> {
  const db = getDb();
  const monthStart = lisbonMonthStart();
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
