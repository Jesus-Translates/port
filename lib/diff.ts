import { normalizeWord } from "@/lib/ditado";

/**
 * Word-level answer checking — pure string work, no AI.
 *
 * Telling a learner "the right answer was X" hides the one thing they need:
 * WHICH word went wrong, and whether it was a slip or a real mistake. This
 * aligns what they wrote against the target the same way lib/ditado and
 * lib/pronunciation do (LCS over accent-folded words), so a single dropped or
 * inserted word stays a single mark instead of cascading into "everything
 * after this point is wrong".
 */

export type DiffTok = {
  text: string;
  status: "same" | "wrong" | "missing" | "extra";
};

export type AnswerCheck = {
  /**
   * certo      — right, down to the accents.
   * quase      — the same words; only accents/capitals slipped (a typo, not an error).
   * incompleto — everything written is right, but words are missing.
   * errado     — at least one word is actually wrong (or nothing was written).
   */
  verdict: "certo" | "quase" | "incompleto" | "errado";
  /** What the learner wrote, marked up. */
  attempt: DiffTok[];
  /** The correct answer, marked up. */
  target: DiffTok[];
};

/** Whitespace split — punctuation stays glued to its word. */
function tokenize(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/**
 * normalizeWord's twin: same "letters and digits only" idea, but accents and
 * case survive. The gap between the two is exactly what makes a "quase".
 */
function tight(w: string): string {
  return w.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "");
}

/** LCS over normalised words → the matched (target, attempt) index pairs. */
function lcsPairs(t: string[], a: string[]): [number, number][] {
  // dp[i][j] = length of the longest common subsequence of t[i..] and a[j..].
  const dp: number[][] = Array.from({ length: t.length + 1 }, () =>
    Array(a.length + 1).fill(0)
  );
  for (let i = t.length - 1; i >= 0; i--) {
    for (let j = a.length - 1; j >= 0; j--) {
      dp[i][j] =
        t[i] === a[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < t.length && j < a.length) {
    if (t[i] === a[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * A model's sentence, with markup it should never have emitted removed.
 *
 * The grading prompt once TOLD the model that corrections are "shown struck
 * through in red" — so it began helpfully producing that itself, and learners
 * saw `<span style="color:red"><s>O</s></span> **No** domingo passado` sitting
 * in the middle of their corrected sentence. The prompt no longer describes
 * the rendering, but stored feedback still carries the markup, and a model can
 * always misbehave again.
 *
 * So this strips it at the point of use, which fixes what is already written
 * as well as anything new. It matters beyond looks: the raw tags were tokenised
 * as words by the diff, and handed to the speech button to read aloud.
 */
export function plainPt(text: string): string {
  return (
    text
      /*
       * Struck-through text is a DELETION, so drop the words with the tag.
       *
       * The model emitted both halves of its own diff — "<s>O</s> **No**" —
       * meaning "replace O with No". Stripping tags but keeping their content
       * leaves "O No domingo … Torres vedras Vedras": every wrong word still
       * sitting beside its correction. Removing the struck words rebuilds the
       * sentence the learner was actually meant to read.
       */
      .replace(/<s\b[^>]*>[\s\S]*?<\/s>/gi, "")
      .replace(/<del\b[^>]*>[\s\S]*?<\/del>/gi, "")
      .replace(/~~[\s\S]*?~~/g, "")
      // Everything else: keep the words, lose the markup.
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/[*_`]/g, "")
      // Tidy the gaps the removals left, including before punctuation.
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim()
  );
}

export function checkAnswer(target: string, attempt: string): AnswerCheck {
  target = plainPt(target);
  attempt = plainPt(attempt);
  const tRaw = tokenize(target);
  const aRaw = tokenize(attempt);
  const t = tRaw.map(normalizeWord);
  const a = aRaw.map(normalizeWord);

  const pairs = lcsPairs(t, a);

  // Anything the LCS didn't anchor is provisionally a drop (target side) or an
  // insertion (attempt side); the gap pass below promotes pairs of them to
  // substitutions.
  const tStatus: DiffTok["status"][] = Array(tRaw.length).fill("missing");
  const aStatus: DiffTok["status"][] = Array(aRaw.length).fill("extra");
  for (const [ti, ai] of pairs) {
    tStatus[ti] = "same";
    aStatus[ai] = "same";
  }

  // Walk the gaps between anchors. Inside one gap, pair leftover target words
  // with leftover attempt words in order — those are swaps ("wrong" on both
  // sides). Whatever is left over stays missing / extra. Because the anchors
  // hold, a gap can never spill past the next matched word.
  let pt = 0;
  let pa = 0;
  for (const [ti, ai] of [...pairs, [tRaw.length, aRaw.length] as [number, number]]) {
    const swaps = Math.min(ti - pt, ai - pa);
    for (let k = 0; k < swaps; k++) {
      tStatus[pt + k] = "wrong";
      aStatus[pa + k] = "wrong";
    }
    pt = ti + 1;
    pa = ai + 1;
  }

  const same = pairs.length;
  const wrong = tStatus.filter((s) => s === "wrong").length;
  const missing = tStatus.filter((s) => s === "missing").length;
  const extra = aStatus.filter((s) => s === "extra").length;

  let verdict: AnswerCheck["verdict"];
  if (wrong === 0 && missing === 0 && extra === 0) {
    // Same words in the same order: only the writing can still differ.
    const identical = tRaw.every((w, k) => tight(w) === tight(aRaw[k]));
    verdict = identical ? "certo" : "quase";
  } else if (wrong === 0 && extra === 0 && same > 0) {
    // Nothing wrong, nothing spare — they just stopped early or skipped a word.
    verdict = "incompleto";
  } else {
    verdict = "errado";
  }

  return {
    verdict,
    attempt: aRaw.map((text, k) => ({ text, status: aStatus[k] })),
    target: tRaw.map((text, k) => ({ text, status: tStatus[k] })),
  };
}

/**
 * Which matched words the learner still mis-wrote — right word, wrong accent
 * or capital. They stay "same" (they got the word), so the UI marks them
 * softly instead of calling them errors.
 *
 * The nth "same" token of `attempt` is the nth "same" token of `target` by
 * construction, so zipping the two is a safe alignment.
 */
export function spellingSlips(check: AnswerCheck): {
  attempt: Set<number>;
  target: Set<number>;
} {
  const a = check.attempt
    .map((tok, i) => ({ tok, i }))
    .filter(({ tok }) => tok.status === "same");
  const t = check.target
    .map((tok, i) => ({ tok, i }))
    .filter(({ tok }) => tok.status === "same");
  const attempt = new Set<number>();
  const target = new Set<number>();
  for (let k = 0; k < Math.min(a.length, t.length); k++) {
    if (tight(a[k].tok.text) !== tight(t[k].tok.text)) {
      attempt.add(a[k].i);
      target.add(t[k].i);
    }
  }
  return { attempt, target };
}
