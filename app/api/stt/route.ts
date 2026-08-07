import { generateText } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, PT_STYLE } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { gradeDitadoText } from "@/lib/ditado";
import { logActivity } from "@/lib/data";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 60;

/**
 * Speech practice: transcribe a recording, then either
 *   mode=read  — align against the target sentence (word-level, honest framing:
 *                "did the recogniser understand you", not a pronunciation score)
 *   mode=open  — Luna gives short feedback on the spoken answer to a prompt.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos — espera uns minutos." },
      { status: 429 }
    );
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.startsWith("sk-")) {
    return NextResponse.json(
      { error: "Fala indisponível (OPENAI_API_KEY em falta)." },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const audio = form.get("audio");
  const mode = String(form.get("mode") ?? "read");
  const target = String(form.get("target") ?? "").slice(0, 600);
  const prompt = String(form.get("prompt") ?? "").slice(0, 600);
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Sem áudio." }, { status: 400 });
  }
  if (audio.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Gravação demasiado longa." }, { status: 413 });
  }

  const upstream = new FormData();
  upstream.append("file", audio, "audio.webm");
  upstream.append("model", process.env.STT_MODEL ?? "gpt-4o-mini-transcribe");
  upstream.append("language", "pt");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: upstream,
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "A transcrição falhou. Tenta outra vez." },
      { status: 502 }
    );
  }
  const data = (await res.json()) as { text?: string };
  const transcript = (data.text ?? "").trim();

  // ~$0.003/min ≈ tokens bookkeeping: charge by audio seconds (~64kbps webm).
  const seconds = audio.size / 8000;
  await recordUsage(session.username, "stt", "openai/gpt-4o-mini-transcribe", {
    inputTokens: Math.ceil(seconds * 10),
    outputTokens: Math.ceil(transcript.length / 4),
  });

  if (mode === "read" && target) {
    const diff = gradeDitadoText(target, transcript);
    await logActivity(
      session.username,
      "falar",
      `Leu em voz alta: ${diff.score}/${diff.total} palavras entendidas`,
      Math.max(3, Math.round((diff.score / Math.max(diff.total, 1)) * 8))
    );
    return NextResponse.json({ transcript, diff });
  }

  // Open mode: short spoken-answer feedback from Luna.
  let feedbackMd: string | null = null;
  try {
    const { text, usage } = await generateText({
      model: getModel(),
      instructions: `You are Luna, a warm European Portuguese tutor. ${PT_STYLE}
The learner (${session.displayName}) SPOKE an answer; you see only its transcript, so ignore
spelling/accents entirely — judge the Portuguese as speech (word choice, verb forms, fluency).
Reply in 2-3 short markdown sentences: name one thing they did well, one concrete improvement
with the corrected pt-PT in **bold**, and end with an encouraging line. English prose.`,
      prompt: `THE SPEAKING PROMPT: ${prompt || "(free conversation)"}\n\nTRANSCRIPT OF WHAT THEY SAID: ${transcript || "(nothing recognised)"}`,
    });
    feedbackMd = text;
    await recordUsage(session.username, "grade", modelId(), usage);
  } catch {
    feedbackMd = null;
  }
  await logActivity(session.username, "falar", "Praticou conversação oral", 8);
  return NextResponse.json({ transcript, feedbackMd });
}
