import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel, SPEAKING_COACHING } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, missionAttempts, missions } from "@/lib/db";
import { addMistakeCard } from "@/lib/srs";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

const missionGradeSchema = z.object({
  score: z
    .number()
    .describe("Whole number 0-10: did they complete the task, politely, in correct pt-PT?"),
  feedbackMd: z
    .string()
    .describe(
      "Bilingual markdown: a 🇬🇧 line with 2-3 English sentences (what worked, then the one most useful fix, pt-PT in **bold**), then a 🇵🇹 line with the same in very simple European Portuguese."
    ),
  correctedPt: z
    .string()
    .nullable()
    .describe(
      "The best natural pt-PT version of the key phrase they needed. Null when what they said was already spot on."
    ),
});

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
      { error: "Gravação indisponível (OPENAI_API_KEY em falta)." },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const missionId = Number(form.get("id"));
  const audio = form.get("audio");
  if (!Number.isInteger(missionId) || missionId <= 0) {
    return NextResponse.json({ error: "Missão inválida." }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Sem áudio." }, { status: 400 });
  }
  if (audio.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Gravação demasiado longa." },
      { status: 413 }
    );
  }

  const db = getDb();
  const [mission] = await db
    .select()
    .from(missions)
    .where(eq(missions.id, missionId))
    .limit(1);
  if (!mission) {
    return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
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

  const seconds = audio.size / 8000;
  await recordUsage(session.username, "stt", "openai/gpt-4o-mini-transcribe", {
    inputTokens: Math.ceil(seconds * 10),
    outputTokens: Math.ceil(transcript.length / 4),
  });

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: missionGradeSchema }),
    instructions: `You are Sandra, grading a real-world FIELD MISSION for a family learning European Portuguese. ${await currentStyle()}

The learner (${session.displayName}, level ${mission.cefr}) either did the errand for real or rehearsed it out loud.

${SPEAKING_COACHING}

Score 0-10 on three things, in this order of weight:
1. Task completion — did they actually ask for/say everything the mission brief required?
2. Politeness and shop etiquette — bom dia / faz favor / obrigado(a), the "se faz favor" softening, not being brusque.
3. European Portuguese correctness — word choice, verb forms, pt-PT (never Brazilian) vocabulary.
Be generous about hesitation and fillers: this is someone speaking to a real shopkeeper. 7+ means the errand would have worked.
A transcript that is empty or clearly not Portuguese scores 0-2.

feedbackMd must be warm and specific — name what they got right first — and must END with the pronunciation pointer on its
own final line, written as "🗣️ …": the sound in **bold** and what the mouth does, tied to a word they actually said. A
mission is spoken out loud in a real shop, so it never ends without that pointer.
correctedPt is the single most useful phrase, in its best natural pt-PT form (what a local would actually say), or null if
nothing needs fixing.`,
    prompt: `MISSION: ${mission.title}
BRIEF (pt): ${mission.promptPt}
BRIEF (en): ${mission.promptEn}
WHERE: ${mission.location}
LEVEL: ${mission.cefr}

TRANSCRIPT OF WHAT THEY SAID: ${transcript || "(nothing recognised)"}`,
  });
  await recordUsage(session.username, "grade", modelId(), usage);

  const score = Math.max(0, Math.min(10, Math.round(Number(output.score) || 0)));
  const correctedPt = output.correctedPt?.trim() || null;

  const [attempt] = await db
    .insert(missionAttempts)
    .values({
      missionId: mission.id,
      username: session.username,
      kind: "audio",
      transcript,
      feedbackMd: output.feedbackMd,
      score,
    })
    .returning({ id: missionAttempts.id, createdAt: missionAttempts.createdAt });

  await logActivity(
    session.username,
    "missao",
    score >= 7
      ? `Missão «${mission.title}» cumprida 🗺️`
      : `Missão «${mission.title}» — a treinar 🎙️`,
    score >= 7 ? 20 : 8
  );

  if (correctedPt) {
    await addMistakeCard(
      session.username,
      mission.promptEn,
      correctedPt,
      `Missão «${mission.title}»`
    );
  }

  return NextResponse.json({
    id: attempt.id,
    kind: "audio",
    transcript,
    feedbackMd: output.feedbackMd,
    correctedPt,
    score,
    createdAt: attempt.createdAt,
  });
}
