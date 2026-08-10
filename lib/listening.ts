/**
 * Escutar — the listening library's shared shapes and timing alignment.
 *
 * A clip stores its script AND when every line (and, where we can tell, every
 * word) is spoken, so the transcript can follow the audio and a tap on a line
 * can seek to it. Timings come from Whisper word timestamps aligned back onto
 * the script we already have — Whisper's own text is thrown away, because the
 * script is authoritative and Whisper's spelling is not.
 *
 * Alignment is best-effort by design: it NEVER throws. A line we can't place
 * word-by-word keeps line-level timing (`words: null`) and the player simply
 * highlights the whole line.
 */

export type ListeningWord = {
  /** The original token, punctuation included — render these, not `text`. */
  w: string;
  start: number; // seconds
  end: number; // seconds
};

export type ListeningLine = {
  speaker: string; // short pt name, e.g. "Ana"
  text: string; // pt-PT
  translation: string; // English
  start: number; // seconds
  end: number; // seconds
  /** Per-word timings when alignment worked; null = line-level only. */
  words: ListeningWord[] | null;
};

/** The shape stored in `listening_clips.transcript`. */
export type ListeningTranscript = {
  lines: ListeningLine[];
  duration: number; // seconds; 0 when unknown
};

/** A line before it has any timing — what the model writes, what we re-align. */
export type ScriptLine = {
  speaker: string;
  text: string;
  translation: string;
};

export type WhisperWord = { word: string; start: number; end: number };

/** How far ahead of the cursor a script word may look for its match. Small on
 *  purpose: a wide window lets a common word ("e", "a", "não") latch onto a
 *  much later occurrence and drag the rest of the line with it. */
const LOOKAHEAD = 8;

/** Nominal seconds given to a word Whisper never heard, when extending a line's
 *  edges past its first/last matched word. */
const UNMATCHED_SECONDS = 0.22;

/** Below this share of matched words, per-word timings are noise — drop them. */
const MIN_COVERAGE = 0.5;

/** Lowercase, strip accents and punctuation — "Não," and "nao" are one word. */
export function normalizeToken(w: string): string {
  return w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

/** Same word, one character out — Whisper drops the odd final -s or -m. */
function near(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 3) return false;
  return editDistance(a, b) <= 1;
}

type Tok = { orig: string; norm: string };

function tokenize(text: string): Tok[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((orig) => ({ orig, norm: normalizeToken(orig) }));
}

/** Container-aware filename extension — the transcriber rejects a mislabelled
 *  file, and phones record whatever they feel like (iOS mp4, Chrome webm). */
export function audioExtension(mime: string): string {
  const t = (mime || "").toLowerCase();
  if (t.includes("mp4") || t.includes("m4a")) return "mp4";
  if (t.includes("mpeg") || t.includes("mp3")) return "mp3";
  if (t.includes("ogg")) return "ogg";
  if (t.includes("wav")) return "wav";
  return "webm";
}

/**
 * Whisper word timestamps for one audio file.
 * `gpt-4o-mini-transcribe` does not return usable word timings — whisper-1 with
 * verbose_json + word granularity does. Returns null on any failure; callers
 * fall back to estimated line timings rather than losing the clip.
 */
export async function transcribeWordTimings(
  // Uint8Array<ArrayBuffer> (not the SharedArrayBuffer-permitting default) is
  // what BlobPart accepts — a Buffer needs `new Uint8Array(buf)` at the call.
  bytes: Uint8Array<ArrayBuffer>,
  filename: string,
  mime: string
): Promise<{ words: WhisperWord[]; duration: number } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.startsWith("sk-")) return null;
  try {
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mime }), filename);
    form.append("model", "whisper-1");
    form.append("language", "pt");
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "word");
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      duration?: number;
      words?: { word?: string; start?: number; end?: number }[];
    };
    const words: WhisperWord[] = (data.words ?? [])
      .map((w) => ({
        word: String(w.word ?? ""),
        start: Number(w.start),
        end: Number(w.end),
      }))
      .filter(
        (w) =>
          w.word.length > 0 &&
          Number.isFinite(w.start) &&
          Number.isFinite(w.end) &&
          w.end >= w.start
      );
    const duration = Number(data.duration);
    return { words, duration: Number.isFinite(duration) ? duration : 0 };
  } catch {
    return null;
  }
}

