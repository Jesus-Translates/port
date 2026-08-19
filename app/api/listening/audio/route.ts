import { and, eq, inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import { visibleOwners } from "@/lib/tenant";
import { getAudio } from "@/lib/blob";

export const maxDuration = 60;

/** The mp3 for one Escutar clip. Callers append the clip's byte count as a
 *  cache-buster (`&v=`), so this can be cached hard yet still swap the moment
 *  someone records a real voice over the TTS. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Sem clip." }, { status: 400 });
  }

  const [clip] = await getDb()
    .select({ audioB64: listeningClips.audioB64, audioKey: listeningClips.audioKey })
    .from(listeningClips)
    // Scoping the PAGE is not enough while the bytes are fetchable by id:
    // the audio is the thing worth taking, and this route served any of it.
    .where(
      and(
        eq(listeningClips.id, id),
        inArray(listeningClips.createdBy, await visibleOwners())
      )
    )
    .limit(1);
  if (clip?.audioKey) {
    const fromBlob = await getAudio(clip.audioKey);
    if (fromBlob) return audioResponse(fromBlob);
  }
  if (!clip?.audioB64) {
    return NextResponse.json({ error: "Clipe não encontrado." }, { status: 404 });
  }

  return audioResponse(Buffer.from(clip.audioB64, "base64"));
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

