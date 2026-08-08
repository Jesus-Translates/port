/**
 * Stage 1 backfill: the Hanson family becomes account #1.
 *
 * Creates one account, one `people` row per existing user, and a membership
 * carrying their CURRENT username unchanged — so the handle everyone already
 * types keeps working, it just stops being globally unique. Roles map from the
 * existing env-driven ones: ADMIN_USERS -> owner, TEACHER_USERS -> parent,
 * everyone else -> child.
 *
 * Idempotent: re-running adopts any user added since. Reads nothing the live
 * app depends on and writes nothing the live app reads.
 *
 * Run: npm run db:backfill
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — run via `npm run db:backfill`.");
  process.exit(1);
}
const db = drizzle(neon(url), { schema });

const ACCOUNT_SLUG = "hanson";
const envList = (v: string | undefined, fallback: string[]) =>
  (v ? v.split(",") : fallback).map((s) => s.trim().toLowerCase()).filter(Boolean);

async function main() {
  const admins = envList(process.env.ADMIN_USERS, ["robert"]);
  const teachers = envList(process.env.TEACHER_USERS, ["kelly"]);

  let [account] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.slug, ACCOUNT_SLUG))
    .limit(1);

  if (!account) {
    [account] = await db
      .insert(schema.accounts)
      .values({
        slug: ACCOUNT_SLUG,
        name: "Família Hanson",
        plan: "family",
        seatLimit: 8,
      })
      .returning();
    console.log(`created account #${account.id} (${account.slug})`);
  } else {
    console.log(`account #${account.id} (${account.slug}) already exists`);
  }

  const users = await db.select().from(schema.users);
  let added = 0;
  let skipped = 0;

  for (const u of users) {
    const [existing] = await db
      .select({ id: schema.memberships.id })
      .from(schema.memberships)
      .where(
        and(
          eq(schema.memberships.accountId, account.id),
          eq(schema.memberships.username, u.username)
        )
      )
      .limit(1);
    if (existing) {
      skipped += 1;
      continue;
    }

    // No email yet — nobody has supplied one, and children may never have one.
    const [person] = await db
      .insert(schema.people)
      .values({ displayName: u.displayName, email: null })
      .returning();

    const role = admins.includes(u.username)
      ? "owner"
      : teachers.includes(u.username)
        ? "parent"
        : "child";

    await db.insert(schema.memberships).values({
      accountId: account.id,
      personId: person.id,
      username: u.username,
      role,
    });
    added += 1;
    console.log(`  + ${u.username.padEnd(10)} ${role}`);
  }

  // Reflect the plan they are effectively on. Not read by anything yet.
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.accountId, account.id))
    .limit(1);
  if (!sub) {
    await db.insert(schema.subscriptions).values({
      accountId: account.id,
      status: "active",
      priceId: "founder-family",
    });
    console.log("  + subscription row (founder-family)");
  }

  console.log(`\nbackfill done — ${added} added, ${skipped} already present`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
