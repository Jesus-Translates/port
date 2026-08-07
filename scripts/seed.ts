/**
 * Seeds users, the reference book and workbook lessons from content/*.json.
 * Idempotent: categories/lessons are upserted; previously-seeded entries are
 * replaced; entries added by users are never touched.
 *
 * Run: npm run db:seed   (loads .env.local via dotenv-cli)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — run via `npm run db:seed`.");
  process.exit(1);
}
const db = drizzle(neon(url), { schema });

type SeedEntry = {
  kind: string;
  section: string;
  pt: string;
  en: string;
  replyPt?: string;
  replyEn?: string;
  note?: string;
};
type SeedCategory = {
  slug: string;
  namePt: string;
  nameEn: string;
  emoji: string;
  blurbEn?: string;
  entries: SeedEntry[];
};
type SeedLesson = {
  title: string;
  level: string;
  descriptionEn?: string;
  blocks: unknown[];
};

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "content", file), "utf8"));
}

async function main() {
  // 1. Users — keep in sync with VALID_USERS / getValidUsers()
  const people = (
    process.env.VALID_USERS ??
    "Kelly,Jenni,Robert,Bobby,Sarah,Hannah,Rebecca,Sammy"
  )
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  for (const displayName of people) {
    await db
      .insert(schema.users)
      .values({ username: displayName.toLowerCase(), displayName })
      .onConflictDoNothing({ target: schema.users.username });
  }
  console.log("✓ users");

  // 2. Reference book
  const packs = ["reference-casa.json", "reference-vida.json"].map((f) =>
    loadJson<{ categories: SeedCategory[] }>(f)
  );
  let sortOrder = 0;
  let entryCount = 0;
  for (const pack of packs) {
    for (const cat of pack.categories) {
      sortOrder += 1;
      const [existing] = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.slug, cat.slug))
        .limit(1);

      let categoryId: number;
      if (existing) {
        categoryId = existing.id;
        await db
          .update(schema.categories)
          .set({
            namePt: cat.namePt,
            nameEn: cat.nameEn,
            emoji: cat.emoji,
            blurbEn: cat.blurbEn ?? null,
            sortOrder,
          })
          .where(eq(schema.categories.id, categoryId));
      } else {
        const [row] = await db
          .insert(schema.categories)
          .values({
            slug: cat.slug,
            namePt: cat.namePt,
            nameEn: cat.nameEn,
            emoji: cat.emoji,
            blurbEn: cat.blurbEn ?? null,
            sortOrder,
            createdBy: "seed",
          })
          .returning({ id: schema.categories.id });
        categoryId = row.id;
      }

      // Replace only seed-authored entries; keep user additions.
      await db
        .delete(schema.refEntries)
        .where(
          and(
            eq(schema.refEntries.categoryId, categoryId),
            eq(schema.refEntries.addedBy, "seed")
          )
        );
      if (cat.entries.length > 0) {
        await db.insert(schema.refEntries).values(
          cat.entries.map((e) => ({
            categoryId,
            kind: e.kind,
            section: e.section,
            pt: e.pt,
            en: e.en,
            replyPt: e.replyPt ?? null,
            replyEn: e.replyEn ?? null,
            note: e.note ?? null,
            addedBy: "seed",
          }))
        );
        entryCount += cat.entries.length;
      }
      console.log(`✓ ${cat.emoji} ${cat.namePt} (${cat.entries.length})`);
    }
  }

  // 3. Lessons
  const { lessons } = loadJson<{ lessons: SeedLesson[] }>("lessons.json");
  for (const lesson of lessons) {
    const [existing] = await db
      .select({ id: schema.lessons.id })
      .from(schema.lessons)
      .where(
        and(
          eq(schema.lessons.title, lesson.title),
          eq(schema.lessons.source, "seed")
        )
      )
      .limit(1);
    if (existing) {
      await db
        .update(schema.lessons)
        .set({
          level: lesson.level,
          descriptionEn: lesson.descriptionEn ?? null,
          blocks: lesson.blocks,
        })
        .where(eq(schema.lessons.id, existing.id));
    } else {
      await db.insert(schema.lessons).values({
        title: lesson.title,
        level: lesson.level,
        descriptionEn: lesson.descriptionEn ?? null,
        blocks: lesson.blocks,
        source: "seed",
        createdBy: "seed",
      });
    }
  }
  console.log(`✓ ${lessons.length} lessons`);
  console.log(`Done — ${entryCount} reference entries seeded.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
