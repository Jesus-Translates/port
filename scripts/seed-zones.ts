import "dotenv/config";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { and, eq, gte, sql } from "drizzle-orm";
import { getDb, zonePlaces, zones } from "../lib/db";

/**
 * Turn the researched zone dossiers into rows Sandra can use.
 *
 * The Markdown in content/zones/ is the source of truth and stays human — it
 * is long, cited, and meant to be read and corrected. What goes into the
 * database is only the distilled "## Prompt context" block plus the town list,
 * because every word of prompt context is paid for on every single AI call.
 *
 * Idempotent: re-running updates the text in place rather than duplicating.
 */

const DIR = join(process.cwd(), "content", "zones");

/** Order matters — this is the order the picker shows them in. */
const META: Record<string, { pt: string; en: string; emoji: string; sort: number }> = {
  norte: { pt: "Norte", en: "The North — Porto, Braga, the Douro", emoji: "🍇", sort: 10 },
  centro: { pt: "Centro", en: "Centre — Coimbra, Aveiro, Leiria, Serra da Estrela", emoji: "⛰️", sort: 20 },
  oeste: { pt: "Oeste", en: "The West coast — Torres Vedras, Ericeira, Óbidos, Nazaré", emoji: "🌊", sort: 30 },
  ribatejo: { pt: "Ribatejo", en: "The Tejo valley — Santarém, Tomar, Golegã", emoji: "🐎", sort: 35 },
  lisboa: { pt: "Grande Lisboa", en: "Lisbon and around — Sintra, Cascais, the south bank", emoji: "🏛️", sort: 40 },
  setubal: { pt: "Península de Setúbal", en: "South bank — Almada, Setúbal, Sesimbra, Arrábida", emoji: "🐬", sort: 45 },
  alentejo: { pt: "Alentejo", en: "The plains — Évora, Beja, the cork oaks", emoji: "🌾", sort: 50 },
  algarve: { pt: "Algarve", en: "The south — Faro, Tavira, Lagos", emoji: "🏖️", sort: 60 },
  madeira: { pt: "Madeira", en: "Madeira and Porto Santo", emoji: "🌺", sort: 70 },
  acores: { pt: "Açores", en: "The Azores — nine islands", emoji: "🌋", sort: 80 },
};

/**
 * Neighbourhood dossiers are not zones of their own — they deepen one.
 * bairros-lisboa.md contributes Alfama, Alvalade and the rest as pickable
 * places inside Grande Lisboa, so a learner can name their bairro and get that
 * bairro's metro stop, market and pastelaria.
 */
const EXTENDS: Record<string, string> = {
  "bairros-lisboa": "lisboa",
  "bairros-porto": "norte",
};

/**
 * Cross-country dossiers. Never shown in the picker, but their prompt context
 * is offered to the generators that invent real-world situations — homework,
 * conversation, dialogues — where knowing how Finanças or a market day works
 * is the difference between a useful exercise and an invented one.
 */
const REFERENCE: Record<string, { pt: string; en: string }> = {
  sotaques: { pt: "Sotaques", en: "Accents and dialects across Portugal" },
  servicos: { pt: "Serviços", en: "Public services and everyday bureaucracy" },
  "transportes-e-mercados": { pt: "Transportes e mercados", en: "Getting around, and market days" },
};

/**
 * Pull one "## Heading" section out of a dossier.
 *
 * Split rather than regex on purpose. The first version ended its lookahead
 * with `\Z`, which JavaScript does not support as an end-of-input anchor — it
 * matched a LITERAL "Z", so every section silently truncated at the first
 * capital Z in the prose. Norte lost seven of its nine towns that way and
 * still reported success.
 */
