import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel, PT_STYLE } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import {
  alignTranscript,
  transcribeWordTimings,
  type ScriptLine,
} from "@/lib/listening";
import {
  azureConfigured,
  azureVoices,
  azureSynthesizeSsml,
  ssmlSegments,
} from "@/lib/tts";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

const dialogueSchema = z.object({
  title: z
    .string()
    .describe("Short title in European Portuguese, 2-5 words, no quotes"),
  lines: z
    .array(
      z.object({
        speaker: z
          .string()
          .describe(
            'Short Portuguese first name, e.g. "Ana" or "Miguel". Use exactly TWO speakers across the whole dialogue, alternating.'
          ),
        text: z
          .string()
          .describe("One spoken line of natural European Portuguese"),
        translation: z.string().describe("Natural English translation"),
      })
    )
    .min(6)
    .max(16),
});

/**
 * Generate one Escutar clip: a two-voice pt-PT dialogue, synthesized with
 * Azure neural voices, then timestamped with Whisper so the transcript can
 * follow along word by word.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos à Luna — espera uns minutos." },
      { status: 429 }
    );
  }
  if (!azureConfigured()) {
    return NextResponse.json(
      {
        error:
          "As vozes reais ainda não estão ligadas (AZURE_SPEECH_KEY em falta).",
      },
      { status: 503 }
    );
  }

  let body: { topic?: string; cefr?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const topic = String(body.topic ?? "").slice(0, 200).trim();
  const cefr = String(body.cefr ?? "A2").slice(0, 8);

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: dialogueSchema }),
    instructions: `You write short listening dialogues for a family learning EUROPEAN Portuguese. ${PT_STYLE}
Write it as REAL SPEECH, not a textbook: exactly two speakers with short Portuguese first names, taking turns, 8-14 lines,
most of them one sentence long. Use the contractions and fillers spoken Portuguese actually has — "'tá" for está when it
fits, "pois", "então", "olha", "se calhar", "pronto", "'tá bem" — plus everyday politeness (bom dia, faz favor, obrigado/a).
Keep every structure inside the target CEFR level; a lower level means shorter lines and present tense, not stilted robot talk.
Ground it in their real world near Santa Cruz / Silveira / Torres Vedras: o mercado, a peixaria, a praia, o autocarro, o
multibanco, a farmácia, os vizinhos, o vento. Translations are natural English, not word-for-word.`,
    prompt: `Write a listening dialogue at CEFR level ${cefr}${
      topic ? ` about: ${topic}` : " about an ordinary everyday situation"
    }.`,
  });
  await recordUsage(session.username, "escutar", modelId(), usage);

  const script: ScriptLine[] = output.lines
    .map((l) => ({
      speaker: (l.speaker ?? "").trim() || "Ana",
      text: (l.text ?? "").trim(),
      translation: (l.translation ?? "").trim(),
    }))
    .filter((l) => l.text.length > 0);
  if (script.length === 0) {
    return NextResponse.json(
      { error: "A Luna não escreveu nada. Tenta outra vez." },
      { status: 502 }
    );
  }

  // Speaker order → voice index, so each person keeps one voice throughout.
  const voices = azureVoices();
  const speakers = [...new Set(script.map((l) => l.speaker))];
  const voiceFor = (speaker: string) =>
    voices[speakers.indexOf(speaker) % voices.length];

  const mp3 = await azureSynthesizeSsml(
    ssmlSegments(
      script.map((l) => ({
        text: l.text,
        voice: voiceFor(l.speaker),
        rate: "0.95",
        breakAfterMs: 350,
      }))
    ),
    session.username
  );
  if (!mp3) {
    return NextResponse.json(
      { error: "A síntese de voz falhou. Tenta outra vez." },
      { status: 502 }
    );
  }

  // Word timestamps for the audio we just made — the script is authoritative,
  // Whisper only tells us WHEN each word lands.
  const heard = await transcribeWordTimings(
    new Uint8Array(mp3),
    "dialogo.mp3",
    "audio/mpeg"
  );
  if (heard) {
    await recordUsage(session.username, "stt", "openai/gpt-4o-mini-transcribe", {
      inputTokens: Math.ceil(heard.duration * 10),
      outputTokens: 0,
    });
  }
  const transcript = alignTranscript(
    script,
    heard?.words ?? [],
    heard?.duration ?? 0
  );

  const [row] = await getDb()
    .insert(listeningClips)
    .values({
      title: output.title?.trim() || topic || "Diálogo",
      cefr,
      topic,
      transcript,
      audioB64: mp3.toString("base64"),
      bytes: mp3.length,
      source: "ai",
      createdBy: session.username,
    })
    .returning({ id: listeningClips.id });

  return NextResponse.json({ id: row.id });
}
