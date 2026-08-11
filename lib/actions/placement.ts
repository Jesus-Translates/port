"use server";

import { requireSession } from "@/lib/auth";
import {
  BANK,
  gradeItem,
  LEVELS,
  publicItem,
  type Level,
  type PublicItem,
} from "@/lib/placement";

/**
 * Serving and marking the placement test.
 *
 * Both halves are here because both need the answers, and the answers must not
 * reach the browser. The client tracks which ids it has been asked and how it
 * is doing; the server decides what to send next and whether each reply was
 * right.
 */

/** Look an item up by the id the client echoes back. */
function byId(id: string) {
  return BANK.find((i) => i.id === id) ?? null;
}

/**
 * The next question, preferring `levelIdx` and widening outwards.
 *
 * Widening rather than failing matters: a bank can run dry at one level
 * mid-run, and ending the test early because A2 had no items left would score
 * somebody on nine questions instead of fifteen.
 */
export async function nextPlacementItem(
  askedIds: string[],
  levelIdx: number
): Promise<PublicItem | null> {
  await requireSession();
  const asked = new Set(askedIds);
  const target = Math.max(0, Math.min(LEVELS.length - 1, Math.round(levelIdx)));

  const order = LEVELS.map((_, i) => i).sort(
    (a, b) => Math.abs(a - target) - Math.abs(b - target)
  );
  for (const idx of order) {
    const pool = BANK.filter(
      (i) => i.level === LEVELS[idx] && !asked.has(i.id)
    );
    if (pool.length > 0) {
      // A route handler, not a render — plain randomness is fine here.
      return publicItem(pool[Math.floor(Math.random() * pool.length)]);
    }
  }
  return null;
}

export type PlacementMark = {
  correct: boolean;
  level: Level;
  /** Shown after answering, so a wrong answer teaches something. */
  correctAnswer: string;
};

export async function gradePlacement(
  id: string,
  given: string
): Promise<PlacementMark | null> {
  await requireSession();
  const item = byId(id);
  if (!item) return null;

  const correctAnswer =
    item.kind === "dictation"
      ? item.say
      : item.kind === "write" || item.kind === "wordbank"
        ? item.answer
        : item.answer;

  return {
    correct: gradeItem(item, String(given ?? "").slice(0, 400)),
    level: item.level,
    correctAnswer,
  };
}
