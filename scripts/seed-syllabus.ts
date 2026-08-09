/**
 * Seeds the curriculum spine from content/syllabus-{a1,a2,b1,b2}.json.
 *
 * Units are the course itself, so they land PUBLISHED (unlike a unit someone
 * drafts with the generator, which waits for the teacher). `noteMd` is left
 * empty on purpose — the Learning Note is written by Sandra the first time
 * somebody opens the unit, using `notePrompt` as the brief.
 *
 * Idempotent, and safe to re-run: a unit is matched by slug; only rows this
 * script created (createdBy = 'syllabus') are updated, and the note is never
 * overwritten once it exists. Units added by the family are never touched.
 *
 * Run: npm run db:syllabus
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — run via `npm run db:syllabus`.");
  process.exit(1);
}
const db = drizzle(neon(url), { schema });

type SyllabusUnit = {
  slug: string;
  titleEn: string;
  titlePt: string;
  category: string;
  blurbEn: string;
  grammarFocus: string | null;
  notePrompt: string;
};

const CATEGORIES = new Set([
  "communication",
  "grammar",
  "grammar-practice",
  "vocabulary",
]);

// Each level gets its own block of 1000 so a later insert into A1 can never
// collide with A2, and the global order still reads A1 → A2 → B1 → B2.
const LEVELS: { level: string; file: string; base: number }[] = [
  { level: "A1", file: "syllabus-a1.json", base: 1000 },
  { level: "A2", file: "syllabus-a2.json", base: 2000 },
  { level: "B1", file: "syllabus-b1.json", base: 3000 },
  { level: "B2", file: "syllabus-b2.json", base: 4000 },
];

function read(file: string): SyllabusUnit[] {
  const path = join(process.cwd(), "content", file);
  const parsed = JSON.parse(readFileSync(path, "utf8")) as SyllabusUnit[];
  if (!Array.isArray(parsed)) throw new Error(`${file} is not an array`);
  return parsed;
}

async function main() {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const seenSlugs = new Set<string>();

  for (const { level, file, base } of LEVELS) {
    let list: SyllabusUnit[];
    try {
      list = read(file);
    } catch (err) {
      console.error(`  ✗ ${file}: ${(err as Error).message}`);
      continue;
    }

    for (const [i, u] of list.entries()) {
      if (!u.slug || !u.titleEn) {
        console.warn(`  ! ${level} #${i + 1}: missing slug/titleEn — skipped`);
        continue;
      }
      if (seenSlugs.has(u.slug)) {
        console.warn(`  ! duplicate slug "${u.slug}" — skipped`);
        continue;
      }
      seenSlugs.add(u.slug);

      const category = CATEGORIES.has(u.category) ? u.category : "communication";
      const row = {
        slug: u.slug,
        title: u.titleEn,
        titlePt: u.titlePt ?? "",
        category,
        blurbEn: u.blurbEn ?? "",
        notePrompt: u.notePrompt ?? "",
        cefr: level,
        sortOrder: base + i,
        status: "published",
        createdBy: "syllabus",
      };

      const [existing] = await db
        .select({ id: schema.units.id, createdBy: schema.units.createdBy })
        .from(schema.units)
        .where(eq(schema.units.slug, u.slug))
        .limit(1);

      if (!existing) {
        await db.insert(schema.units).values(row);
        inserted += 1;
      } else if (existing.createdBy === "syllabus") {
        // Refresh the syllabus fields, but never touch a note already written.
        const { slug: _slug, ...rest } = row;
        void _slug;
        await db
          .update(schema.units)
          .set(rest)
          .where(eq(schema.units.id, existing.id));
        updated += 1;
      } else {
        // Someone in the family made this one — leave it entirely alone.
        skipped += 1;
      }
    }
    console.log(`  ${level}: ${list.length} units`);
  }

  console.log(
    `\nSyllabus seeded — ${inserted} inserted, ${updated} refreshed, ${skipped} left alone (family-made).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
