import { generateText, Output } from "ai";
import { asc, eq, inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { roleOf, getSession } from "@/lib/auth";
import {
  isItemKind,
  ITEM_KINDS,
  PATH_RULE,
  SPEAKING_KINDS,
  type ItemKind,
} from "@/lib/course";
import { categories, getDb, unitItems, units } from "@/lib/db";
import { visibleOwners } from "@/lib/tenant";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

/** What each kind actually opens, so the model picks with the screen in mind. */
const KIND_MENU = `- "vocab" — opens the phrasebook category. Set categorySlug to one of the real slugs below.
- "quiz" — an AI test built from the topic on the spot.
- "jogo-pares" — timed PT↔EN matching game on the topic's words.
- "jogo-frase" — rebuild a sentence from word tiles; best for word order.
- "ditado" — dictation: hear a phrase, write it. Topic describes the phrases to hear.
- "cloze" — hear a phrase, type the one missing word.
- "verbos" — conjugation sprint. Topic names the verbs/tense.
- "escutar" — a spoken dialogue with a synced transcript.
- "story" — a short graded reader.
- "falar" — read aloud and get a pronunciation score.
- "conversa" — a spoken back-and-forth with Sandra about the topic.
- "homework" — a written assignment Sandra marks answer by answer.`;

// Absent-able fields are .nullable() (never .optional()): strict structured
// outputs require every key to be present, with null for "no value".
const pathGenSchema = z.object({
  items: z
    .array(
      z.object({
        kind: z.string().describe(`Exactly one of: ${ITEM_KINDS.join(", ")}`),
        titlePt: z
          .string()
          .describe(
            'Short European Portuguese label for this step, e.g. "Lê o livro" or "Fala com a Sandra"'
          ),
        topic: z
          .string()
          .describe(
            "What THIS activity must cover for THIS unit — one short, concrete phrase in pt-PT or English that another AI could generate from, e.g. \"pedir a conta e pagar no café\". Never generic, never empty, never just the unit title."
          ),
        categorySlug: z
          .string()
          .nullable()
          .describe(
            'For kind="vocab" ONLY: exactly one existing phrasebook slug from the list in the instructions. Null for every other kind.'
          ),
      })
    )
    .min(5)
    .max(7),
});

type Wanted = { kind: ItemKind; titlePt: string; topic: string; categorySlug: string | null };

/** Legacy rows and sloppy model output both land here. */
function normalizeKind(raw: string): ItemKind | null {
  const k = raw.trim().toLowerCase();
  if (isItemKind(k)) return k;
  if (k === "category" || k === "reference") return "vocab";
  if (k === "listening") return "escutar";
  return null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  // Burst limit AND the household's monthly AI allowance, in one check.
  const denied = await aiDenial(session.username);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: { unitId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const unitId = Number(body.unitId);
  if (!Number.isInteger(unitId) || unitId <= 0) {
    return NextResponse.json({ error: "Falta a unidade." }, { status: 400 });
  }

  const db = getDb();
  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);
  if (!unit) {
    return NextResponse.json({ error: "Unidade não encontrada." }, { status: 404 });
  }
  // Don't let a student force a draft unit to generate itself.
  if (unit.status !== "published" && await roleOf(session.username) === "student") {
    return NextResponse.json({ error: "Unidade não disponível." }, { status: 403 });
  }

  // Idempotent: a second open (or a hover-prefetch that turned into a click)
  // must never rebuild a path that already exists.
  const existing = await db
    .select({ id: unitItems.id })
    .from(unitItems)
    .where(eq(unitItems.unitId, unit.id));
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, created: false, count: existing.length });
  }

  const cats = await db
    .select({ id: categories.id, slug: categories.slug, namePt: categories.namePt })
    .from(categories)
    // Another family's category name must not reach this prompt.
    .where(inArray(categories.createdBy, await visibleOwners()))
    .orderBy(asc(categories.sortOrder), asc(categories.id));
  const catMenu =
    cats.map((c) => `${c.slug} (${c.namePt})`).join(", ") ||
    "(no phrasebook categories exist yet — do not use kind vocab)";

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: pathGenSchema }),
    instructions: `You are Sandra, building the PRACTICE PATH for one unit of a European Portuguese course. ${await currentStyle()}

${PATH_RULE}

The kinds you may use, and the screen each one opens:
${KIND_MENU}

Phrasebook slugs that really exist (for kind="vocab"): ${catMenu}. Never invent a slug; if none of them fits this unit, do not use "vocab" at all — start with "escutar" or "story" instead.

Every item MUST carry a "topic": the concrete thing that activity covers for THIS unit, written so another AI can generate material from it without seeing the unit. "no talho: pedir 200 g de fiambre" is a topic; "vocabulário" is not. Reuse the unit's own words and situations; keep it European Portuguese.

titlePt is what the learner reads on the button — short, pt-PT, imperative and friendly ("Ouve e escreve", "Constrói a frase", "Fala com a Sandra").
Return 5-7 items, ordered easiest recognition first, hardest production last, one kind at most per unit, the last one always spoken.`,
    prompt: `Unit: "${unit.title}"${unit.titlePt ? ` (${unit.titlePt})` : ""}
CEFR level: ${unit.cefr}
Syllabus category: ${unit.category}
What the learner should be able to do: ${unit.blurbEn || "(not stated)"}
Author's intent: ${unit.notePrompt || "(none)"}

The Learning Note this path must practise:
${(unit.noteMd || "(the note is not written yet — work from the title and the blurb)").slice(0, 4000)}

Build this unit's path.`,
  });

  await recordUsage(session.username, "lesson", modelId(), usage);

  // ---- The contract is enforced HERE, not in the prompt. ----
  const seen = new Set<ItemKind>();
  const clean: Wanted[] = [];
  for (const raw of output.items) {
    const kind = normalizeKind(String(raw.kind ?? ""));
    if (!kind) continue; // a kind we cannot resolve to a screen is dropped
    if (seen.has(kind)) continue; // never two of the same kind
    const topic = String(raw.topic ?? "").trim().slice(0, 300);
    seen.add(kind);
    clean.push({
      kind,
      titlePt: String(raw.titlePt ?? "").trim().slice(0, 200) || kind,
      topic,
      categorySlug: raw.categorySlug ? String(raw.categorySlug).trim() : null,
    });
  }

  // A "vocab" item is only real if its slug resolves to a category row.
  const slugs = clean
    .filter((i) => i.kind === "vocab" && i.categorySlug)
    .map((i) => i.categorySlug as string);
  const catRows =
    slugs.length > 0
      ? await db
          .select({ id: categories.id, slug: categories.slug })
          .from(categories)
          .where(inArray(categories.slug, slugs))
      : [];
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));
  const resolved = clean.filter(
    (i) => i.kind !== "vocab" || (i.categorySlug && catId.has(i.categorySlug))
  );

  // The unit is not finished until the learner has SPOKEN: any speaking item
  // moves to the end, and if the model produced none we add one ourselves.
  const speaking = resolved.filter((i) => SPEAKING_KINDS.includes(i.kind));
  const rest = resolved.filter((i) => !SPEAKING_KINDS.includes(i.kind));
  const tail: Wanted[] =
    speaking.length > 0
      ? speaking
      : [
          {
            kind: "conversa",
            titlePt: "Fala com a Sandra",
            topic:
              rest.find((i) => i.topic)?.topic ||
              unit.titlePt ||
              unit.title,
            categorySlug: null,
          },
        ];
  const ordered = [...rest.slice(0, Math.max(0, 7 - tail.length)), ...tail];

  if (ordered.length === 0) {
    return NextResponse.json(
      { error: "A Sandra não conseguiu montar o caminho. Tenta outra vez." },
      { status: 502 }
    );
  }

  const rows: (typeof unitItems.$inferInsert)[] = ordered.map((item, i) => ({
    unitId: unit.id,
    kind: item.kind,
    refId: item.kind === "vocab" ? (catId.get(item.categorySlug!) ?? null) : null,
    config: { topic: item.topic, level: unit.cefr },
    titlePt: item.titlePt,
    sortOrder: i + 1,
  }));

  const insertedIds = (
    await db.insert(unitItems).values(rows).returning({ id: unitItems.id })
  ).map((r) => r.id);

  // Two people opening the same fresh unit at the same moment would both pass
  // the existence check above and both insert a path. There is no unique index
  // to lean on, so settle it after the fact with a tiebreak BOTH requests
  // compute identically — lowest id wins, the loser removes its own rows.
  // Exactly one path survives, and neither can leave the unit empty.
  const mine = new Set(insertedIds);
  const others = (
    await db
      .select({ id: unitItems.id })
      .from(unitItems)
      .where(eq(unitItems.unitId, unit.id))
  )
    .map((r) => r.id)
    .filter((id) => !mine.has(id));
  if (others.length > 0 && Math.min(...others) < Math.min(...insertedIds)) {
    await db.delete(unitItems).where(inArray(unitItems.id, insertedIds));
    return NextResponse.json({ ok: true, created: false, count: others.length });
  }

  return NextResponse.json({ ok: true, created: true, count: rows.length });
}
