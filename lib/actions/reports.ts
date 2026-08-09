"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import {
  accounts,
  aiUsage,
  activity,
  getDb,
  memberships,
  subscriptions,
  users,
} from "@/lib/db";
import { usdToEur } from "@/lib/usage";

/**
 * Per-household reporting: what each account costs to run, what it brings in,
 * and therefore whether it is worth running.
 *
 * Grouped queries and Maps throughout — a correlated sub-select of the form
 * `(select … where a.x = b.id)` renders the outer column unqualified in this
 * codebase's query builder and silently binds to the wrong table, returning
 * zeros. That has bitten this repo more than once, and a revenue report that
 * quietly reads zero is the worst possible place for it to happen again.
 */

/**
 * List price per plan, in EUR per month. Override per environment so a price
 * change does not need a deploy. These are what we INTEND to charge — real
 * collected revenue only becomes knowable once Stripe is wired, and the panel
 * says so rather than dressing an estimate up as an invoice.
 */
function planPriceEur(plan: string): number {
  const env = Number(
    process.env[`PLAN_PRICE_${plan.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`]
  );
  if (env > 0) return env;
  return plan === "family" ? 14.99 : plan === "individual" ? 7.99 : 0;
}

/** A subscription in one of these states is one we can expect to be paid for. */
const PAYING = ["active", "trialing"];

export type HouseholdReport = {
  accountId: number;
  name: string;
  plan: string;
  seatLimit: number;
  members: { username: string; displayName: string; role: string }[];
  subscription: { status: string; periodEnd: string | null };
  /** EUR of model + speech spend. */
  costMonth: number;
  costAllTime: number;
  /** Expected EUR/month from the plan, 0 unless the subscription is paying. */
  revenueMonth: number;
  /** revenueMonth - costMonth. Negative means this household loses money. */
  marginMonth: number;
  /** Learning activity this month — cost with nothing to show for it is worse. */
  activityMonth: number;
  costByKind: { kind: string; eur: number }[];
};

export type ReportsSummary = {
  households: HouseholdReport[];
  totals: {
    costMonth: number;
    revenueMonth: number;
    marginMonth: number;
    payingHouseholds: number;
  };
  /** True once real payment data exists; until then revenue is list price. */
  revenueIsEstimate: boolean;
  /** Members with no household — they would otherwise be invisible here. */
  unassigned: string[];
};

