import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, ttsAudio } from "@/lib/db";
import { recordUsage } from "@/lib/usage";
import { audioKey, getAudio, putAudio } from "@/lib/blob";

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

/** The tutor's name, folded. Every "is this Sandra?" test goes through here. */
export const SANDRA = "sandra";

/**
 * Sandra's voice. ALWAYS the same, ALWAYS female.
 *
 * Rotating voices is right for the library — a phrasebook read by four people
 * sounds like a language, one read by a robot sounds like a robot. It is wrong
 * for Sandra. She is a person the learner talks to every day, and a tutor who
 * is a woman on Monday and a man on Tuesday is not a persona, she is a
 * text-to-speech setting.
 *
 * Conversa picked her voice with `voices[hash(topic|username) % 4]` over a
 * pool that is half male, so she was a man about half the time and a different
 * person for every learner. This is the one place that decides, so nothing can
 * disagree with anything else.
 *
 * SANDRA_VOICE overrides. Otherwise the first FEMALE voice in the pool, and
 * only if the pool somehow has no female voice does it fall back to the first
 * one — a wrong voice beats no audio.
 */
export function sandraVoice(): string {
  const override = process.env.SANDRA_VOICE?.trim();
  if (override) return override;
  const pool = azureVoices();
  return pool.find((v) => voiceGender(v) === "f") ?? pool[0] ?? "";
}

