import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, PT_STYLE, refSuggestSchema } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { modelId, recordUsage } from "@/lib/usage";
import { categories, getDb, refEntries } from "@/lib/db";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let categoryId: number;
  try {
    const body = await request.json();
    categoryId = Number(body.categoryId);
    if (!Number.isInteger(categoryId)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const db = getDb();
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const existing = await db
    .select({ pt: refEntries.pt, section: refEntries.section })
    .from(refEntries)
    .where(eq(refEntries.categoryId, categoryId));

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: refSuggestSchema }),
    instructions: `You expand a family's European Portuguese phrasebook. ${PT_STYLE}
Suggest genuinely useful NEW entries for the given category — never duplicate or trivially vary what's already there.
kinds: term (noun with article), verb (infinitive), phrase (natural sentence, usually with a replyPt/replyEn),
task (household to-do). Reuse the existing section names where they fit; invent at most one new section.
Every entry: pt + natural English gloss; optional short note for usage tips or pt-PT vs pt-BR differences.`,
    prompt: `Category: ${category.namePt} (${category.nameEn}).
Existing entries (pt · section): ${existing.map((e) => `${e.pt} · ${e.section}`).join("; ") || "none yet"}.
Suggest 8-12 new entries.`,
  });

  await recordUsage(session.username, "reference", modelId(), usage);

  const KINDS = ["term", "verb", "phrase", "task"];
  const entries = output.entries
    .filter((e) => e.pt?.trim() && e.en?.trim())
    .map((e) => ({
      kind: KINDS.includes(e.kind?.toLowerCase()) ? e.kind.toLowerCase() : "term",
      section: e.section,
      pt: e.pt,
      en: e.en,
      replyPt: e.replyPt ?? undefined,
      replyEn: e.replyEn ?? undefined,
      note: e.note ?? undefined,
    }));
  return NextResponse.json({ entries });
}
