import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { audioKey, putAudio } from "@/lib/blob";
import { currentStyle, referenceContext } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { hasNonLatin, nonLatinSample, scriptOffenders } from "@/lib/lang-guard";
import { getDb, listeningClips } from "@/lib/db";
import {
  alignTranscript,
  transcribeWordTimings,
  type ScriptLine,
} from "@/lib/listening";
import {
  assignSpeakerVoices,
  azureConfigured,
  azureVoices,
  azureSynthesizeSsml,
  ssmlSegments,
} from "@/lib/tts";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

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
  // Burst limit AND the household's monthly AI allowance, in one check.
  const denied = await aiDenial(session.username);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
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

  // The topic is free text from the learner and it lands inside the prompt.
  // "Write a dialogue about 中文" is a perfectly obedient request, which is
  // how Escutar clips came back in Chinese. Refuse at the door: this app has
  // exactly two languages and both are written in Latin script.
  if (hasNonLatin(topic)) {
    return NextResponse.json(
      {
        error:
          "O tema tem de estar em português ou inglês — só esses dois. " +
          `Encontrei: ${nonLatinSample(topic)}`,
      },
      { status: 400 }
    );
  }

  /*
   * Generate, then CHECK — and if the check fails, generate once more.
   *
   * The instruction above asks for Portuguese and English. Asking is not
   * enforcing: a model that drifts into another script has not disobeyed
   * anything the runtime can detect, so the script check below is what
   * actually holds the line. One retry, because drift is a coin-flip rather
   * than a stable property of the request, and two attempts is the difference
   * between "rare hiccup" and "the feature is broken" without turning a
   * pathological topic into an unbounded spend.
   */
  let script: ScriptLine[] = [];
  let title = "";
  let offending = "";
  for (let attempt = 0; attempt < 2 && script.length === 0; attempt++) {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: dialogueSchema }),
      instructions: `You write short listening dialogues for a family learning EUROPEAN Portuguese. ${await currentStyle()}${await referenceContext()}
Write ONLY in European Portuguese, with English translations. Never any other language or writing system.
Write it as REAL SPEECH, not a textbook: exactly two speakers with short Portuguese first names, taking turns, 8-14 lines,
most of them one sentence long. Use the contractions and fillers spoken Portuguese actually has — "'tá" for está when it
fits, "pois", "então", "olha", "se calhar", "pronto", "'tá bem" — plus everyday politeness (bom dia, faz favor, obrigado/a).
Keep every structure inside the target CEFR level; a lower level means shorter lines and present tense, not stilted robot talk.
Ground it in the learner's own real world: o mercado, a peixaria, a praia, o autocarro, o
multibanco, a farmácia, os vizinhos, o tempo. Translations are natural English, not word-for-word.`,
      prompt: `Write a listening dialogue at CEFR level ${cefr}${
        topic ? ` about: ${topic}` : " about an ordinary everyday situation"
      }.`,
    });
    // Billed whether or not the result survives the check — it was generated.
    await recordUsage(session.username, "escutar", modelId(), usage);

    const candidate: ScriptLine[] = output.lines
      .map((l) => ({
        speaker: (l.speaker ?? "").trim() || "Ana",
        text: (l.text ?? "").trim(),
        translation: (l.translation ?? "").trim(),
      }))
      .filter((l) => l.text.length > 0);
    if (candidate.length === 0) continue;

    // The title is read back too — it is displayed, and a Chinese title on a
    // Portuguese clip is the same bug in a smaller font.
    const bad = scriptOffenders([
      ...candidate,
      { text: output.title ?? "" },
    ]);
    if (bad.length === 0) {
      script = candidate;
      title = (output.title ?? "").trim();
      break;
    }
    // Never synthesize or store it: wrong-script audio costs Azure characters
    // and leaves a clip nobody can use sitting in the family's library.
    offending = nonLatinSample(bad.join(" "));
  }

  if (script.length === 0) {
    return NextResponse.json(
      {
        error: offending
          ? `A Sandra escreveu fora do português (${offending}). Tenta outro tema.`
          : "A Sandra não escreveu nada. Tenta outra vez.",
      },
      { status: 502 }
    );
  }

  // Each person keeps one voice throughout, and it MATCHES THEIR GENDER.
  // Assigning by order of appearance put a man's voice on Ana and a woman's on
  // Miguel, which in a listening exercise breaks the exercise itself — the
  // learner is being asked to follow who says what.
  const speakerVoices = assignSpeakerVoices([
    ...new Set(script.map((l) => l.speaker)),
  ]);
  const voiceFor = (speaker: string) =>
    speakerVoices.get(speaker) ?? azureVoices()[0];

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

  const clipTitle = title || topic || "Diálogo";
  const clipKey = await putAudio(
    audioKey("clip", `${clipTitle}|${mp3.length}`),
    mp3
  );

  const [row] = await getDb()
    .insert(listeningClips)
    .values({
      title: clipTitle,
      cefr,
      topic,
      transcript,
      audioB64: clipKey ? null : mp3.toString("base64"),
      audioKey: clipKey,
      bytes: mp3.length,
      source: "ai",
      createdBy: session.username,
    })
    .returning({ id: listeningClips.id });

  return NextResponse.json({ id: row.id });
}
