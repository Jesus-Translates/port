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

/**
 * Raw Azure synthesis of an SSML document. Returns MP3 bytes or null.
 *
 * Billing happens HERE, on the exact string sent, so no call site can forget
 * it and none can under-count. Pass the learner so the spend lands on them;
 * omit it only for work that genuinely belongs to nobody.
 *
 * We charge the FULL SSML length rather than just the spoken text. Multi-voice
 * documents carry ~140 characters of <voice>/<prosody>/<break> markup per line,
 * so counting text alone under-reported a dialogue by roughly 4x. Over-stating
 * a spend display is recoverable; under-stating it is how you get a surprise.
 */
export type AzureResult = {
  ok: boolean;
  status: number;
  /** Azure's own explanation when it refuses — empty on success. */
  detail: string;
  bytes: number;
  audio: Buffer | null;
};

/**
 * The single place we speak to Azure. Returns the failure reason rather than
 * swallowing it, so callers can log or surface WHY there is no audio — one
 * bad voice name in a rotation rejects the whole document, and "returned
 * null" is not enough to find that.
 */
export async function azureTrySsml(ssml: string): Promise<AzureResult> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return { ok: false, status: 0, detail: "AZURE_SPEECH_KEY/REGION not set", bytes: 0, audio: null };
  }
  let res: Response;
  try {
    res = await fetch(
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
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, detail, bytes: 0, audio: null };
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 400);
    console.error(
      `azure tts failed: ${res.status} ${res.statusText} — ${detail} (ssml ${ssml.length} chars)`
    );
    return { ok: false, status: res.status, detail, bytes: 0, audio: null };
  }
  const audio = Buffer.from(await res.arrayBuffer());
  return { ok: true, status: res.status, detail: "", bytes: audio.length, audio };
}

export async function azureSynthesizeSsml(
  ssml: string,
  username?: string
): Promise<Buffer | null> {
  const result = await azureTrySsml(ssml);
  if (!result.audio) return null;
  if (username) await azureCost(username, ssml.length);
  return result.audio;
}

/** Wrap plain text in single-voice SSML. */
export function ssmlFor(text: string, voice: string, rate = "0.95"): string {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-PT"><voice name="${voice}"><prosody rate="${rate}">${xmlEscape(text)}</prosody></voice></speak>`;
}

export type Segment = {
  text: string;
  voice: string;
  rate?: string;
  breakAfterMs?: number;
};

/**
 * Azure rejects any document holding more than 50 <voice> elements with a bare
 * 400. A 20-card Listen & Speak session needs 41, so it fits — but only since
 * each segment now emits ONE voice element. Splitting long content across
 * documents (below) is what keeps this from becoming a cliff again.
 */
export const AZURE_MAX_VOICES = 50;

/**
 * Build one SSML doc from segments — each with its own voice, optional rate,
 * and an optional trailing pause. Powers dialogues and Listen & Speak.
 *
 * The pause lives INSIDE the segment's own <voice> element. Giving the break
 * its own wrapper doubled the element count and pushed a full session past
 * Azure's limit, which failed the whole document while short clips kept
 * working — so the breakage only ever showed up on real sessions.
 */
export function ssmlSegments(segments: Segment[]): string {
  const body = segments
    .map(
      (s) =>
        `<voice name="${s.voice}"><prosody rate="${s.rate ?? "0.95"}">${xmlEscape(s.text)}</prosody>` +
        (s.breakAfterMs ? `<break time="${Math.min(s.breakAfterMs, 5000)}ms"/>` : "") +
        `</voice>`
    )
    .join("");
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-PT">${body}</speak>`;
}

/**
 * The same content as one or more documents, none exceeding Azure's element
 * limit. Callers synthesize each and join the audio — MP3 frames concatenate
 * cleanly, so the listener hears one continuous track.
 */
export function ssmlSegmentDocs(
  segments: Segment[],
  maxVoices = AZURE_MAX_VOICES
): string[] {
  const docs: string[] = [];
  for (let i = 0; i < segments.length; i += maxVoices) {
    docs.push(ssmlSegments(segments.slice(i, i + maxVoices)));
  }
  return docs.length > 0 ? docs : [ssmlSegments([])];
}

/**
 * Synthesize a multi-document run and return it as a single MP3. Any failing
 * part fails the whole thing — a session with a silent gap in the middle is
 * worse than an honest error.
 */
export async function azureSynthesizeDocs(
  docs: string[],
  username?: string
): Promise<Buffer | null> {
  const parts: Buffer[] = [];
  for (const doc of docs) {
    const audio = await azureSynthesizeSsml(doc, username);
    if (!audio) return null;
    parts.push(audio);
  }
  return parts.length > 0 ? Buffer.concat(parts) : null;
}

async function azureCost(username: string, chars: number): Promise<void> {
  // $15 per 1M characters (standard neural, Azure retail price API 2026-08-07).
  // Modelled as char = input token so it flows through the same pricing table.
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
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(
      `openai tts failed: ${res.status} ${res.statusText} — ${detail.slice(0, 400)}`
    );
    return null;
  }
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
    buf = await azureSynthesizeSsml(ssmlFor(clean, voiceUsed), username);
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