/** Even, length-weighted spacing — used when Whisper gave us nothing at all. */
function estimateLines(script: ScriptLine[], duration: number): ListeningLine[] {
  const weights = script.map(
    (l) => Math.max(1, tokenize(l.text).length) * 0.42 + 0.35
  );
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const scale = duration > 0 ? duration / total : 1;
  let t = 0;
  return script.map((l, i) => {
    const start = t;
    t += weights[i] * scale;
    return {
      speaker: l.speaker,
      text: l.text,
      translation: l.translation,
      start: round3(start),
      end: round3(t),
      words: null,
    };
  });
}

type Span = { start: number; end: number };

/** Give every token a time: matched ones keep theirs, runs of unmatched tokens
 *  split the gap between their neighbours evenly. */
function fillWords(
  toks: Tok[],
  times: (Span | null)[],
  lineStart: number,
  lineEnd: number
): ListeningWord[] {
  const resolved: Span[] = new Array(toks.length);
  let i = 0;
  while (i < toks.length) {
    const known = times[i];
    if (known) {
      resolved[i] = known;
      i++;
      continue;
    }
    let j = i;
    while (j < toks.length && !times[j]) j++;
    const before = i > 0 ? times[i - 1] : null;
    const after = j < toks.length ? times[j] : null;
    const a = before ? before.end : lineStart;
    const b = after ? after.start : lineEnd;
    const step = Math.max(0, b - a) / (j - i);
    for (let k = i; k < j; k++) {
      resolved[k] = { start: a + step * (k - i), end: a + step * (k - i + 1) };
    }
    i = j;
  }
  return toks.map((t, k) => ({
    w: t.orig,
    start: round3(resolved[k].start),
    end: round3(Math.max(resolved[k].start, resolved[k].end)),
  }));
}

const UNPLACED = -1;

