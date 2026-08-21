import { cache } from "react";
import { and, gte, inArray, sql } from "drizzle-orm";
import { accounts, aiUsage, getDb, memberships } from "@/lib/db";
// The same Monday the leaderboards count from — one definition, so a learner's
// weekly allowance and their weekly score can never disagree about the week.
import { lisbonWeekStart } from "@/lib/period";
import { eq } from "drizzle-orm";
import { grossMonthlyEur, multiplierFor } from "@/lib/plans";
import { getSession } from "@/lib/auth";
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

/**
 * Share of net revenue a household may consume in AI cost. Margin floor is
 * 1 minus this.
 *
 * 0.60 — a 40% floor — chosen over 0.75 and 0.50 for a specific reason. At
 * 0.50 the ceiling falls BELOW measured heavy use on the Individual and
 * four-seat plans (€3,87 against €3,94; €7,86 against €7,88), so the cap would
 * fire in the last days of the month on the most engaged families — the ones
 * least worth throttling.
 *
 * At 0.60 heavy use fits at every plan size, though not everywhere by much:
 * five seats lands exactly on the line and ten within fifteen cents. That is an
 * artefact of rounding "active members" up (5 x 0.55 -> 3), not a real cliff —
 * but it is the reason not to go lower, and the reason to re-measure once real
 * families are generating real numbers. Typical use is about a fifth of the
 * allowance at every size.
 *
 * Note what "net" is: gross less VAT and card fees. Corporate tax comes out of
 * the margin AFTER this, so a 40% floor is not 40% profit.
 */
export function costShare(): number {
  const n = Number(process.env.MAX_COST_SHARE);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.6;
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
 * What a Pro seat multiplies its allowance by.
 *
 * Pro is an add-on ON A SEAT, priced to cover the extra AI it buys — so the
 * multiplier raises the seat's weekly rail AND the household's monthly
 * ceiling. Raising only the rail would sell somebody capacity the household
 * cap then refuses, which is worse than not selling it.
 */
/** @deprecated Seats carry their own tier now — see plans.multiplierFor(). */
export function proMultiplier(): number {
  const n = Number(process.env.PRO_MULTIPLIER);
  return Number.isFinite(n) && n >= 1 ? n : 5;
}

/**
 * The most of the household's WEEK any one person may take.
 *
 * Strict per-seat was fair and wasteful: a family of four with two active
 * learners had half its allowance sitting in dormant seats, and the two people
 * actually studying were held to a quarter each. Pooling gives them the room
 * that nobody else is using; the ceiling is what stops one member eating the
 * family's week.
 *
 * Above 1/seats by construction, so it is always more generous than an equal
 * split — and below 1, so nobody can ever take it all.
 */
export function memberWeekShare(): number {
  const n = Number(process.env.MEMBER_WEEK_SHARE);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.6;
}

/** Warn the learner at this share of their weekly allowance. */
export function warnAt(): number {
  const n = Number(process.env.USAGE_WARN_AT);
  return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.75;
}

/**
 * Monday 00:00 Lisbon. A CALENDAR week, not a rolling one.
 *
 * "Renews Monday" is a promise somebody can plan around; "renews 168 hours
 * after whenever you started" is not.
 */
/** Days until the weekly allowance resets, for the meter's copy. */
function daysToWeekReset(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" })
  );
  return 7 - ((now.getDay() + 6) % 7);
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
  /** THIS SEAT's weekly rail — per person, not per household. */
  weekBudgetEur: number;
  weekSpentEur: number;
  /** 0-100 of the weekly rail; what the meter shows. */
  weekPct: number;
  /** True once weekPct crosses the warn threshold. */
  nearLimit: boolean;
  daysToReset: number;
  /** Is this seat on an add-on right now? */
  pro: boolean;
  /** Which one — "boost" | "pro" | null. */
  proTier: string | null;
  /** The multiplier actually in force for this seat. */
  multiplier: number;
  /** Why further AI spend is refused, or null when it is allowed. */
  blocked: null | "month" | "week";
  /** True when this session is exempt (operator / no account). */
  exempt: boolean;
};

