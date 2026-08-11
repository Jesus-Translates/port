"use server";

import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { accounts, getDb, memberships, subscriptions } from "@/lib/db";
import { grossMonthlyEur, MAX_SEATS, planById, type Plan } from "@/lib/plans";
import { currentAccountId } from "@/lib/tenant";
import { logActivity } from "@/lib/data";
import { revalidatePath } from "next/cache";

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
  /** What the household invoices per month, seats beyond the plan included. */
  monthlyEur: number;
  /** Money-back window: null once it has passed or was never started. */
  guarantee: { endsOn: string; daysLeft: number } | null;
  /** A refund has been asked for and not yet settled. */
  refundRequested: boolean;
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

  // The guarantee is only news while it is still claimable. A window that
  // closed last month is not reassurance, it is a reminder of a missed door.
  const endsAt = sub?.guaranteeEndsAt ? new Date(sub.guaranteeEndsAt) : null;
  const msLeft = endsAt ? endsAt.getTime() - Date.now() : -1;

  return {
    householdName: account.name,
    plan: planById(account.plan),
    seatsUsed: members.length,
    seatLimit: account.seatLimit,
    status: sub?.status ?? "none",
    renewsOn: day(sub?.currentPeriodEnd),
    cancelsOn: day(sub?.cancelAt),
    canManage: me?.role === "owner" || me?.role === "parent",
    monthlyEur: grossMonthlyEur(account.plan, account.seatLimit),
    guarantee:
      endsAt && msLeft > 0
        ? {
            endsOn: day(endsAt) ?? "",
            daysLeft: Math.max(1, Math.ceil(msLeft / 86_400_000)),
          }
        : null,
    refundRequested: sub?.status === "refund_requested",
  };
}

/**
 * Change how many people the family pays for.
 *
 * Seats are the price, so this is the one self-service billing control that
 * exists. It refuses to drop below the people already in the household —
 * silently orphaning a child's account to save five euros is not a checkout
 * flow, it is data loss with a discount attached.
 */
export async function setSeats(
  seats: number
): Promise<{ ok: true; seatLimit: number; monthlyEur: number } | { ok: false; error: string }> {
  const session = await requireSession();
  const accountId = await currentAccountId();
  if (accountId === null) {
    return { ok: false, error: "A tua conta não pertence a uma família." };
  }

  const db = getDb();
  const [[me], [account], members] = await Promise.all([
    db
      .select({ role: memberships.role })
      .from(memberships)
      .where(eq(memberships.username, session.username))
      .limit(1),
    db
      .select({ plan: accounts.plan })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1),
    db
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, accountId)),
  ]);
  if (me?.role !== "owner" && me?.role !== "parent") {
    return { ok: false, error: "Só um adulto da família pode mudar isto." };
  }
  if (!account) return { ok: false, error: "Família não encontrada." };

  const plan = planById(account.plan);
  const want = Math.round(Number(seats));
  if (!Number.isFinite(want)) return { ok: false, error: "Número inválido." };

  const floor = Math.max(plan.seats === 1 ? 1 : 1, members.length);
  if (want < floor) {
    return {
      ok: false,
      error: `Já são ${members.length} na família. Remove alguém primeiro em Contas.`,
    };
  }
  if (want > MAX_SEATS) {
    return { ok: false, error: `O máximo é ${MAX_SEATS} pessoas.` };
  }

  await db.update(accounts).set({ seatLimit: want }).where(eq(accounts.id, accountId));
  revalidatePath("/conta");
  revalidatePath("/familia");
  return { ok: true, seatLimit: want, monthlyEur: grossMonthlyEur(account.plan, want) };
}

/**
 * Claim the money-back guarantee.
 *
 * Deliberately one click and no interrogation. A guarantee that makes you
 * explain yourself is not a guarantee, and the whole reason it converts better
 * than a free trial is that people believe it will be honoured. Settling the
 * refund itself is manual until payments are wired — this records the claim so
 * it lands on the operator's report instead of in an inbox.
 */
export async function requestRefund(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const accountId = await currentAccountId();
  if (accountId === null) {
    return { ok: false, error: "A tua conta não pertence a uma família." };
  }

  const db = getDb();
  const [me] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(eq(memberships.username, session.username))
    .limit(1);
  if (me?.role !== "owner" && me?.role !== "parent") {
    return { ok: false, error: "Só um adulto da família pode pedir isto." };
  }

  const [sub] = await db
    .select({ guaranteeEndsAt: subscriptions.guaranteeEndsAt })
    .from(subscriptions)
    .where(eq(subscriptions.accountId, accountId))
    .limit(1);
  const endsAt = sub?.guaranteeEndsAt ? new Date(sub.guaranteeEndsAt) : null;
  if (!endsAt || endsAt.getTime() <= Date.now()) {
    return { ok: false, error: "O prazo da garantia já passou." };
  }

  await db
    .update(subscriptions)
    .set({ status: "refund_requested", updatedAt: new Date() })
    .where(eq(subscriptions.accountId, accountId));
  await logActivity(
    session.username,
    "billing",
    "Pediu a devolução dentro da garantia 💶",
    0
  );
  revalidatePath("/conta");
  return { ok: true };
}
