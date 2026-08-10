import { and, desc, eq, notInArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, lsSessions } from "@/lib/db";
import { buildSessionSsml, LS_MAX_CARDS } from "@/lib/ls";
import { getFlashQueue, getQueue } from "@/lib/srs";
import { azureConfigured, azureSynthesizeDocs } from "@/lib/tts";
import { audioKey, deleteAudio, putAudio } from "@/lib/blob";

// Six minutes of neural TTS in one request — give Azure room.
export const maxDuration = 120;

/** One session per 10 minutes is plenty; nobody listens faster than that. */
const COOLDOWN_MS = 10 * 60 * 1000;
/** How many sessions we keep per person (each MP3 lives in Postgres). */
const KEEP = 5;

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!azureConfigured()) {
    return NextResponse.json(
      {
        error:
          "Listen & Speak precisa das variáveis AZURE_SPEECH_KEY e AZURE_SPEECH_REGION.",
      },
      { status: 503 }
    );
  }

  const db = getDb();
  const username = session.username;

  const [latest] = await db
    .select({ createdAt: lsSessions.createdAt })
    .from(lsSessions)
    .where(eq(lsSessions.username, username))
    .orderBy(desc(lsSessions.createdAt))
    .limit(1);
  if (latest) {
    const waited = Date.now() - new Date(latest.createdAt).getTime();
    if (waited < COOLDOWN_MS) {
      const mins = Math.max(1, Math.ceil((COOLDOWN_MS - waited) / 60000));
      return NextResponse.json(
        {
          error: `Acabaste de gerar uma sessão — espera ${mins} min. Ouve essa primeiro!`,
        },
        { status: 429 }
      );
    }
  }

  // Due cards are the point; when nothing is due, a random hand still helps.
  let queue = await getQueue(username);
  if (queue.length === 0) queue = await getFlashQueue(username, 10);

  // Filter here too, so the stored cardCount matches what the MP3 contains.
  const cards = queue
    .map((c) => ({ front: c.front.trim(), back: c.back.trim() }))
    .filter((c) => c.front && c.back)
    .slice(0, LS_MAX_CARDS);
  if (cards.length === 0) {
    return NextResponse.json(
      {
        error:
          "O teu baralho está vazio — adiciona cartões em Rever e volta cá.",
      },
      { status: 409 }
    );
  }

  const { docs } = buildSessionSsml(cards);

  const audio = await azureSynthesizeDocs(docs, username);
  if (!audio) {
    return NextResponse.json(
      { error: "O Azure não devolveu áudio. Tenta outra vez daqui a pouco." },
      { status: 502 }
    );
  }

  // Key it by learner + content so a regenerated identical session reuses the
  // object instead of orphaning the last one.
  const key = await putAudio(
    audioKey("ls", `${username}|${Date.now()}|${cards.length}`),
    audio
  );

  const [row] = await db
    .insert(lsSessions)
    .values({
      username,
      cardCount: cards.length,
      audioB64: key ? null : audio.toString("base64"),
      audioKey: key,
      bytes: audio.length,
    })
    .returning({ id: lsSessions.id });

  // Keep only the newest few. Since the audio moved to R2 the row is a
  // pointer, so deleting it alone leaks the object it pointed at — about
  // 1.5 MB per pruned session, per learner, forever. That is the cost problem
  // object storage was supposed to solve, reintroduced.
  const keep = await db
    .select({ id: lsSessions.id })
    .from(lsSessions)
    .where(eq(lsSessions.username, username))
    .orderBy(desc(lsSessions.createdAt), desc(lsSessions.id))
    .limit(KEEP);
  const keepIds = keep.map((k) => k.id);

  const doomed = await db
    .select({ id: lsSessions.id, audioKey: lsSessions.audioKey })
    .from(lsSessions)
    .where(and(eq(lsSessions.username, username), notInArray(lsSessions.id, keepIds)));

  // Objects first: an orphaned row is visible and fixable, an orphaned object
  // is invisible and bills forever.
  for (const old of doomed) {
    if (old.audioKey) await deleteAudio(old.audioKey);
  }
  await db
    .delete(lsSessions)
    .where(and(eq(lsSessions.username, username), notInArray(lsSessions.id, keepIds)));

  return NextResponse.json({ id: row.id, cardCount: cards.length });
}
