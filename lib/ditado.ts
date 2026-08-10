/** Word-level dictation grading — pure string work, no AI needed. */

export type DitadoWord = { word: string; ok: boolean };
export type DitadoResult = {
  targetPt: string;
  words: DitadoWord[];
  score: number; // matched target words
  total: number;
};

/** Lowercase, strip punctuation and accents — a learner who heard the word
 *  but skipped an accent still heard the word. */
export function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function words(s: string): string[] {
  return s.split(/\s+/).map(normalizeWord).filter(Boolean);
}

/** LCS alignment: which target words did the typed text contain, in order. */
export function gradeDitadoText(targetPt: string, typed: string): DitadoResult {
  const target = targetPt.split(/\s+/).filter(Boolean);
  const t = target.map(normalizeWord);
  const u = words(typed);

  const dp: number[][] = Array.from({ length: t.length + 1 }, () =>
    Array(u.length + 1).fill(0)
  );
  for (let i = t.length - 1; i >= 0; i--) {
    for (let j = u.length - 1; j >= 0; j--) {
      dp[i][j] =
        t[i] === u[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ok = Array(t.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < t.length && j < u.length) {
    if (t[i] === u[j]) {
      ok[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }

  const resultWords = target.map((word, k) => ({ word, ok: ok[k] }));
  const score = resultWords.filter((w) => w.ok).length;
  return { targetPt, words: resultWords, score, total: target.length };
}
