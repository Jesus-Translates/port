"use server";

import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { accounts, getDb, memberships, subscriptions } from "@/lib/db";
import { planById, type Plan } from "@/lib/plans";
import { currentAccountId } from "@/lib/tenant";

/**
 * What THIS family pays — and deliberately nothing about what it costs to run.
 *
 * The AI spend figures (€ per call, per learner, per month) are an operator's
 * numbers. Showing a customer that their conversation with Sandra cost four
 * cents invites exactly one thought — "am I being metered?" — and the answer
 * is no: they pay a flat monthly price. So the two surfaces are separate, and
 * /gastos is now operator-only.
 */

export type Billing = {
  householdName: string;
  plan: Plan;
  seatsUsed: number;
  seatLimit: number;
  /** Subscription status from Stripe, or "none" until one exists. */
  status: string;
  renewsOn: string | null;
  cancelsOn: string | null;
  /** Owner or parent — only they should see a manage/upgrade control. */
  canManage: boolean;
};

export async function getBilling(): Promise<Billing | null> {
  const session = await requireSession();
  const accountId = await currentAccountId();
  if (accountId === null) return null;

  const db = getDb();
  const [account] = await db
    .select({
      name: accounts.name,
      plan: accounts.plan,
      seatLimit: accounts.seatLimit,
    })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);
  if (!account) return null;

  const [members, sub, [me]] = await Promise.all([
    db
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, accountId)),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.accountId, accountId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({ role: memberships.role })
      .from(memberships)
      .where(eq(memberships.username, session.username))
      .limit(1),
  ]);

  const day = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-PT", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Europe/Lisbon",
        })
      : null;

  return {
    householdName: account.name,
    plan: planById(account.plan),
    seatsUsed: members.length,
    seatLimit: account.seatLimit,
    status: sub?.status ?? "none",
    renewsOn: day(sub?.currentPeriodEnd),
    cancelsOn: day(sub?.cancelAt),
    canManage: me?.role === "owner" || me?.role === "parent",
  };
}