function align(
  script: ScriptLine[],
  whisper: WhisperWord[],
  duration: number
): ListeningLine[] {
  const heard = whisper
    .map((x) => ({
      start: x.start,
      end: x.end,
      norm: normalizeToken(x.word),
    }))
    .filter((x) => x.norm.length > 0);
  if (heard.length === 0) return estimateLines(script, duration);

  const lines: ListeningLine[] = [];
  // Sequential consumption: the script and the audio say the same things in the
  // same order, so the cursor only ever moves forward.
  let cursor = 0;
  let lastEnd = 0;

  for (const l of script) {
    const toks = tokenize(l.text);
    const times: (Span | null)[] = toks.map(() => null);
    let local = cursor;
    let matched = 0;
    let matchable = 0;

    for (let i = 0; i < toks.length; i++) {
      if (!toks[i].norm) continue; // pure punctuation consumes nothing
      matchable++;
      const limit = Math.min(heard.length, local + LOOKAHEAD);
      let hit = -1;
      for (let k = local; k < limit; k++) {
        if (heard[k].norm === toks[i].norm) {
          hit = k;
          break;
        }
      }
      if (hit < 0) {
        for (let k = local; k < limit; k++) {
          if (near(toks[i].norm, heard[k].norm)) {
            hit = k;
            break;
          }
        }
      }
      if (hit >= 0) {
        times[i] = { start: heard[hit].start, end: heard[hit].end };
        local = hit + 1;
        matched++;
      }
    }

    const anchors: number[] = [];
    for (let i = 0; i < times.length; i++) if (times[i]) anchors.push(i);

    if (anchors.length === 0) {
      // Nothing recognised in this line. Leave the cursor where it is so the
      // next line can still find its own words, and slot this line in later.
      lines.push({
        speaker: l.speaker,
        text: l.text,
        translation: l.translation,
        start: UNPLACED,
        end: UNPLACED,
        words: null,
      });
      continue;
    }

    const first = times[anchors[0]] as Span;
    const last = times[anchors[anchors.length - 1]] as Span;
    const lead = anchors[0];
    const trail = toks.length - 1 - anchors[anchors.length - 1];

    let start = Math.max(0, first.start - lead * UNMATCHED_SECONDS);
    start = Math.max(start, Math.min(lastEnd, first.start));
    let end = last.end + trail * UNMATCHED_SECONDS;
    if (duration > 0) end = Math.min(end, duration);
    end = Math.max(end, start);

    const coverage = matchable === 0 ? 0 : matched / matchable;
    lines.push({
      speaker: l.speaker,
      text: l.text,
      translation: l.translation,
      start: round3(start),
      end: round3(end),
      words:
        coverage >= MIN_COVERAGE ? fillWords(toks, times, start, end) : null,
    });
    cursor = local;
    lastEnd = end;
  }

  // Second pass: give the unrecognised lines the gap between their neighbours,
  // split by length. Every line ends up seekable, even if only approximately.
  let i = 0;
  while (i < lines.length) {
    if (lines[i].start !== UNPLACED) {
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && lines[j].start === UNPLACED) j++;
    const a = i > 0 ? lines[i - 1].end : 0;
    const b =
      j < lines.length
        ? lines[j].start
        : duration > 0
          ? Math.max(duration, a)
          : a + 2 * (j - i);
    const weights: number[] = [];
    for (let k = i; k < j; k++) {
      weights.push(Math.max(1, tokenize(lines[k].text).length));
    }
    const total = weights.reduce((x, y) => x + y, 0) || 1;
    const span = Math.max(0, b - a);
    let t = a;
    for (let k = i; k < j; k++) {
      const d = (span * weights[k - i]) / total;
      lines[k].start = round3(t);
      lines[k].end = round3(t + d);
      t += d;
    }
    i = j;
  }

  return lines;
}

/**
 * Timings for a script from Whisper words. Never throws: any surprise in the
 * transcriber's output degrades to estimated line timings, not a broken clip.
 */
export function alignTranscript(
  script: ScriptLine[],
  whisper: WhisperWord[],
  duration: number
): ListeningTranscript {
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? round3(duration) : 0;
  let lines: ListeningLine[];
  try {
    lines = align(script, whisper, safeDuration);
  } catch {
    lines = estimateLines(script, safeDuration);
  }
  return {
    lines,
    duration: safeDuration || round3(lines[lines.length - 1]?.end ?? 0),
  };
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Read `listening_clips.transcript` (jsonb, therefore `unknown`) defensively. */
export function parseTranscript(raw: unknown): ListeningTranscript {
  const obj = (raw ?? {}) as { lines?: unknown; duration?: unknown };
  const rows = Array.isArray(obj.lines) ? obj.lines : [];
  const lines: ListeningLine[] = rows.map((r) => {
    const l = (r ?? {}) as Record<string, unknown>;
    const rawWords = Array.isArray(l.words) ? l.words : null;
    return {
      speaker: String(l.speaker ?? ""),
      text: String(l.text ?? ""),
      translation: String(l.translation ?? ""),
      start: num(l.start),
      end: num(l.end),
      words: rawWords
        ? rawWords.map((x) => {
            const w = (x ?? {}) as Record<string, unknown>;
            return {
              w: String(w.w ?? ""),
              start: num(w.start),
              end: num(w.end),
            };
          })
        : null,
    };
  });
  const duration = num(obj.duration);
  return {
    lines,
    duration: duration > 0 ? duration : (lines[lines.length - 1]?.end ?? 0),
  };
}
