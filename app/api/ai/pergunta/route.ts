import { generateText, Output } from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { nonLatinError } from "@/lib/lang-guard";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { getCefrFor } from "@/lib/data";
import { getDb, homework } from "@/lib/db";
import type { HomeworkItem } from "@/lib/homework-items";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

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
  // Burst limit AND the household's monthly AI allowance, in one check.
  const denied = await aiDenial(session.username);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let theme = "";
  let kind = "pergunta";
  try {
    const body = await request.json();
    theme = String(body.theme ?? "").slice(0, 200);

  // Turn away a non-Latin topic before it reaches the prompt — same rule as
  // the listening route. This app has two languages, both Latin-script.
  const langErr = nonLatinError(theme);
  if (langErr) {
    return NextResponse.json({ error: langErr }, { status: 400 });
  }
    if (body.kind === "frases") kind = "frases";
  } catch {
    // no body is fine
  }

  const cefr = await getCefrFor(session.username);
  const context = await tpcContext(session.username);
  const grounding = theme
    ? `Create it around the requested topic: "${theme}".`
    : context
      ? `Ground it in what the learner is currently studying — ${context} Practice that same material.`
      : "Everyday life where the learner lives.";

  if (kind === "frases") {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: frasesSchema }),
      instructions: `You write pt-PT sentences for an adult learner at CEFR level ${cefr} to READ ALOUD as pronunciation practice. ${await currentStyle()}
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
    instructions: `You are Sandra, asking ONE spoken conversation question to an adult learner of European Portuguese at CEFR level ${cefr}. ${await currentStyle()}
The question must be answerable out loud in 2-4 sentences, personal and concrete, CIPLE-oral style — vary the verb
tense you invite.`,
    prompt: `Ask one new question. ${grounding} Vary it — not the same opener every time. Seed: ${Date.now() % 97}`,
  });
  await recordUsage(session.username, "grade", modelId(), usage);
  return NextResponse.json(output);
}
