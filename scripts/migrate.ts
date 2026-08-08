/**
 * Applies drizzle migrations in order.
 *
 * This REPLACES `drizzle-kit push`. Push diffs the schema against the live
 * database and silently drops what it thinks is gone — fine while the schema
 * only grew, dangerous now that the plan re-keys twelve tables. Migrations are
 * reviewable files with a recorded order.
 *
 * Run: npm run db:migrate
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — run via `npm run db:migrate`.");
  process.exit(1);
}

async function main() {
  const db = drizzle(neon(url!));
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrations applied");
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
