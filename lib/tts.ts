import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, ttsAudio } from "@/lib/db";
import { recordUsage } from "@/lib/usage";

/**
 * TTS provider seam.
 * - Azure Speech (preferred when AZURE_SPEECH_KEY + AZURE_SPEECH_REGION are
 *   set): native pt-PT neural voices, rotated per text so the library sounds
 *   like several people, not one robot. Multi-voice SSML enables dialogues
 *   and Listen & Speak sessions.
 * - OpenAI (fallback): gpt-4o-mini-tts with pt-PT steering instructions.
 * Voice choice is a STABLE hash of the text — variety across the library,
 * but the same phrase always plays in the same voice and caches exactly once.
 */

const DEFAULT_AZURE_VOICES =
  "pt-PT-RaquelNeural,pt-PT-DuarteNeural,pt-PT-FernandaNeural,pt-PT-Rui:MAI-Voice-2";

export function azureConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

export function azureVoices(): string[] {
  return (process.env.AZURE_TTS_VOICES ?? DEFAULT_AZURE_VOICES)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Stable per-text voice: mixes voices across content, deterministic per phrase. */
export function pickVoice(text: string): string {
  const voices = azureVoices();
  const h = createHash("sha1").update(text).digest();
  return voices[h[0] % voices.length];
}

function openaiVoice(): string {
  return process.env.TTS_VOICE ?? "marin";
}

function openaiInstructions(): string {
  return (
    process.env.TTS_INSTRUCTIONS ??
    "Speak in EUROPEAN Portuguese as spoken in Lisbon, Portugal (português europeu). Reduce unstressed vowels, use the European 'sh' sound for final s. Never use Brazilian Portuguese pronunciation. Calm, clear, natural pace for a language learner."
  );
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ttsHash(text: string): string {
  const key = azureConfigured()
    ? `azure|${pickVoice(text)}|${text}`
    : `openai|${openaiVoice()}|${openaiInstructions()}|${text}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 40);
}

const AZURE_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

/** Raw Azure synthesis of an SSML document. Returns MP3 bytes or null. */
export async function azureSynthesizeSsml(ssml: string): Promise<Buffer | null> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;
  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": AZURE_FORMAT,
        "User-Agent": "portuguese-hub",
      },
      body: ssml,
    }
  );
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

/** Wrap plain text in single-voice SSML. */
export function ssmlFor(text: string, voice: string, rate = "0.95"): string {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-PT"><voice name="${voice}"><prosody rate="${rate}">${xmlEscape(text)}</prosody></voice></speak>`;
}

/**
 * Build one SSML doc from segments — each with its own voice, optional rate,
 * and an optional trailing pause. Powers dialogues and Listen & Speak.
 */
export function ssmlSegments(
  segments: {
    text: string;
    voice: string;
    rate?: string;
    breakAfterMs?: number;
  }[]
): string {
  const body = segments
    .map(
      (s) =>
        `<voice name="${s.voice}"><prosody rate="${s.rate ?? "0.95"}">${xmlEscape(s.text)}</prosody></voice>` +
        (s.breakAfterMs ? `<voice name="${s.voice}"><break time="${Math.min(s.breakAfterMs, 5000)}ms"/></voice>` : "")
    )
    .join("");
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-PT">${body}</speak>`;
}

async function azureCost(username: string, chars: number): Promise<void> {
  // $16 per 1M characters (standard neural). Modeled as char = input token.
  await recordUsage(username, "tts", "azure/neural-tts", {
    inputTokens: chars,
    outputTokens: 0,
  });
}

async function openaiSynthesize(
  text: string,
  username: string
): Promise<Buffer | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.startsWith("sk-")) return null;
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: openaiVoice(),
      input: text,
      instructions: openaiInstructions(),
      response_format: "mp3",
    }),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const seconds = buf.length / 4000;
  await recordUsage(username, "tts", "openai/gpt-4o-mini-tts", {
    inputTokens: Math.ceil(text.length / 4),
    outputTokens: Math.ceil(seconds * 21),
  });
  return buf;
}

/**
 * Synthesize (or fetch cached) pt-PT audio for a short text.
 * Generated once, cached in Postgres. Returns null when no provider works.
 */
export async function getTtsAudio(
  text: string,
  username: string
): Promise<Buffer | null> {
  const clean = text.trim().slice(0, 1600);
  if (!clean) return null;

  const db = getDb();
  const hash = ttsHash(clean);
  const [cached] = await db
    .select({ audioB64: ttsAudio.audioB64 })
    .from(ttsAudio)
    .where(eq(ttsAudio.hash, hash))
    .limit(1);
  if (cached) return Buffer.from(cached.audioB64, "base64");

  let buf: Buffer | null = null;
  let voiceUsed = "";
  if (azureConfigured()) {
    voiceUsed = pickVoice(clean);
    buf = await azureSynthesizeSsml(ssmlFor(clean, voiceUsed));
    if (buf) await azureCost(username, clean.length);
  }
  if (!buf) {
    voiceUsed = `openai:${openaiVoice()}`;
    buf = await openaiSynthesize(clean, username);
  }
  if (!buf) return null;

  await db
    .insert(ttsAudio)
    .values({
      hash,
      text: clean,
      voice: voiceUsed,
      audioB64: buf.toString("base64"),
      bytes: buf.length,
    })
    .onConflictDoNothing({ target: ttsAudio.hash });
  return buf;
}
