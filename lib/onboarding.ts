import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
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
 */
export type OnboardingStep = "place" | "level" | "prefs" | "ready";

export type OnboardingState = {
  step: OnboardingStep;
  /** 1-based, for "passo 2 de 3". */
  index: number;
  total: number;
  done: boolean;
};

export const ONBOARDING_STEPS = 3;

export async function onboardingState(
  username: string
): Promise<OnboardingState> {
  let livesAnswered = false;
  let prefsAnswered = false;

  try {
    const [row] = await getDb()
      .select({ lives: users.livesInPortugal, prefs: users.prefs })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    livesAnswered = row?.lives !== null && row?.lives !== undefined;
    prefsAnswered = readPrefs(row?.prefs) !== null;
  } catch {
    // If we cannot read it, do not trap someone in onboarding forever.
    return { step: "ready", index: ONBOARDING_STEPS, total: ONBOARDING_STEPS, done: true };
  }

  const placed = await hasBeenPlaced(username).catch(() => true);

  if (!livesAnswered) {
    return { step: "place", index: 1, total: ONBOARDING_STEPS, done: false };
  }
  if (!placed) {
    return { step: "level", index: 2, total: ONBOARDING_STEPS, done: false };
  }
  if (!prefsAnswered) {
    return { step: "prefs", index: 3, total: ONBOARDING_STEPS, done: false };
  }
  return { step: "ready", index: ONBOARDING_STEPS, total: ONBOARDING_STEPS, done: true };
}

/** Has this person finished first-run setup? */
export async function isOnboarded(username: string): Promise<boolean> {
  return (await onboardingState(username)).done;
}
