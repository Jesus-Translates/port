import { generateText, Output } from "ai";
import { asc, inArray, like, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { familyList, getModel } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { householdMembers } from "@/lib/tenant";
import { categories, getDb, unitItems, units } from "@/lib/db";
import { visibleOwners } from "@/lib/tenant";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

/** Display names of my household — never every account on the instance. */
async function householdNames(): Promise<string[]> {
  return (await householdMembers()).map((m) => m.displayName);
}

export const maxDuration = 120;

/** Activity kinds a unit may point at. Anything else the model invents is
 *  dropped rather than stored — a unit item must resolve to a real screen. */
const ITEM_KINDS = [
  "quiz",
  "ditado",
  "verbos",
  "story",
  "homework",
  "category",
] as const;
type ItemKind = (typeof ITEM_KINDS)[number];

// Absent-able fields are .nullable() (never .optional()): strict structured
// outputs require every key to be present, with null for "no value".
const unitGenSchema = z.object({
  slug: z.string().describe("kebab-case slug for the unit, ASCII only, 2-5 words"),
  title: z.string().describe("The unit title, in European Portuguese"),
  noteMd: z
    .string()
    .describe(
      "The Learning Note: 300-500 words of markdown. Explain the grammar/vocabulary point in ENGLISH, with pt-PT examples in **bold**. Include a small markdown table when it helps (endings, conjugations, phrase pairs), and finish with a '## Erros comuns' section listing the 2-4 mistakes English speakers actually make here."
    ),
  items: z
    .array(
      z.object({
        kind: z
          .string()
          .describe(`One of: ${ITEM_KINDS.join(", ")}`),
        titlePt: z
          .string()
          .describe("Short label for the activity, in European Portuguese"),
        topic: z
          .string()
          .nullable()
          .describe(
            "For quiz/homework/story: the specific topic to generate from. Null for ditado/verbos/category."
          ),
        categorySlug: z
          .string()
          .nullable()
          .describe(
            "For kind=category only: one of the phrasebook slugs given in the prompt. Null otherwise."
          ),
      })
    )
    .min(4)
    .max(6),
});

function kebab(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** units.slug is unique — append -2, -3… rather than failing the generation. */
async function freeSlug(base: string): Promise<string> {
  const root = base || "unidade";
  const taken = new Set(
    (
      await getDb()
        .select({ slug: units.slug })
        .from(units)
        .where(like(units.slug, `${root}%`))
    ).map((r) => r.slug)
  );
  if (!taken.has(root)) return root;
  for (let n = 2; n < 200; n += 1) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

function normalizeKind(raw: string): ItemKind | null {
  const k = raw.trim().toLowerCase();
  const hit = ITEM_KINDS.find((valid) => k === valid || k.includes(valid));
  return hit ?? null;
}

export async function POST(request: NextRequest) {
  // Anyone in the family may draft a unit — it just doesn't reach the class
  // until the teacher publishes it.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  // Burst limit AND the household's monthly AI allowance, in one check.
  const denied = await aiDenial(session.username);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: { topic?: string; cefr?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const topic = String(body.topic ?? "").trim().slice(0, 300);
  const cefr = String(body.cefr ?? "A2").trim().slice(0, 8);
  if (!topic) {
    return NextResponse.json({ error: "Falta o tema." }, { status: 400 });
  }

  const db = getDb();
  const cats = await db
    .select({ id: categories.id, slug: categories.slug, namePt: categories.namePt })
    .from(categories)
    // Another family's category name must not reach this prompt.
    .where(inArray(categories.createdBy, await visibleOwners()))
    .orderBy(asc(categories.sortOrder), asc(categories.id));
  const catMenu = cats.map((c) => `${c.slug} (${c.namePt})`).join(", ") || "(none)";

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: unitGenSchema }),
    instructions: `You are Sandra, building the curriculum spine for a family learning EUROPEAN Portuguese together (${familyList(await householdNames())}). ${await currentStyle()}

A UNIT is one teaching point plus a short, ordered path through activities the app already has.

The Learning Note is the heart of it: written for an adult English speaker who wants to understand WHY, not just memorise.
Explain in plain English, show pt-PT in **bold**, keep the examples rooted in their real life (o mercado, a praia, o multibanco,
os vizinhos). Never Brazilian forms. Aim for 300-500 words.

The items are the practice path, 4-6 of them, ordered easiest → hardest, each a DIFFERENT flavour where possible:
- "category" — read the phrasebook first. Set categorySlug to EXACTLY one of these existing slugs: ${catMenu}. Never invent a slug.
- "quiz" — a quick test. Set topic to the precise thing to be tested.
- "ditado" — dictation practice. topic null.
- "verbos" — conjugation sprints. topic null.
- "story" — read a graded story. Set topic to a fitting theme.
- "homework" — a written assignment. Set topic to what they should write about.
Use at most one item of each kind. titlePt is a short European Portuguese label, e.g. "Lê o livro de referência" or "Faz o teste".`,
    prompt: `Build a unit about "${topic}" at CEFR level ${cefr}.`,
  });

  await recordUsage(session.username, "lesson", modelId(), usage);

  const slug = await freeSlug(kebab(output.slug || output.title || topic));
  const [{ maxOrder }] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${units.sortOrder}), 0)::int`,
    })
    .from(units);

  const [unit] = await db
    .insert(units)
    .values({
      slug,
      title: output.title.slice(0, 200),
      cefr,
      sortOrder: Number(maxOrder ?? 0) + 1,
      noteMd: output.noteMd,
      status: "draft",
      createdBy: session.username,
    })
    .returning({ id: units.id, slug: units.slug });

  const wanted = output.items
    .map((item) => ({ ...item, kind: normalizeKind(item.kind) }))
    .filter((item): item is typeof item & { kind: ItemKind } => item.kind !== null);

  // Resolve phrasebook links to real category rows; a hallucinated slug simply
  // drops the item rather than producing a dead link.
  const slugs = wanted
    .filter((i) => i.kind === "category" && i.categorySlug)
    .map((i) => String(i.categorySlug));
  const catRows =
    slugs.length > 0
      ? await db
          .select({ id: categories.id, slug: categories.slug })
          .from(categories)
          .where(inArray(categories.slug, slugs))
      : [];
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));

  const rows: (typeof unitItems.$inferInsert)[] = [];
  for (const item of wanted) {
    if (item.kind === "category") {
      const refId = item.categorySlug ? catId.get(item.categorySlug) : undefined;
      if (!refId) continue;
      rows.push({
        unitId: unit.id,
        kind: "category",
        refId,
        config: null,
        titlePt: item.titlePt.slice(0, 200),
        sortOrder: rows.length + 1,
      });
    } else {
      rows.push({
        unitId: unit.id,
        kind: item.kind,
        refId: null,
        config: { topic: item.topic ?? topic, level: cefr },
        titlePt: item.titlePt.slice(0, 200),
        sortOrder: rows.length + 1,
      });
    }
  }
  if (rows.length > 0) await db.insert(unitItems).values(rows);

  return NextResponse.json({ id: unit.id, slug: unit.slug });
}
