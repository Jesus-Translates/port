import { SignJWT, jwtVerify } from "jose";
import { pickVoice, ssmlSegments } from "@/lib/tts";

/**
 * Listen & Speak — Pimsleur-style hands-free sessions built from the learner's
 * due FSRS cards: English prompt → silence long enough to answer out loud →
 * the European Portuguese answer.
 *
 * The audio is consumed by podcast apps, which never send our session cookie,
 * so the feed and audio URLs carry a signed token instead (see lsToken).
 */

/** ~6 minutes of audio at this cap — comfortably inside Azure's 10-min limit. */
export const LS_MAX_CARDS = 20;

/** Azure's English voice for the prompt half of each pair. */
const EN_VOICE = "en-US-JennyNeural";

const INTRO = "Vamos rever. Ouve, responde em voz alta, e confirma.";

type Segment = {
  text: string;
  voice: string;
  rate?: string;
  breakAfterMs?: number;
};

/**
 * One SSML document for a whole session. Pauses do the teaching: 4.5s after the
 * English prompt (say it aloud), 1.5s after the Portuguese answer (repeat it).
 */
export function buildSessionSsml(
  cards: { front: string; back: string }[]
): { ssml: string; chars: number } {
  const usable = cards
    .map((c) => ({ front: c.front?.trim() ?? "", back: c.back?.trim() ?? "" }))
    .filter((c) => c.front && c.back)
    .slice(0, LS_MAX_CARDS);

  const segments: Segment[] = [
    { text: INTRO, voice: pickVoice(INTRO), breakAfterMs: 1000 },
  ];
  for (const card of usable) {
    segments.push({
      text: card.front,
      voice: EN_VOICE,
      rate: "1.0",
      breakAfterMs: 4500,
    });
    segments.push({
      text: card.back,
      voice: pickVoice(card.back),
      rate: "0.9",
      breakAfterMs: 1500,
    });
  }

  return {
    ssml: ssmlSegments(segments),
    // Azure bills per spoken character; markup and pauses don't count.
    chars: segments.reduce((n, s) => n + s.text.length, 0),
  };
}

const LS_AUDIENCE = "ls-feed";
const LS_DAYS = 90;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/**
 * Bearer-in-the-URL for podcast clients. Scoped by audience so it can never be
 * mistaken for (or used as) a login session, and it expires after 90 days.
 */
export async function lsToken(username: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setAudience(LS_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${LS_DAYS}d`)
    .sign(getSecret());
}

/** Returns the username the token belongs to, or null when it doesn't verify. */
export async function verifyLsToken(
  token: string | null | undefined
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      audience: LS_AUDIENCE,
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
