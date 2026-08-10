"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { getDb, householdSettings, memberships } from "@/lib/db";
import {
  DEFAULT_HOUSEHOLD_SETTINGS,
  type HouseholdSettings,
} from "@/lib/household";
import { currentAccountId } from "@/lib/tenant";

/**
 * Settings a family makes together, set by any owner or parent.
 *
 * These are household decisions rather than personal ones: turning immersion
 * on for a nine-year-old, or turning English glosses on because two of the
 * three learners are beginners. A child should not be able to switch either.
 *
 * PRECEDENCE, and the thing to keep straight: the household setting is the
 * DEFAULT. A member who picks immersion for themselves in Perfil overrides it
 * — the family decides how the app starts, the individual decides how it ends
 * up. Bilingual has no personal override; it is a display decision for the
 * whole house.
 */

/** Read the signed-in learner's household settings. Never throws. */
export async function getHouseholdSettings(): Promise<HouseholdSettings> {
  try {
    const accountId = await currentAccountId();
    if (accountId === null) return DEFAULT_HOUSEHOLD_SETTINGS;
    const [row] = await getDb()
      .select()
      .from(householdSettings)
      .where(eq(householdSettings.accountId, accountId))
      .limit(1);
    if (!row) return DEFAULT_HOUSEHOLD_SETTINGS;
    return {
      immersion: row.immersion === "total" ? "total" : "ajuda",
      bilingual: row.bilingual,
    };
  } catch {
    return DEFAULT_HOUSEHOLD_SETTINGS;
  }
}

/** Owner or parent — the two roles that speak for the household. */
export async function canSetHouseholdSettings(): Promise<boolean> {
  try {
    const session = await requireSession();
    const [row] = await getDb()
      .select({ role: memberships.role })
      .from(memberships)
      .where(eq(memberships.username, session.username))
      .limit(1);
    return row?.role === "owner" || row?.role === "parent";
  } catch {
    return false;
  }
}

export async function setHouseholdSettings(
  input: Partial<HouseholdSettings>
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  const accountId = await currentAccountId();
  if (accountId === null) {
    return { ok: false, error: "A tua conta não pertence a uma família." };
  }
  if (!(await canSetHouseholdSettings())) {
    return { ok: false, error: "Só um adulto da família pode mudar isto." };
  }

  // Merge over what is stored, not over the defaults — a single toggle must
  // not silently reset the other setting.
  const current = await getHouseholdSettings();
  const next: HouseholdSettings = {
    immersion:
      input.immersion === "total"
        ? "total"
        : input.immersion === "ajuda"
          ? "ajuda"
          : current.immersion,
    bilingual: input.bilingual ?? current.bilingual,
  };

  await getDb()
    .insert(householdSettings)
    .values({ accountId, ...next })
    .onConflictDoUpdate({
      target: householdSettings.accountId,
      set: { ...next, updatedAt: new Date() },
    });

  // Both settings change how every screen renders, so the whole tree is stale.
  revalidatePath("/", "layout");
  void session;
  return { ok: true };
}