function section(md: string, heading: string): string {
  const want = heading.trim().toLowerCase();
  for (const part of md.split(/^## /m).slice(1)) {
    const nl = part.indexOf("\n");
    const found = (nl === -1 ? part : part.slice(0, nl)).trim().toLowerCase();
    if (found === want) return (nl === -1 ? "" : part.slice(nl + 1)).trim();
  }
  return "";
}

/**
 * Every "## " heading whose title looks like a list of places.
 *
 * Matching one exact heading was too brittle: the Porto dossier heads its list
 * "## Bairros do Porto" and keeps a second list under "## The belt: living
 * just outside the city", so an exact "Bairros" lookup imported ZERO and still
 * printed a tick. Prefix-match instead, and take every matching section.
 */
function placeSections(md: string): string[] {
  const out: string[] = [];
  for (const part of md.split(/^## /m).slice(1)) {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    if (/^(towns|bairros|the belt)/i.test(title)) out.push(title);
  }
  return out;
}

/** The "### Name" subsections under a given heading become the place list. */
function towns(md: string, heading = "Towns"): { name: string; context: string }[] {
  const block = section(md, heading);
  if (!block) return [];
  const out: { name: string; context: string }[] = [];
  const parts = block.split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const name = (nl === -1 ? part : part.slice(0, nl)).trim();
    const body = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    if (!name) continue;
    out.push({
      name,
      // Strip markdown furniture — this text goes into a prompt, not a page.
      context: body
        .replace(/^[-*]\s+/gm, "")
        .replace(/\*\*/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 700),
    });
  }
  return out;
}

/**
 * Places a dossier covers but should not OFFER, because another zone owns them.
 *
 * The Grande Lisboa dossier discusses Almada and the south bank — and states
 * plainly that they are Península de Setúbal, not Grande Lisboa. Offering
 * Almada under both would contradict the very correction the researcher made,
 * and a resident of Almada will put a learner right about it.
 *
 * Tomar is deliberately NOT here: the 2024 NUTS revision genuinely moved it,
 * sources disagree, and letting a learner in Tomar pick either is honest.
 */
const NOT_OFFERED: Record<string, RegExp> = {
  lisboa: /^almada/i,
};

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function main() {
  if (!existsSync(DIR)) {
    console.error(`No ${DIR} — run the zone research first.`);
    process.exit(1);
  }
  const db = getDb();
  /*
   * Order matters, and alphabetical is the wrong one: bairros-lisboa.md sorts
   * before lisboa.md, so on a fresh database the bairros were skipped for a
   * parent zone that had not been created yet. Zones first, then the files
   * that extend them, then reference material.
   */
  const rank = (f: string) => {
    const slug = f.replace(/\.md$/, "");
    if (META[slug]) return 0;
    if (EXTENDS[slug]) return 1;
    return 2;
  };
  const files = readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  let zoneCount = 0;
  let placeCount = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const meta = META[slug];

    // A neighbourhood dossier deepens an existing zone rather than being one.
    const parent = EXTENDS[slug];
    if (!meta && parent) {
      const md = readFileSync(join(DIR, file), "utf8");
      const [zone] = await db
        .select({ id: zones.id, namePt: zones.namePt })
        .from(zones)
        .where(eq(zones.slug, parent))
        .limit(1);
      if (!zone) {
        console.log(`  – ${file}: waiting for the ${parent} zone to be seeded`);
        continue;
      }
      const list = placeSections(md).flatMap((h) => towns(md, h));
      if (list.length === 0) {
        console.warn(`  ! ${file}: no place sections found — nothing imported`);
        continue;
      }
      let n = 0;
      for (const t of list) {
        const row = {
          zoneId: zone.id,
          slug: slugify(t.name),
          name: t.name,
          promptContext: t.context,
          // After the zone's own towns, so headline towns stay first.
          sortOrder: 100 + n++,
        };
        if (!row.slug) continue;
        await db
          .insert(zonePlaces)
          .values(row)
          .onConflictDoUpdate({
            target: [zonePlaces.zoneId, zonePlaces.slug],
            set: { name: row.name, promptContext: row.promptContext },
          });
        placeCount++;
      }
      console.log(`  ✓ ${zone.namePt.padEnd(16)} +${list.length} bairros from ${file}`);
      continue;
    }

    // Cross-country reference: stored, never shown in the picker.
    const ref = REFERENCE[slug];
    if (!meta && ref) {
      const md = readFileSync(join(DIR, file), "utf8");
      const context = section(md, "Prompt context").replace(/\s+/g, " ").trim();
      if (!context) {
        console.warn(`  ! ${file}: no "## Prompt context" section — skipped`);
        continue;
      }
      const values = {
        slug,
        namePt: ref.pt,
        nameEn: ref.en,
        emoji: "📚",
        kind: "reference",
        blurbEn: ref.en,
        promptContext: context,
        sortOrder: 900,
      };
      await db
        .insert(zones)
        .values(values)
        .onConflictDoUpdate({ target: zones.slug, set: values });
      console.log(`  ✓ ${ref.pt.padEnd(16)} ${context.length} chars (reference)`);
      continue;
    }

    if (!meta) {
      console.log(`  – ${file}: not registered — add it to META or REFERENCE`);
      continue;
    }

    const md = readFileSync(join(DIR, file), "utf8");
    const promptContext = section(md, "Prompt context")
      .replace(/\s+/g, " ")
      .trim();
    if (!promptContext) {
      console.warn(`  ! ${file}: no "## Prompt context" section — skipped`);
      continue;
    }

    const values = {
      slug,
      namePt: meta.pt,
      nameEn: meta.en,
      emoji: meta.emoji,
      kind: "zone",
      blurbEn: meta.en,
      promptContext,
      sortOrder: meta.sort,
    };
    const [zone] = await db
      .insert(zones)
      .values(values)
      .onConflictDoUpdate({ target: zones.slug, set: values })
      .returning({ id: zones.id });
    zoneCount++;

    const drop = NOT_OFFERED[slug];
    const list = towns(md).filter((t) => !(drop && drop.test(t.name)));
    let i = 0;
    for (const t of list) {
      const row = {
        zoneId: zone.id,
        slug: slugify(t.name),
        name: t.name,
        promptContext: t.context,
        sortOrder: i++,
      };
      if (!row.slug) continue;
      await db
        .insert(zonePlaces)
        .values(row)
        .onConflictDoUpdate({
          target: [zonePlaces.zoneId, zonePlaces.slug],
          set: { name: row.name, promptContext: row.promptContext },
        });
      placeCount++;
    }
    console.log(
      `  ✓ ${meta.pt.padEnd(16)} ${promptContext.length} chars of context, ${list.length} towns`
    );
  }

  console.log(`\n✓ ${zoneCount} zones, ${placeCount} towns seeded`);

  /*
   * Fail loudly rather than succeed emptily.
   *
   * Three times on this project a seeder printed a tick while importing
   * nothing — a \Z that JavaScript treats as a literal Z, an exact heading
   * match that missed "## Bairros do Porto", and alphabetical ordering that
   * ran a bairros file before its parent zone existed. Every one was found by
   * counting rows against the source, never by reading the output. So the
   * seeder now does that counting itself.
   */
  const problems: string[] = [];
  for (const slug of Object.keys(META)) {
    if (!existsSync(join(DIR, `${slug}.md`))) continue;
    const [row] = await db
      .select({ id: zones.id, ctx: zones.promptContext })
      .from(zones)
      .where(eq(zones.slug, slug))
      .limit(1);
    if (!row) {
      problems.push(`${slug}: dossier exists but no zone row was created`);
      continue;
    }
    if (!row.ctx || row.ctx.length < 200) {
      problems.push(`${slug}: prompt context is ${row.ctx?.length ?? 0} chars — too short to be real`);
    }
    const places = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(zonePlaces)
      .where(eq(zonePlaces.zoneId, row.id));
    if (Number(places[0]?.n ?? 0) === 0) {
      problems.push(`${slug}: zero places imported — check the "## Towns" heading`);
    }
  }
  for (const slug of Object.keys(EXTENDS)) {
    if (!existsSync(join(DIR, `${slug}.md`))) continue;
    const parent = EXTENDS[slug];
    const [z] = await db.select({ id: zones.id }).from(zones).where(eq(zones.slug, parent)).limit(1);
    if (!z) { problems.push(`${slug}: parent zone "${parent}" missing`); continue; }
    const n = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(zonePlaces)
      .where(and(eq(zonePlaces.zoneId, z.id), gte(zonePlaces.sortOrder, 100)));
    if (Number(n[0]?.n ?? 0) === 0) {
      problems.push(`${slug}: contributed zero bairros to ${parent}`);
    }
  }

  if (problems.length > 0) {
    console.error("\n✗ import looks wrong:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("✓ every registered dossier imported context and places");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
