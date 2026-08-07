import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, ttsAudio } from "@/lib/db";
import { recordUsage } from "@/lib/usage";

/** Voice + steering are env-swappable so the accent can be tuned (or the
 *  provider swapped) without code changes after a native-ear test. */
function voice(): string {
  return process.env.TTS_VOICE ?? "marin";
}

function instructions(): string {
  return (
    process.env.TTS_INSTRUCTIONS ??
    "Speak in EUROPEAN Portuguese as spoken in Lisbon, Portugal (português europeu). Reduce unstressed vowels, use the European 'sh' sound for final s. Never use Brazilian Portuguese pronunciation. Calm, clear, natural pace for a language learner."
  );
}

export function ttsHash(text: string): string {
  return createHash("sha256")
    .update(`${voice()}|${instructions()}|${text}`)
    .digest("hex")
    .slice(0, 40);
}

/**
 * Synthesize (or fetch cached) pt-PT audio for a short text. Generated once,
 * cached in Postgres — 434 phrasebook entries ≈ a few MB total.
 * Returns null when no real OpenAI key is configured.
 */
export async function getTtsAudio(
  text: string,
  username: string
): Promise<Buffer | null> {
  const clean = text.trim().slice(0, 1600);
  if (!clean) return null;
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.startsWith("sk-")) return null;

  const db = getDb();
  const hash = ttsHash(clean);
  const [cached] = await db
    .select({ audioB64: ttsAudio.audioB64 })
    .from(ttsAudio)
    .where(eq(ttsAudio.hash, hash))
    .limit(1);
  if (cached) return Buffer.from(cached.audioB64, "base64");

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: voice(),
      input: clean,
      instructions: instructions(),
      response_format: "mp3",
    }),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());

  // Rough cost accounting: text in (~4 chars/token) + audio out
  // (~32kbps mp3 → seconds ≈ bytes/4000; ~21 audio tokens/sec at $12/1M).
  const seconds = buf.length / 4000;
  await recordUsage(username, "tts", "openai/gpt-4o-mini-tts", {
    inputTokens: Math.ceil(clean.length / 4),
    outputTokens: Math.ceil(seconds * 21),
  });

  await db
    .insert(ttsAudio)
    .values({
      hash,
      text: clean,
      voice: voice(),
      audioB64: buf.toString("base64"),
      bytes: buf.length,
    })
    .onConflictDoNothing({ target: ttsAudio.hash });
  return buf;
}