const UNLIMITED: BudgetState = {
  accountId: null, planId: "operator", seatLimit: 0,
  grossEur: 0, netEur: 0, budgetEur: Infinity, spentEur: 0,
  remainingEur: Infinity, pct: 0,
  weekBudgetEur: Infinity, weekSpentEur: 0, weekPct: 0, nearLimit: false,
  daysToReset: 7, pro: false, proTier: null, multiplier: 1,
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
    const session = await getSession();
    if (!session) return UNLIMITED;

    /*
     * Two aggregations, two different scopes, on purpose.
     *
     * The MONTH is the household's — that is the margin guarantee, and it has
     * to hold across everyone. The WEEK is this person's own: the rail exists
     * so one member cannot eat the family's month, and the old daily rail did
     * that by blocking the whole household the moment anybody was heavy, which
     * punished the family for one person's Saturday.
     */
    const [row] = await db
      .select({
        monthMicro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
      })
      .from(aiUsage)
      .where(
        and(
          inArray(aiUsage.username, mine),
          gte(aiUsage.createdAt, lisbonMonthStart())
        )
      );

    const [weekRow] = await db
      .select({
        micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
      })
      .from(aiUsage)
      .where(
        and(
          eq(aiUsage.username, session.username),
          gte(aiUsage.createdAt, lisbonWeekStart())
        )
      );

    const rate = usdToEur();
    const spentEur = (Number(row?.monthMicro ?? 0) / 1_000_000) * rate;
    const weekSpentEur = (Number(weekRow?.micro ?? 0) / 1_000_000) * rate;

    /*
     * Pro raises BOTH rails, and that is not optional.
     *
     * A Pro seat's weekly allowance is multiplied, so the household's monthly
     * ceiling must rise by the same amount of capacity — otherwise the family
     * buys extra credits and the month cap refuses them, which is worse than
     * never selling it. The add-on is priced to cover exactly this, so the
     * margin floor is unmoved.
     */
    const seats = Math.max(1, account.seatLimit);
    const seatRows = await db
      .select({
        username: memberships.username,
        proUntil: memberships.proUntil,
        proTier: memberships.proTier,
      })
      .from(memberships)
      .where(eq(memberships.accountId, accountId));

    // Each seat carries its OWN tier, so a family can put one adult on Pro and
    // leave the children on base — which is the whole reason it is affordable.
    const multOf = (u: string) => {
      const r = seatRows.find((x) => x.username === u);
      return multiplierFor(r?.proTier, r?.proUntil);
    };
    // Capacity the household is entitled to: every seat at its own multiple,
    // and unoccupied seats at 1.
    const seatMultiplierSum =
      seatRows.reduce((n, r) => n + multiplierFor(r.proTier, r.proUntil), 0) +
      Math.max(0, seats - seatRows.length);

    const grossEur = grossMonthlyEur(account.plan, account.seatLimit);
    const baseBudget = monthlyBudgetEur(account.plan, account.seatLimit);
    const perSeatMonth = baseBudget / seats;
    // The household ceiling funds every seat, Pro seats at their multiple.
    const budgetEur = perSeatMonth * seatMultiplierSum;

    const mult = multOf(session.username);
    const pro = mult > 1;
    const myRow = seatRows.find((r) => r.username === session.username);

    /*
     * POOLED, with a per-person ceiling.
     *
     * The household's week is shared — a family with two active learners out
     * of four should not have half its allowance stranded in seats nobody is
     * using. What one person may take from it is capped, which is the actual
     * fairness rule: nobody starves anybody, and nobody is held to a quarter
     * of a pot three-quarters empty.
     *
     * The floor is an equal split, so pooling can only ever be MORE generous
     * than per-seat, never less. A Pro seat's own multiplier applies on top —
     * the household ceiling already rose to fund it.
     */
    const householdWeek = budgetEur * (7 / daysInMonth());
    const equalSplit = householdWeek / seats;
    const weekBudgetEur =
      Math.max(equalSplit, householdWeek * memberWeekShare()) * mult;
    const weekPct = Math.min(
      100,
      Math.round((weekSpentEur / Math.max(weekBudgetEur, 0.0001)) * 100)
    );

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
      weekBudgetEur,
      weekSpentEur,
      weekPct,
      nearLimit: weekPct >= Math.round(warnAt() * 100),
      daysToReset: daysToWeekReset(),
      pro,
      proTier: pro ? (myRow?.proTier ?? null) : null,
      multiplier: mult,
      blocked:
        spentEur >= budgetEur
          ? "month"
          : weekSpentEur >= weekBudgetEur
            ? "week"
            : null,
      exempt: false,
    };
  } catch {
    return UNLIMITED;
  }
});