export async function getHouseholdReports(): Promise<ReportsSummary> {
  await requireAdmin();
  const db = getDb();
  const rate = usdToEur();
  const monthStart = sql`date_trunc('month', now())`;

  const [accountRows, memberRows, subRows, userRows] = await Promise.all([
    db.select().from(accounts),
    db.select().from(memberships),
    db.select().from(subscriptions),
    db.select({ username: users.username, displayName: users.displayName }).from(users),
  ]);

  const nameByUser = new Map(userRows.map((u) => [u.username, u.displayName]));
  const membersByAccount = new Map<number, HouseholdReport["members"]>();
  const accountByUser = new Map<string, number>();
  for (const m of memberRows) {
    const list = membersByAccount.get(m.accountId) ?? [];
    list.push({
      username: m.username,
      displayName: nameByUser.get(m.username) ?? m.username,
      role: m.role,
    });
    membersByAccount.set(m.accountId, list);
    accountByUser.set(m.username, m.accountId);
  }

  // Spend, grouped by user — then folded up into households in memory.
  const [monthSpend, allSpend, kindSpend, monthActivity] = await Promise.all([
    db
      .select({
        username: aiUsage.username,
        micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)`,
      })
      .from(aiUsage)
      .where(gte(aiUsage.createdAt, monthStart))
      .groupBy(aiUsage.username),
    db
      .select({
        username: aiUsage.username,
        micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)`,
      })
      .from(aiUsage)
      .groupBy(aiUsage.username),
    db
      .select({
        username: aiUsage.username,
        kind: aiUsage.kind,
        micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)`,
      })
      .from(aiUsage)
      .where(gte(aiUsage.createdAt, monthStart))
      .groupBy(aiUsage.username, aiUsage.kind),
    db
      .select({
        username: activity.username,
        n: sql<number>`count(*)`,
      })
      .from(activity)
      .where(gte(activity.createdAt, monthStart))
      .groupBy(activity.username),
  ]);

  const eur = (micro: number) => (Number(micro) / 1_000_000) * rate;
  const monthByUser = new Map(monthSpend.map((r) => [r.username, eur(r.micro)]));
  const allByUser = new Map(allSpend.map((r) => [r.username, eur(r.micro)]));
  const actByUser = new Map(monthActivity.map((r) => [r.username, Number(r.n)]));
  const subByAccount = new Map(subRows.map((s) => [s.accountId, s]));

  const households: HouseholdReport[] = accountRows.map((a) => {
    const members = membersByAccount.get(a.id) ?? [];
    const usernames = new Set(members.map((m) => m.username));

    const costMonth = sum(members.map((m) => monthByUser.get(m.username) ?? 0));
    const costAllTime = sum(members.map((m) => allByUser.get(m.username) ?? 0));
    const activityMonth = sum(members.map((m) => actByUser.get(m.username) ?? 0));

    const byKind = new Map<string, number>();
    for (const row of kindSpend) {
      if (!usernames.has(row.username)) continue;
      byKind.set(row.kind, (byKind.get(row.kind) ?? 0) + eur(row.micro));
    }

    const sub = subByAccount.get(a.id);
    const paying = Boolean(sub && PAYING.includes(sub.status));
    const revenueMonth = paying ? planPriceEur(a.plan) : 0;

    return {
      accountId: a.id,
      name: a.name,
      plan: a.plan,
      seatLimit: a.seatLimit,
      members,
      subscription: {
        status: sub?.status ?? "none",
        periodEnd: sub?.currentPeriodEnd
          ? new Date(sub.currentPeriodEnd).toISOString().slice(0, 10)
          : null,
      },
      costMonth,
      costAllTime,
      revenueMonth,
      marginMonth: revenueMonth - costMonth,
      activityMonth,
      costByKind: [...byKind.entries()]
        .map(([kind, eurValue]) => ({ kind, eur: eurValue }))
        .sort((x, y) => y.eur - x.eur),
    };
  });

  households.sort((a, b) => b.costMonth - a.costMonth);

  const unassigned = userRows
    .map((u) => u.username)
    .filter((u) => !accountByUser.has(u));

  return {
    households,
    totals: {
      costMonth: sum(households.map((h) => h.costMonth)),
      revenueMonth: sum(households.map((h) => h.revenueMonth)),
      marginMonth: sum(households.map((h) => h.marginMonth)),
      payingHouseholds: households.filter((h) => h.revenueMonth > 0).length,
    },
    // Nothing writes a Stripe id yet, so every euro of revenue here is list
    // price against a status, not money actually collected.
    revenueIsEstimate: !subRows.some((s) => s.stripeSubscriptionId),
    unassigned,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Spend for one household broken down per member, for the drill-down. */
export async function getHouseholdMembers(
  accountId: number
): Promise<{ username: string; displayName: string; eurMonth: number }[]> {
  await requireAdmin();
  const db = getDb();
  const rate = usdToEur();

  const members = await db
    .select({ username: memberships.username })
    .from(memberships)
    .where(eq(memberships.accountId, accountId));
  if (members.length === 0) return [];

  const names = members.map((m) => m.username);
  const [spend, userRows] = await Promise.all([
    db
      .select({
        username: aiUsage.username,
        micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)`,
      })
      .from(aiUsage)
      .where(
        and(
          inArray(aiUsage.username, names),
          gte(aiUsage.createdAt, sql`date_trunc('month', now())`)
        )
      )
      .groupBy(aiUsage.username),
    db
      .select({ username: users.username, displayName: users.displayName })
      .from(users)
      .where(inArray(users.username, names)),
  ]);

  const byUser = new Map(spend.map((r) => [r.username, Number(r.micro)]));
  const nameBy = new Map(userRows.map((u) => [u.username, u.displayName]));

  return names
    .map((username) => ({
      username,
      displayName: nameBy.get(username) ?? username,
      eurMonth: ((byUser.get(username) ?? 0) / 1_000_000) * rate,
    }))
    .sort((a, b) => b.eurMonth - a.eurMonth);
}
