import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkCredentials, requireAdmin } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const maxDuration = 60;

/**
 * TEMPORARY: proves sign-in still works after moving identity into the
 * database. Exercises the real checkCredentials against a scratch account that
 * is created and destroyed inside this request — no real account is touched
 * and no caller-supplied password is ever tested, so this is not an oracle.
 */
export async function GET() {
  await requireAdmin();
  const db = getDb();
  const scratch = "zz-authcheck";
  const own = "correct-horse-battery";
  const shared = process.env.SHARED_PASSWORD ?? "";

  await db.delete(users).where(eq(users.username, scratch));
  await db.insert(users).values({
    username: scratch,
    displayName: "Auth Check",
    email: "authcheck@example.invalid",
    role: "student",
  });

  const results: Record<string, boolean> = {};
  const run = async (name: string, id: string, pw: string) => {
    results[name] = Boolean(await checkCredentials(id, pw));
  };

  // No personal password yet: the shared one must still work.
  await run("shared password works", scratch, shared);
  await run("wrong password rejected", scratch, "definitely-not-it");
  await run("email as identifier", "authcheck@example.invalid", shared);
  await run("unknown user rejected", "nobody-at-all", shared);

  // Give it its own password: that one works, the shared one stops working.
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(own) })
    .where(eq(users.username, scratch));
  await run("own password works", scratch, own);
  await run("shared no longer works once set", scratch, shared);
  await run("own password by email", "authcheck@example.invalid", own);

  // Deactivated accounts cannot sign in at all.
  await db.update(users).set({ active: false }).where(eq(users.username, scratch));
  await run("deactivated rejected", scratch, own);

  await db.delete(users).where(eq(users.username, scratch));

  const expected: Record<string, boolean> = {
    "shared password works": true,
    "wrong password rejected": false,
    "email as identifier": true,
    "unknown user rejected": false,
    "own password works": true,
    "shared no longer works once set": false,
    "own password by email": true,
    "deactivated rejected": false,
  };
  const failures = Object.keys(expected).filter(
    (k) => results[k] !== expected[k]
  );

  return NextResponse.json({ pass: failures.length === 0, failures, results, expected });
}
