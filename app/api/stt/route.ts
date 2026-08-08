import { generateText } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, SPEAKING_COACHING } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { scorePronunciation } from "@/lib/pronunciation";
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

  // iOS Safari records audio/mp4; Chrome records webm — name the file to
  // match its real container or the transcriber rejects it.
  const type = audio.type || "audio/webm";
  const ext = type.includes("mp4")
    ? "mp4"
    : type.includes("mpeg") || type.includes("mp3")
      ? "mp3"
      : type.includes("ogg")
        ? "ogg"
        : type.includes("wav")
          ? "wav"
          : "webm";
  const upstream = new FormData();
  upstream.append("file", audio, `audio.${ext}`);
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
    const pron = scorePronunciation(target, transcript);

    // When something slipped, Luna diagnoses the specific sounds — comparing
    // what was heard against the target word by word.
    let tips: string[] = [];
    if (pron.score < 100) {
      const problems = pron.words
        .filter((w) => w.status !== "ok")
        .map((w) =>
          w.heard
            ? `target "${w.word}" was heard as "${w.heard}"`
            : `target "${w.word}" was not heard at all`
        )
        .join("; ");
      try {
        const { text, usage } = await generateText({
          model: getModel(),
          instructions: `You are Luna, a European Portuguese pronunciation coach. ${await currentStyle()}
A learner read a sentence aloud; speech recognition compared it to the target. From the mismatches, diagnose the 1-2 most
likely PRONUNCIATION causes.

${SPEAKING_COACHING}

If a word was simply skipped, say to slow down. Each tip ≤ 20 words, and every one must name the sound and say what the
mouth does — no generic "practise more".
Output contract, overriding any shape above: reply with ONLY the tips, 1-2 of them, one per line, no numbering, no
preamble, no closing line. English, with pt-PT sounds in **bold**.`,
          prompt: `TARGET: ${target}\nHEARD: ${transcript || "(nothing)"}\nMISMATCHES: ${problems}`,
        });
        await recordUsage(session.username, "grade", modelId(), usage);
        tips = text
          .split("\n")
          .map((t) => t.replace(/^[-*\d.\s]+/, "").trim())
          .filter(Boolean)
          .slice(0, 2);
      } catch {
        tips = [];
      }
    }

    await logActivity(
      session.username,
      "falar",
      `Leu em voz alta — pronúncia ${pron.score}/100`,
      Math.max(3, Math.round((pron.score / 100) * 8))
    );
    return NextResponse.json({ transcript, pron, tips });
  }

  // Open mode: short spoken-answer feedback from Luna.
  let feedbackMd: string | null = null;
  try {
    const { text, usage } = await generateText({
      model: getModel(),
      instructions: `You are Luna, a warm European Portuguese tutor. ${await currentStyle()}
The learner (${session.displayName}) SPOKE an answer to a question and you see only its transcript: judge whether it
answered the question, plus word choice, verb forms and fluency.

${SPEAKING_COACHING}

Reply in markdown, BILINGUAL, exactly this shape:
🇬🇧 2-3 short English sentences — one thing done well, then the most useful improvement with the corrected pt-PT in **bold**.
🇵🇹 The same feedback in very simple pt-PT (A2 level), 1-2 sentences.
🗣️ The pronunciation pointer, in English, ≤ 25 words: the sound in **bold** and what the mouth does.
End with one short encouraging line in Portuguese.`,
      prompt: `THE QUESTION ASKED: ${prompt || "(free conversation)"}\n\nTRANSCRIPT OF THE SPOKEN ANSWER: ${transcript || "(nothing recognised)"}`,
    });
    feedbackMd = text;
    await recordUsage(session.username, "grade", modelId(), usage);
  } catch {
    feedbackMd = null;
  }
  await logActivity(session.username, "falar", "Praticou conversação oral", 8);
  return NextResponse.json({ transcript, feedbackMd });
}
