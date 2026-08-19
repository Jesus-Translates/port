import { getDb, memberships, people, users } from "@/lib/db";
import { usernameProblem } from "@/lib/username";

export { usernameProblem };

/**
 * The one place a household member's three rows are written.
 *
 * Extracted from lib/actions/users.ts createAccount() so the invite flow can
 * create a member too. It could not call createAccount() itself: that action
 * starts with manageScope() → requireSession(), and the whole point of an
 * invite is that the person redeeming it has no session yet — their invite
 * token IS the authorisation, checked by the caller before this runs.
 *
 * Deliberately NOT a "use server" file. Every export of an action file is a
 * network-callable endpoint, and an exported "insert a user, no questions
 * asked" endpoint would undo every check its callers make. This module is
 * callable only from server code that imports it.
 *
 * Callers own ALL authorisation and validation (username shape, clashes, seat
 * limits). This function only writes, and throws what the database throws.
 */
export async function insertMember(input: {
  accountId: number;
  /** Validated and lowercased by the caller. */
  username: string;
  displayName: string;
  email: string | null;
  /** Already hashed — never a raw password. */
  passwordHash: string | null;
  /** users.role — the app-level role. */
  appRole: "admin" | "teacher" | "student";
  /** memberships.role. Never "owner" from an invite; the caller enforces it. */
  householdRole: "owner" | "parent" | "child";
}): Promise<void> {
  const db = getDb();
  /*
   * Order matters because neon-http has NO transactions — each insert commits
   * on its own, and a failure partway must not leave a login-capable account
   * with no household (the "manufactured orphan" adoptOrphans warns about).
   *
   * So the credential row (users) goes LAST. If people or memberships fails,
   * the leftover is a stray person/membership the creating household can see
   * and remove — inert, no password, cannot sign in. And because nothing
   * credential-bearing exists until the final insert returns, a caller that
   * catches a throw here KNOWS no account was created, which is exactly what
   * acceptInvite's token-release contract depends on.
   *
   * people.email carries its own unique index, so a duplicate email is caught
   * cleanly by the first insert, before anything is written.
   */
  const [person] = await db
    .insert(people)
    .values({ displayName: input.displayName, email: input.email })
    .returning({ id: people.id });
  await db.insert(memberships).values({
    accountId: input.accountId,
    personId: person.id,
    username: input.username,
    role: input.householdRole,
  });
  await db.insert(users).values({
    username: input.username,
    displayName: input.displayName,
    email: input.email,
    passwordHash: input.passwordHash,
    role: input.appRole,
    // New accounts start guided; they can switch once they find their feet.
    mode: "simple",
  });
}

