import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getRole, getSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import {
  alignTranscript,
  audioExtension,
  parseTranscript,
  transcribeWordTimings,
} from "@/lib/listening";
import { recordUsage } from "@/lib/usage";

export const maxDuration = 120;

/** Below this it cannot be a real recording, whatever the content type says. */
const MIN_BYTES = 2048;
const MAX_BYTES = 15 * 1024 * 1024;

/**
 * Replace a clip's TTS with a real recording. The script never changes — the
 * family reads the same dialogue in their own voices — so we only re-time it:
 * Whisper on the upload, aligned back onto the lines that are already there.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  // Replacing a clip's audio changes it for the WHOLE family, so it is a
  // staff action. The player only shows the control to staff, but a UI
  // affordance is not a boundary — enforce it here.
  if (getRole(session.username) === "student") {
    return NextResponse.json(
      { error: "Só a professora pode substituir o áudio." },
      { status: 403 }
    );
  }

  const form = await request.formData();
  const id = Number(form.get("id"));
  const audio = form.get("audio");
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Sem clip." }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Sem áudio." }, { status: 400 });
  }
  // A real recording of even one word is tens of kilobytes. Without this the
  // route happily accepted a few bytes of text and destroyed the clip's audio
  // — which is exactly how a test wiped one in production.
  if (audio.size < MIN_BYTES) {
    return NextResponse.json(
      { error: "Gravação demasiado curta ou inválida." },
      { status: 400 }
    );
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Gravação demasiado grande (máx. 15 MB)." },
      { status: 413 }
    );
  }

  const db = getDb();
  const [clip] = await db
    .select({ transcript: listeningClips.transcript })
    .from(listeningClips)
    .where(eq(listeningClips.id, id))
    .limit(1);
  if (!clip) {
    return NextResponse.json({ error: "Clip não encontrado." }, { status: 404 });
  }
  const existing = parseTranscript(clip.transcript);
  if (existing.lines.length === 0) {
    return NextResponse.json(
      { error: "Este clip não tem transcrição." },
      { status: 400 }
    );
  }

  const type = audio.type || "audio/webm";
  const bytes = new Uint8Array(await audio.arrayBuffer());
  const heard = await transcribeWordTimings(
    bytes,
    `gravacao.${audioExtension(type)}`,
    type
  );
  if (heard) {
    await recordUsage(session.username, "stt", "openai/gpt-4o-mini-transcribe", {
      inputTokens: Math.ceil(heard.duration * 10),
      outputTokens: 0,
    });
  }
  const transcript = alignTranscript(
    existing.lines.map((l) => ({
      speaker: l.speaker,
      text: l.text,
      translation: l.translation,
    })),
    heard?.words ?? [],
    heard?.duration ?? 0
  );

  await db
    .update(listeningClips)
    .set({
      audioB64: Buffer.from(bytes).toString("base64"),
      bytes: bytes.length,
      source: "human",
      createdBy: session.username,
      transcript,
    })
    .where(eq(listeningClips.id, id));

  return NextResponse.json({ ok: true, timed: Boolean(heard) });
}
