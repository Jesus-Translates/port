import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getModel } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { roleOf, getSession } from "@/lib/auth";
import { getDb, units } from "@/lib/db";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

/**
 * Writes a unit's Learning Note on first open.
 *
 * The syllabus ships ~126 units with a `notePrompt` but no prose — generating
 * all of them up front would be slow, expensive and mostly wasted. This fills
 * one in on demand and stores it, so it is paid for once. A note that already
 * exists is returned untouched, which also makes concurrent opens harmless.
 */
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

  let unitId: number;
  try {
    const body = await request.json();
    unitId = Number(body.unitId);
    if (!Number.isInteger(unitId) || unitId <= 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
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
  // Already written (possibly by a concurrent open) — nothing to pay for.
  if (unit.noteMd.trim()) {
    return NextResponse.json({ noteMd: unit.noteMd, cached: true });
  }

  const { text, usage } = await generateText({
    model: getModel(),
    instructions: `You are Sandra, writing ONE unit's Learning Note for English speakers learning European Portuguese. ${await currentStyle()}

Write for an adult who wants to understand WHY, not just memorise. The house style, which matters:
- FUNCTION BEFORE FORM. Open with what the structure DOES, in plain English, before naming it.
- EXPOSURE BEFORE RULE. Show two or three real pt-PT examples first, then explain what they have in common.
- Portuguese in **bold**, English right after it. Every example must be a sentence someone would actually say.
- Use a small markdown table when a paradigm needs one (endings, persons, forms). Never more than two tables.
- Root the examples in their real life: o mercado, a praia, os vizinhos, o talho, o multibanco, a escola, a farmácia.
- If the point differs from Brazilian Portuguese, say so explicitly and briefly — this family is learning pt-PT and has been confused by pt-BR sources.
- Be honest about what is worth memorising and what is better absorbed by exposure.

Structure, using these exact headings:
## O que é
## Como funciona
## Na vida real
## Erros comuns  ← 2-4 mistakes ENGLISH SPEAKERS specifically make here, each with the wrong version and the fix

550-800 words. Markdown only — no preamble, no title heading (the page supplies the title), no code fences.`,
    prompt: `UNIT: ${unit.title}${unit.titlePt ? ` (${unit.titlePt})` : ""}
CEFR LEVEL: ${unit.cefr}
WHAT THE LEARNER SHOULD BE ABLE TO DO: ${unit.blurbEn || "(not specified)"}
BRIEF FROM THE CURRICULUM AUTHOR: ${unit.notePrompt || "Teach this unit's point clearly at the stated level."}

Write the Learning Note.`,
  });

  await recordUsage(session.username, "lesson", modelId(), usage);

  const noteMd = text.trim();
  if (!noteMd) {
    return NextResponse.json(
      { error: "A Sandra não conseguiu escrever a nota. Tenta outra vez." },
      { status: 502 }
    );
  }
  await db.update(units).set({ noteMd }).where(eq(units.id, unit.id));

  return NextResponse.json({ noteMd, cached: false });
}
