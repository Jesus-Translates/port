import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel, PT_STYLE } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 60;

const perguntaSchema = z.object({
  pt: z.string().describe("One spoken-style question in pt-PT, tu register"),
  en: z.string().describe("Its English translation"),
});

/** A fresh speaking question for Falar's Responder mode. */
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
  try {
    const body = await request.json();
    theme = String(body.theme ?? "").slice(0, 200);
  } catch {
    // no body is fine
  }

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: perguntaSchema }),
    instructions: `You are Luna, asking ONE spoken conversation question to an adult A2 learner of European Portuguese. ${PT_STYLE}
The question must be answerable out loud in 2-4 sentences, about everyday life (home, market, beach, weather, family,
plans, memories) — vary the verb tense you invite. CIPLE-oral style: personal, concrete, friendly.`,
    prompt: `Ask one new question${theme ? ` about "${theme}"` : ""}. Vary it — not the same opener every time. Seed: ${Date.now() % 97}`,
  });
  await recordUsage(session.username, "grade", modelId(), usage);
  return NextResponse.json(output);
}
