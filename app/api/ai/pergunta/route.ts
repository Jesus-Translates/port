import { generateText, Output } from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel, PT_STYLE } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { getCefrFor } from "@/lib/data";
import { getDb, homework } from "@/lib/db";
import type { HomeworkItem } from "@/lib/homework-items";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 60;

const perguntaSchema = z.object({
  pt: z.string().describe("One spoken-style question in pt-PT, tu register"),
  en: z.string().describe("Its English translation"),
});

const frasesSchema = z.object({
  frases: z
    .array(
      z.object({
        pt: z.string().describe("A natural pt-PT sentence to read aloud, 8-16 words"),
        en: z.string().describe("Its English translation"),
      })
    )
    .min(3)
    .max(3),
});

/** What is this learner actually working on right now? */
async function tpcContext(username: string): Promise<string> {
  try {
    const rows = await getDb()
      .select({ title: homework.title, items: homework.items })
      .from(homework)
      .where(eq(homework.username, username))
      .orderBy(desc(homework.createdAt))
      .limit(5);
    const titles = rows.map((r) => r.title);
    const errors = rows
      .flatMap((r) => (r.items as HomeworkItem[] | null) ?? [])
      .filter((i) => i.correctedPt && i.correct === false)
      .slice(0, 5)
      .map((i) => `errou "${i.prompt.slice(0, 60)}" → certo: "${i.correctedPt}"`);
    if (titles.length === 0) return "";
    return `CURRENT TPC TOPICS: ${titles.join("; ")}. RECENT ERRORS: ${errors.join(" | ") || "none recorded"}.`;
  } catch {
    return "";
  }
}

/** Fresh speaking material for Falar — derived from the learner's TPC.
 *  kind "pergunta" → one question to answer; kind "frases" → 3 read-aloud sentences. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Espera uns minutos." },
      { status: 429 }
    );
  }

  let theme = "";
  let kind = "pergunta";
  try {
    const body = await request.json();
    theme = String(body.theme ?? "").slice(0, 200);
    if (body.kind === "frases") kind = "frases";
  } catch {
    // no body is fine
  }

  const cefr = await getCefrFor(session.username);
  const context = await tpcContext(session.username);
  const grounding = theme
    ? `Create it around the requested topic: "${theme}".`
    : context
      ? `Ground it in what the learner is currently studying — ${context} Practise that same material.`
      : "Everyday life near Santa Cruz / Torres Vedras.";

  if (kind === "frases") {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: frasesSchema }),
      instructions: `You write pt-PT sentences for an adult learner at CEFR level ${cefr} to READ ALOUD as pronunciation practice. ${PT_STYLE}
Each sentence natural, spoken-register, 8-16 words, and deliberately rich in the sounds English speakers struggle
with (lh, nh, nasal vowels ão/õe/em, reduced vowels, final -s). Vary the verb tense across the three.`,
      prompt: `Write 3 read-aloud sentences. ${grounding}`,
    });
    await recordUsage(session.username, "grade", modelId(), usage);
    return NextResponse.json(output);
  }

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: perguntaSchema }),
    instructions: `You are Luna, asking ONE spoken conversation question to an adult learner of European Portuguese at CEFR level ${cefr}. ${PT_STYLE}
The question must be answerable out loud in 2-4 sentences, personal and concrete, CIPLE-oral style — vary the verb
tense you invite.`,
    prompt: `Ask one new question. ${grounding} Vary it — not the same opener every time. Seed: ${Date.now() % 97}`,
  });
  await recordUsage(session.username, "grade", modelId(), usage);
  return NextResponse.json(output);
}
