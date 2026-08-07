import { normalizeWord } from "@/lib/ditado";

/**
 * Pronunciation scoring from ASR output: exact word matches count fully,
 * near-misses (small edit distance — right shape, wrong sound) count half.
 * It's an estimate built on what the recogniser heard — good enough to track
 * progress, not a phoneme-level lab measurement.
 */

export type PronWord = {
  word: string; // target word, original spelling
  status: "ok" | "close" | "missed";
  heard?: string; // what the recogniser got, for close/missed
};

export type PronResult = {
  score: number; // 0-100
  words: PronWord[];
  heardText: string;
};

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

export function scorePronunciation(
  targetPt: string,
  transcript: string
): PronResult {
  const target = targetPt.split(/\s+/).filter(Boolean);
  const t = target.map(normalizeWord);
  const heard = transcript.split(/\s+/).filter(Boolean);
  const h = heard.map(normalizeWord);

  // Pass 1 — LCS for exact matches (keeps word order honest).
  const dp: number[][] = Array.from({ length: t.length + 1 }, () =>
    Array(h.length + 1).fill(0)
  );
  for (let i = t.length - 1; i >= 0; i--) {
    for (let j = h.length - 1; j >= 0; j--) {
      dp[i][j] =
        t[i] === h[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const status: PronWord[] = target.map((w) => ({ word: w, status: "missed" }));
  const usedHeard = new Set<number>();
  {
    let i = 0;
    let j = 0;
    while (i < t.length && j < h.length) {
      if (t[i] === h[j]) {
        status[i] = { word: target[i], status: "ok" };
        usedHeard.add(j);
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
  }

  // Pass 2 — near-miss credit: unmatched target vs unmatched heard, in order.
  const freeTargets = status
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.status === "missed");
  const freeHeard = h
    .map((w, j) => ({ w, j, orig: heard[j] }))
    .filter(({ j }) => !usedHeard.has(j));
  let cursor = 0;
  for (const { i } of freeTargets) {
    for (let k = cursor; k < freeHeard.length; k++) {
      const cand = freeHeard[k];
      const tol = Math.max(1, Math.floor(t[i].length / 3));
      if (
        t[i].length >= 3 &&
        cand.w.length >= 2 &&
        editDistance(t[i], cand.w) <= tol
      ) {
        status[i] = { word: target[i], status: "close", heard: cand.orig };
        cursor = k + 1;
        break;
      }
    }
  }

  const points = status.reduce(
    (sum, s) => sum + (s.status === "ok" ? 1 : s.status === "close" ? 0.5 : 0),
    0
  );
  const score =
    target.length === 0 ? 0 : Math.round((points / target.length) * 100);
  return { score, words: status, heardText: transcript };
}
