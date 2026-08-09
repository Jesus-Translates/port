import { cache } from "react";
import { eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, memberships, users } from "@/lib/db";

/**
 * Which household the signed-in person belongs to, and who else is in it.
 *
 * The isolation trick: every table that holds user-authored content ALREADY
 * carries the username that made it, and a household is simply a set of
 * usernames. So tenancy needs no accountId column bolted onto a dozen tables
 * and no migration over live data — it needs every listing query to ask "whose
 * rows may I see?" and get back a set instead of everything.
 *
 * Seeded product content (the 126 units, the phrasebook packs, the missions) is
 * deliberately GLOBAL: a new family signing up should find a full app, not an
 * empty one. Only rows made BY somebody are owned by somebody.
 */

/** Rows created by the seeder belong to the product, not to any household. */
export const SEED_OWNER = "seed";

/**
 * The account id for the current session, or null when the person has no
 * membership row yet.
 *
 * cache() means one lookup per request no matter how many queries scope
 * themselves, which is what makes it affordable to call this everywhere.
 */
export const currentAccountId = cache(async (): Promise<number | null> => {
  const session = await getSession().catch(() => null);
  if (!session) return null;
  try {
    const [row] = await getDb()
      .select({ accountId: memberships.accountId })
      .from(memberships)
      .where(eq(memberships.username, session.username))
      .limit(1);
    return row?.accountId ?? null;
  } catch {
    return null;
  }
});

/**
 * Every username in the signed-in person's household, lowercase.
 *
 * The fallback is the important part: somebody with no membership row is
 * treated as a household of one — themselves. That fails CLOSED. Falling back
 * to "everyone" would mean a single missing row silently reopens the leak this
 * whole module exists to close.
 */
export const householdUsernames = cache(async (): Promise<string[]> => {
  const session = await getSession().catch(() => null);
  if (!session) return [];
  const accountId = await currentAccountId();
  if (accountId === null) return [session.username];

  try {
    const rows = await getDb()
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, accountId));
    const names = rows.map((r) => r.username.toLowerCase());
    // Never lock someone out of their own content because of a missing row.
    return names.includes(session.username) ? names : [...names, session.username];
  } catch {
    return [session.username];
  }
});

/** The household's members with display names, for pickers and leaderboards. */
export const householdMembers = cache(
  async (): Promise<{ username: string; displayName: string }[]> => {
    const names = await householdUsernames();
    if (names.length === 0) return [];
    try {
      const rows = await getDb()
        .select({
          username: users.username,
          displayName: users.displayName,
          active: users.active,
        })
        .from(users)
        .where(inArray(users.username, names));
      return rows
        .filter((r) => r.active)
        .map((r) => ({ username: r.username, displayName: r.displayName }));
    } catch {
      return names.map((u) => ({ username: u, displayName: u }));
    }
  }
);

/** Is this person in my household? Guards every cross-user action. */
export async function inMyHousehold(username: string): Promise<boolean> {
  const names = await householdUsernames();
  return names.includes(username.trim().toLowerCase());
}

/**
 * The owner values a query may return: my household, plus the seeder.
 * Use with inArray() on whichever column names the creator.
 */
export async function visibleOwners(): Promise<string[]> {
  return [...(await householdUsernames()), SEED_OWNER];
}
