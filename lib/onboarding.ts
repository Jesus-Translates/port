import { eq, sql } from "drizzle-orm";
import { accounts, getDb, memberships, users } from "@/lib/db";
import { hasBeenPlaced } from "@/lib/data";
import { readPrefs } from "@/lib/learning-path";

/**
 * First run, as a sequence rather than a pile.
 *
 * All three questions already existed, stacked on one page — which is exactly
 * the wall the guided surface was built to remove. A new person met a location
 * form, a sixteen-question test and a five-question survey all at once, and had
 * to work out for themselves which to do first and what any of it was for.
 *
 * Now it is one thing at a time, in the order where each answer improves the
 * next: where you live shapes the examples, the test sets the level, the survey
 * shapes the path, and then the course is waiting.
 *
 * The fourth step only exists for the buyer. The product is sold by the seat —
 * a family plan with four included — yet nothing in the flow ever mentioned
 * other people; the only door was an admin console a parent has no reason to
 * open. So after the three questions about YOU comes the one about everyone
 * else: "Quem mais vive cá em casa?". Children and solo plans never see it.
 */
export type OnboardingStep = "place" | "level" | "prefs" | "family" | "ready";

export type OnboardingState = {
  step: OnboardingStep;
  /** 1-based, for "passo 2 de 3". */
  index: number;
  total: number;
  done: boolean;
  /**
   * Whether this must be finished before anything else.
   *
   * Only the location and the level qualify: without them every lesson is
   * pitched at a guess. The learning survey is genuinely optional — hijacking
   * the dashboard of someone with cards due today, to ask a preference
   * question, buries the work they came to do. The family step is optional
   * for the same reason, and doubly so: a solo learner is a legitimate
   * customer, not an incomplete one.
   */
  required: boolean;
};

export const ONBOARDING_STEPS = 3;

/**
 * Does the "who else lives here?" step apply to this person right now?
 *
 * Only for a household's adults (owner/parent membership), only on a plan with
 * more than one seat, and only while seats are still empty — a full family has
 * nothing left to add and must not meet a dead-end screen. Any read failure
 * answers "no": a broken household lookup must never add a step, let alone
 * trap someone behind one.
 */
async function familyStepApplies(username: string): Promise<boolean> {
  try {
    const db = getDb();
    const [m] = await db
      .select({ accountId: memberships.accountId, role: memberships.role })
      .from(memberships)
      .where(eq(memberships.username, username))
      .limit(1);
    if (!m || (m.role !== "owner" && m.role !== "parent")) return false;

    // Seat limit and current occupancy in ONE query (join + count) rather than
    // two. This runs on every dashboard render while familyStepAt is null —
    // i.e. forever for children and solo owners — so the round-trip count
    // matters on the hottest path in the app.
    const [row] = await db
      .select({
        seatLimit: accounts.seatLimit,
        taken: sql<number>`count(${memberships.username})::int`,
      })
      .from(accounts)
      .leftJoin(memberships, eq(memberships.accountId, accounts.id))
      .where(eq(accounts.id, m.accountId))
      .groupBy(accounts.id, accounts.seatLimit);
    const seatLimit = row?.seatLimit ?? 1;
    if (seatLimit <= 1) return false;
    return Number(row?.taken ?? 0) < seatLimit;
  } catch {
    return false;
  }
}

export async function onboardingState(
  username: string
): Promise<OnboardingState> {
  let livesAnswered = false;
  let prefsAnswered = false;
  let familyAnswered = false;

  try {
    const [row] = await getDb()
      .select({
        lives: users.livesInPortugal,
        prefs: users.prefs,
        familyStepAt: users.familyStepAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    livesAnswered = row?.lives !== null && row?.lives !== undefined;
    prefsAnswered = readPrefs(row?.prefs) !== null;
    familyAnswered = row?.familyStepAt != null;
  } catch {
    // If we cannot read it, do not trap someone in onboarding forever.
    return {
      step: "ready",
      index: ONBOARDING_STEPS,
      total: ONBOARDING_STEPS,
      done: true,
      required: false,
    };
  }

  // Independent lookups, run together. The family check only fires while the
  // step is unanswered; once answered it never queries again.
  const [placed, applies] = await Promise.all([
    hasBeenPlaced(username).catch(() => true),
    familyAnswered ? Promise.resolve(false) : familyStepApplies(username),
  ]);
  const familyPending = !familyAnswered && applies;
  const total = familyPending ? ONBOARDING_STEPS + 1 : ONBOARDING_STEPS;

  if (!livesAnswered) {
    return { step: "place", index: 1, total, done: false, required: true };
  }
  if (!placed) {
    return { step: "level", index: 2, total, done: false, required: true };
  }
  if (!prefsAnswered) {
    return { step: "prefs", index: 3, total, done: false, required: false };
  }
  if (familyPending) {
    return { step: "family", index: 4, total, done: false, required: false };
  }
  return {
    step: "ready",
    index: total,
    total,
    done: true,
    required: false,
  };
}

/** Has this person finished first-run setup? */
export async function isOnboarded(username: string): Promise<boolean> {
  return (await onboardingState(username)).done;
}
