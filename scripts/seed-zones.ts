import "dotenv/config";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
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
  lisboa: { pt: "Grande Lisboa", en: "Lisbon and around — Sintra, Cascais, the south bank", emoji: "🏛️", sort: 40 },
  alentejo: { pt: "Alentejo", en: "The plains — Évora, Beja, the cork oaks", emoji: "🌾", sort: 50 },
  algarve: { pt: "Algarve", en: "The south — Faro, Tavira, Lagos", emoji: "🏖️", sort: 60 },
  madeira: { pt: "Madeira", en: "Madeira and Porto Santo", emoji: "🌺", sort: 70 },
  acores: { pt: "Açores", en: "The Azores — nine islands", emoji: "🌋", sort: 80 },
};

/** Pull one "## Heading" section out of a dossier. */
function section(md: string, heading: string): string {
  const re = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|\\Z)`, "im");
  return (md.match(re)?.[1] ?? "").trim();
}

/** The "### Name" subsections under "## Towns" become the town list. */
function towns(md: string): { name: string; context: string }[] {
  const block = section(md, "Towns");
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
  const files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
  let zoneCount = 0;
  let placeCount = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const meta = META[slug];
    // Files without a META entry (the bairros deep-dives, thematic notes) are
    // reference material, not pickable zones — skip them here.
    if (!meta) {
      console.log(`  – ${file}: reference only, not a pickable zone`);
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

    const list = towns(md);
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
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
