import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb, lsSessions } from "@/lib/db";
import { getAudio, presignAudio } from "@/lib/blob";
import { verifyLsToken } from "@/lib/ls";
import { azureConfigured } from "@/lib/tts";

/**
 * The MP3 for one Listen & Speak session.
 *
 * PUBLIC path (see PUBLIC_PATHS in proxy.ts): podcast apps fetch this without
 * our session cookie, so the signed ?t= token is the only credential.
 */
export async function GET(request: NextRequest) {
  if (!azureConfigured()) {
    return NextResponse.json(
      {
        error:
          "Listen & Speak precisa das variáveis AZURE_SPEECH_KEY e AZURE_SPEECH_REGION.",
      },
      { status: 503 }
    );
  }

  const params = request.nextUrl.searchParams;
  const username = await verifyLsToken(params.get("t"));
  if (!username) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  }

  const [row] = await getDb()
    .select({
      username: lsSessions.username,
      audioB64: lsSessions.audioB64,
      audioKey: lsSessions.audioKey,
    })
    .from(lsSessions)
    .where(eq(lsSessions.id, id))
    .limit(1);

  // Pruned, or someone else's session — same answer either way.
  if (!row || row.username !== username) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
  }

  // The whole reason for object storage: hand the listener a short-lived URL
  // and let their podcast app pull 1.5 MB straight from R2, where egress is
  // free, instead of streaming it through this function on every replay.
  if (row.audioKey) {
    const url = await presignAudio(row.audioKey);
    if (url) return NextResponse.redirect(url, 302);
    const fromBlob = await getAudio(row.audioKey);
    if (fromBlob) return audioResponse(fromBlob);
  }
  if (!row.audioB64) {
    return NextResponse.json({ error: "Sessão sem áudio." }, { status: 404 });
  }
  return audioResponse(Buffer.from(row.audioB64, "base64"));
}

/** One shape for every audio response, whatever the bytes came from. */
function audioResponse(audio: Buffer): NextResponse {
  return new NextResponse(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audio.length),
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

