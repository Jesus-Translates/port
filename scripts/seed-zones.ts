import "dotenv/config";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
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
      // Bairros files head their list "## Bairros"; fall back to "## Towns".
      const list = towns(md, "Bairros").length
        ? towns(md, "Bairros")
        : towns(md, "Towns");
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
