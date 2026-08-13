import { cache } from "react";
import { and, gte, inArray, sql } from "drizzle-orm";
import { accounts, aiUsage, getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { grossMonthlyEur } from "@/lib/plans";
import { currentAccountId, householdUsernames } from "@/lib/tenant";
import { lisbonMonthStart, usdToEur } from "@/lib/usage";

/**
 * The margin guard.
 *
 * The rule: a household may never spend more than COST_SHARE of what its
 * subscription is actually worth to the business AFTER tax and card fees.
 * At the default 0.75 that guarantees at least a 25% gross margin on every
 * account, no matter how heavily it is used.
 *
 * This has to exist because the cost driver is unbounded. AI spend scales with
 * how much a learner talks to Sandra, and nothing in the product stops one
 * enthusiastic family from costing several times what they pay. A flat price
 * against an unbounded cost is not a business model, it is a bet.
 *
 * Everything here is env-overridable, because tax rates and card fees change
 * and none of them should need a deploy.
 */

/** Portuguese standard rate. EU B2C digital sales use the CUSTOMER's rate. */
function vatRate(): number {
  const n = Number(process.env.VAT_RATE);
  return Number.isFinite(n) && n >= 0 && n < 1 ? n : 0.23;
}

/** Card processing: a percentage plus a fixed slice per charge. */
function feePct(): number {
  const n = Number(process.env.PAYMENT_FEE_PCT);
  return Number.isFinite(n) && n >= 0 && n < 1 ? n : 0.015;
}
function feeFixedEur(): number {
  const n = Number(process.env.PAYMENT_FEE_FIXED_EUR);
  return Number.isFinite(n) && n >= 0 ? n : 0.25;
}

/** Share of net revenue a household is allowed to consume in AI cost. */
export function costShare(): number {
  const n = Number(process.env.MAX_COST_SHARE);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.75;
}

/** What the free tier may consume. Small, but not zero — a free plan that
 *  cannot call anything is not a trial, it is a screenshot. */
function freeAllowanceEur(): number {
  const n = Number(process.env.FREE_PLAN_BUDGET_EUR);
  return Number.isFinite(n) && n >= 0 ? n : 0.5;
}

/** Gross price less VAT less card fees: what the business actually keeps. */
export function netMonthlyEur(gross: number): number {
  if (gross <= 0) return 0;
  const exVat = gross / (1 + vatRate());
  const fees = gross * feePct() + feeFixedEur();
  return Math.max(0, exVat - fees);
}

/** The month's AI cost ceiling for a household on this plan and seat count. */
export function monthlyBudgetEur(planId: string, seatLimit: number): number {
  const gross = grossMonthlyEur(planId, seatLimit);
  if (gross <= 0) return freeAllowanceEur();
  return netMonthlyEur(gross) * costShare();
}

/**
 * Days in the current month, Lisbon time. The daily share is pro-rata, so a
 * 28-day February gets a slightly larger daily slice than a 31-day March
 * rather than the month running out three days early.
 */
function daysInMonth(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" })
  );
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * How much of one day's pro-rata share a household may spend in a single day.
 *
 * Above 1 on purpose. A hard daily quota would punish the Saturday morning
 * when the whole family sits down together, which is exactly the behaviour
 * worth encouraging. This only stops one person consuming the entire month in
 * an afternoon.
 */
function burstFactor(): number {
  const n = Number(process.env.DAILY_BURST_FACTOR);
  return Number.isFinite(n) && n >= 1 ? n : 3;
}

function lisbonDayStart(): Date {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon",
  });
  return new Date(`${day}T00:00:00Z`);
}

export type BudgetState = {
  /** Null for someone with no household — an operator, not a customer. */
  accountId: number | null;
  planId: string;
  seatLimit: number;
  grossEur: number;
  netEur: number;
  /** The month's ceiling. */
  budgetEur: number;
  spentEur: number;
  remainingEur: number;
  /** 0-100, clamped, for a progress bar. */
  pct: number;
  dayBudgetEur: number;
  daySpentEur: number;
  /** Why further AI spend is refused, or null when it is allowed. */
  blocked: null | "month" | "day";
  /** True when this session is exempt (operator / no account). */
  exempt: boolean;
};

const UNLIMITED: BudgetState = {
  accountId: null, planId: "operator", seatLimit: 0,
  grossEur: 0, netEur: 0, budgetEur: Infinity, spentEur: 0,
  remainingEur: Infinity, pct: 0, dayBudgetEur: Infinity, daySpentEur: 0,
  blocked: null, exempt: true,
};

/**
 * The current session's budget position.
 *
 * cache() so the dozen callers in one request share a single pair of queries.
 * Fails OPEN on any error: a telemetry problem must never take the app away
 * from someone who paid for it.
 */
export const budgetState = cache(async (): Promise<BudgetState> => {
  try {
    const accountId = await currentAccountId();
    // No household means no subscription to measure against. That is the
    // platform operator, whose usage is the business's own cost, not a
    // customer's allowance.
    if (accountId === null) return UNLIMITED;

    const db = getDb();
    const [account] = await db
      .select({ plan: accounts.plan, seatLimit: accounts.seatLimit })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);
    if (!account) return UNLIMITED;

    const mine = await householdUsernames();
    if (mine.length === 0) return UNLIMITED;

    const [row] = await db
      .select({
        monthMicro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
        dayMicro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}) filter (where ${aiUsage.createdAt} >= ${lisbonDayStart()}), 0)::bigint`,
      })
      .from(aiUsage)
      .where(
        and(
          inArray(aiUsage.username, mine),
          gte(aiUsage.createdAt, lisbonMonthStart())
        )
      );

    const rate = usdToEur();
    const spentEur = (Number(row?.monthMicro ?? 0) / 1_000_000) * rate;
    const daySpentEur = (Number(row?.dayMicro ?? 0) / 1_000_000) * rate;

    const grossEur = grossMonthlyEur(account.plan, account.seatLimit);
    const budgetEur = monthlyBudgetEur(account.plan, account.seatLimit);
    const dayBudgetEur = (budgetEur / daysInMonth()) * burstFactor();

    return {
      accountId,
      planId: account.plan,
      seatLimit: account.seatLimit,
      grossEur,
      netEur: netMonthlyEur(grossEur),
      budgetEur,
      spentEur,
      remainingEur: Math.max(0, budgetEur - spentEur),
      pct: Math.min(100, Math.round((spentEur / Math.max(budgetEur, 0.0001)) * 100)),
      dayBudgetEur,
      daySpentEur,
      blocked:
        spentEur >= budgetEur ? "month" : daySpentEur >= dayBudgetEur ? "day" : null,
      exempt: false,
    };
  } catch {
    return UNLIMITED;
  }
});
