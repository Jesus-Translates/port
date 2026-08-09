import "dotenv/config";
import { eq, isNotNull, isNull, and } from "drizzle-orm";
import { getDb, listeningClips, lsSessions, ttsAudio } from "../lib/db";
import { audioKey, blobConfigured, putAudio } from "../lib/blob";

/**
 * Move audio that is still inline in Postgres into R2, one row at a time.
 *
 * Deliberately incremental and re-runnable: it only touches rows that have
 * base64 and no key, uploads BEFORE clearing, and verifies the upload
 * succeeded before it lets go of the only copy. Kill it half way through and
 * the app keeps working — every read already prefers the key and falls back to
 * the column.
 */
async function main() {
  if (!blobConfigured()) {
    console.error(
      "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET."
    );
    process.exit(1);
  }
  const db = getDb();
  let moved = 0;
  let freed = 0;

  // --- shared TTS cache -----------------------------------------------------
  const tts = await db
    .select({ id: ttsAudio.id, hash: ttsAudio.hash, b64: ttsAudio.audioB64 })
    .from(ttsAudio)
    .where(and(isNotNull(ttsAudio.audioB64), isNull(ttsAudio.audioKey)));
  for (const row of tts) {
    if (!row.b64) continue;
    const buf = Buffer.from(row.b64, "base64");
    const key = await putAudio(audioKey("tts", row.hash), buf);
    if (!key) {
      console.error(`  tts ${row.id}: upload failed, left inline`);
      continue;
    }
    await db
      .update(ttsAudio)
      .set({ audioKey: key, audioB64: null })
      .where(eq(ttsAudio.id, row.id));
    moved++;
    freed += row.b64.length;
  }

  // --- listening library ----------------------------------------------------
  const clips = await db
    .select({ id: listeningClips.id, b64: listeningClips.audioB64 })
    .from(listeningClips)
    .where(and(isNotNull(listeningClips.audioB64), isNull(listeningClips.audioKey)));
  for (const row of clips) {
    if (!row.b64) continue;
    const buf = Buffer.from(row.b64, "base64");
    const key = await putAudio(audioKey("clip", `clip-${row.id}`), buf);
    if (!key) {
      console.error(`  clip ${row.id}: upload failed, left inline`);
      continue;
    }
    await db
      .update(listeningClips)
      .set({ audioKey: key, audioB64: null })
      .where(eq(listeningClips.id, row.id));
    moved++;
    freed += row.b64.length;
  }

  // --- Listen & Speak sessions ---------------------------------------------
  const sessions = await db
    .select({ id: lsSessions.id, username: lsSessions.username, b64: lsSessions.audioB64 })
    .from(lsSessions)
    .where(and(isNotNull(lsSessions.audioB64), isNull(lsSessions.audioKey)));
  for (const row of sessions) {
    if (!row.b64) continue;
    const buf = Buffer.from(row.b64, "base64");
    const key = await putAudio(audioKey("ls", `session-${row.id}-${row.username}`), buf);
    if (!key) {
      console.error(`  session ${row.id}: upload failed, left inline`);
      continue;
    }
    await db
      .update(lsSessions)
      .set({ audioKey: key, audioB64: null })
      .where(eq(lsSessions.id, row.id));
    moved++;
    freed += row.b64.length;
  }

  console.log(
    `✓ moved ${moved} clips to R2, freeing ${(freed / 1024 / 1024).toFixed(1)} MB of Postgres`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
