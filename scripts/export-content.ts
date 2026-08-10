import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { asc } from "drizzle-orm";
import {
  examQuestions,
  getDb,
  lessons,
  listeningClips,
  stories,
  unitItems,
  units,
} from "../lib/db";

/**
 * Export the CONTENT the app has generated, so it survives the database.
 *
 * The dossiers, syllabus and phrasebook are already in git as source files.
 * What is not, and what costs real money to recreate, is everything an AI
 * wrote after the fact: 154 unit Learning Notes, the practice paths, the exam
 * bank, the lessons and stories. Lose the database and that is gone.
 *
 * WHAT THIS DELIBERATELY DOES NOT EXPORT — and must never:
 *   users (password hashes), people, memberships, accounts, subscriptions,
 *   credentials, sessions, auth_tokens, activity, cards, review_logs,
 *   homework, quizzes, notes, kudos, ai_usage, unit_progress,
 *   mission_attempts, ls_sessions.
 * That is nine real people's names, learning history, spend and secrets. A git
 * repository is the wrong home for it: it is copied, cloned and shared, and it
 * remembers forever. Personal data belongs in the database, backed up by
 * Neon's own point-in-time restore.
 *
 * Audio is likewise excluded: the bytes live in R2 and the rows only carry
 * keys. Exporting base64 here would undo the whole point of moving it out.
 */

const OUT = join(process.cwd(), "content", "generated");

/**
 * Creator columns hold LOGIN USERNAMES. Even in a private repo they do not
 * belong in an exported file — a repo gets cloned, shared and published, and
 * a valid username is half of a credential. Seeded rows keep "seed" because
 * that is a marker the importer reads, not a person.
 */
function anonymise<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row };
  for (const key of ["createdBy", "addedBy", "username"]) {
    if (key in out && out[key] !== "seed" && out[key] !== "syllabus") {
      (out as Record<string, unknown>)[key] = "export";
    }
  }
  return out;
}

async function main() {
  const db = getDb();
  mkdirSync(OUT, { recursive: true });

  const write = (name: string, rows: unknown[]) => {
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(rows, null, 2) + "\n");
    const kb = Math.round(JSON.stringify(rows).length / 1024);
    console.log(`  ${name.padEnd(18)} ${String(rows.length).padStart(5)} rows  ${kb} KB`);
  };

  // Units carry the Learning Notes — the single most expensive thing here.
  write(
    "units",
    (await db.select().from(units).orderBy(asc(units.sortOrder), asc(units.id))).map(
      ({ id: _id, createdAt: _c, ...rest }) => anonymise(rest)
    )
  );

  // Paths reference units by id, so keep the id→slug mapping usable on import.
  const unitById = new Map(
    (await db.select({ id: units.id, slug: units.slug }).from(units)).map((u) => [
      u.id,
      u.slug,
    ])
  );
  write(
    "unit-items",
    (await db.select().from(unitItems).orderBy(asc(unitItems.id))).map(
      ({ id: _id, unitId, ...rest }) =>
        anonymise({ unitSlug: unitById.get(unitId), ...rest })
    )
  );

  write(
    "exam-questions",
    (await db.select().from(examQuestions).orderBy(asc(examQuestions.id))).map(
      ({ id: _id, ...rest }) => anonymise(rest)
    )
  );

  write(
    "lessons",
    (await db.select().from(lessons).orderBy(asc(lessons.id))).map(
      ({ id: _id, createdAt: _c, ...rest }) => anonymise(rest)
    )
  );

  write(
    "stories",
    (await db.select().from(stories).orderBy(asc(stories.id))).map(
      ({ id: _id, createdAt: _c, ...rest }) => anonymise(rest)
    )
  );

  // Transcript and metadata only — the audio itself is an R2 object.
  write(
    "listening-clips",
    (await db.select().from(listeningClips).orderBy(asc(listeningClips.id))).map(
      ({ id: _id, audioB64: _a, audioKey: _k, createdAt: _c, ...rest }) =>
        anonymise(rest)
    )
  );

  console.log(`\n✓ written to content/generated/ — no personal data, no audio bytes`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