/** Is this speaker the tutor herself? */
export function isSandra(name: string): boolean {
  return fold(name).split(/[\s,(]+/)[0] === SANDRA;
}

/*
 * Speaker → voice, by GENDER rather than by order of appearance.
 *
 * Dialogues used to assign `voices[speakers.indexOf(name)]`, so the voice a
 * character got depended entirely on who spoke first. In "A família da Sandra"
 * the speakers appear as Sandra, Ana, Miguel and the pool runs
 * Raquel(f), Duarte(m), Fernanda(f) — so Ana was read by a man and Miguel by a
 * woman. In a listening exercise that is not a blemish, it is the exercise
 * failing: the learner is being asked who said what.
 */

// Portuguese given names are strongly gendered by their ending, but the
// common exceptions (Inês, Isabel, Beatriz) are exactly the names content
// uses, so the list comes first and the ending rule is the fallback.
const FEMALE_NAMES = new Set([
  "ana", "maria", "sandra", "sofia", "ines", "beatriz", "catarina", "rita",
  "joana", "leonor", "matilde", "carolina", "mariana", "teresa", "luisa",
  "isabel", "raquel", "fernanda", "madalena", "margarida", "clara", "alice",
  "francisca", "lara", "eva", "filipa", "patricia", "susana", "cristina",
  "paula", "sara", "diana", "helena", "laura", "marta", "rosa", "vera",
  "celia", "nuria", "irene", "conceicao", "manuela", "guiomar", "dulce",
]);
const MALE_NAMES = new Set([
  "joao", "miguel", "pedro", "tiago", "rui", "duarte", "francisco", "antonio",
  "manuel", "jose", "carlos", "nuno", "bruno", "diogo", "tomas", "afonso",
  "goncalo", "rodrigo", "vasco", "henrique", "luis", "paulo", "ricardo",
  "andre", "filipe", "hugo", "marco", "sergio", "vitor", "fernando", "jorge",
  "artur", "alvaro", "simao", "martim", "salvador", "dinis", "gabriel",
  "guilherme", "lourenco", "eduardo", "alexandre", "raul", "mario",
]);

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Best guess at a Portuguese given name's gender.
 *
 * Also works on role nouns, which dialogues use as speakers — "empregada" and
 * "empregado" fall out of the ending rule correctly.
 */
export function ptGender(name: string): "f" | "m" {
  const first = fold(name).split(/[\s,(]+/)[0] ?? "";
  if (FEMALE_NAMES.has(first)) return "f";
  if (MALE_NAMES.has(first)) return "m";
  return first.endsWith("a") ? "f" : "m";
}

/**
 * Azure ids embed the voice's given name: pt-PT-RaquelNeural → "Raquel".
 *
 * Exported so scripts/revoice-clips.ts can tell which already-generated audio
 * carries a wrong-gender voice, rather than re-deriving the rule and drifting
 * from it.
 */
export function voiceGender(voiceId: string): "f" | "m" {
  const given = /^[a-z]{2}-[A-Z]{2}-([A-Za-z]+?)(Neural|:|$)/.exec(voiceId)?.[1];
  return ptGender(given ?? voiceId);
}

/**
 * Give every speaker in a dialogue a voice of their own gender, preferring a
 * distinct voice per speaker so two characters of the same gender are still
 * tellable apart.
 *
 * Sandra is pinned to the first female voice wherever she appears: she is the
 * app's tutor, and a tutor who sounds like a different person in every
 * exercise is not a persona.
 */
export function assignSpeakerVoices(speakers: string[]): Map<string, string> {
  const pool = azureVoices();
  const byGender = { f: pool.filter((v) => voiceGender(v) === "f"), m: pool.filter((v) => voiceGender(v) === "m") };
  const used = new Set<string>();
  const out = new Map<string, string>();

  /*
   * Sandra is not assigned a voice, she HAS one. Take it off the top and mark
   * it spent, so the rest of the cast is chosen around her rather than her
   * being chosen around them. Sorting her first only made her win the pick;
   * this makes her voice the same one she uses in Conversa and everywhere
   * else, which is the point of her having a voice at all.
   */
  const hers = sandraVoice();
  for (const speaker of speakers) {
    if (isSandra(speaker) && hers) {
      out.set(speaker, hers);
      used.add(hers);
    }
  }

  for (const speaker of speakers.filter((s) => !out.has(s))) {
    const want = byGender[ptGender(speaker)];
    /*
     * A distinct voice of the right gender; else reuse one of the right
     * gender, but NOT Sandra's if there is any other choice; else anything.
     *
     * The pool has two female voices, so a cast with Sandra and two other
     * women has to double up somewhere. Doubling a background character onto
     * SANDRA is the one repeat that actually costs something — the learner
     * stops being able to tell the tutor from the cast, which is the whole
     * reason this function exists. Two extras sharing a voice is cheap.
     */
    const voice =
      want.find((v) => !used.has(v)) ??
      want.find((v) => v !== hers) ??
      want[0] ??
      pool.find((v) => !used.has(v)) ??
      pool.find((v) => v !== hers) ??
      pool[0];
    if (voice) {
      used.add(voice);
      out.set(speaker, voice);
    }
  }
  return out;
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

/**
 * The cache key. The VOICE is part of it, which is what makes pinning safe:
 * "Bom dia" spoken by Sandra and "Bom dia" in the phrasebook are two rows, so
 * pinning her voice can never be defeated by whichever one was synthesized
 * first winning the cache.
 */
export function ttsHash(text: string, voice?: string): string {
  const key = azureConfigured()
    ? `azure|${voice || pickVoice(text)}|${text}`
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
  username: string,
  /**
   * Pin the voice instead of hashing the text for one. Pass sandraVoice() for
   * anything the tutor says; leave it off for library content, where rotation
   * is the feature.
   */
  voice?: string
): Promise<Buffer | null> {
  const clean = text.trim().slice(0, 1600);
  if (!clean) return null;

  const db = getDb();
  const hash = ttsHash(clean, voice);
  const [cached] = await db
    .select({ audioB64: ttsAudio.audioB64, audioKey: ttsAudio.audioKey })
    .from(ttsAudio)
    .where(eq(ttsAudio.hash, hash))
    .limit(1);
  if (cached?.audioKey) {
    const fromBlob = await getAudio(cached.audioKey);
    if (fromBlob) return fromBlob;
    // Object missing but row present: fall through and re-synthesize rather
    // than serving silence.
  } else if (cached?.audioB64) {
    return Buffer.from(cached.audioB64, "base64");
  }

  let buf: Buffer | null = null;
  let voiceUsed = "";
  if (azureConfigured()) {
    voiceUsed = voice || pickVoice(clean);
    buf = await azureSynthesizeSsml(ssmlFor(clean, voiceUsed), username);
  }
  if (!buf) {
    voiceUsed = `openai:${openaiVoice()}`;
    buf = await openaiSynthesize(clean, username);
  }
  if (!buf) return null;

  // Upload first: a row pointing at an object that does not exist is worse
  // than a row with inline bytes, so the key is only stored once the PUT won.
  const key = await putAudio(audioKey("tts", hash), buf);

  await db
    .insert(ttsAudio)
    .values({
      hash,
      text: clean,
      voice: voiceUsed,
      // R2 when configured, inline base64 when not — one row either way.
      audioB64: key ? null : buf.toString("base64"),
      audioKey: key,
      bytes: buf.length,
    })
    .onConflictDoNothing({ target: ttsAudio.hash });
  return buf;
}
