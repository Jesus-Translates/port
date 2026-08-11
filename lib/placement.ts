import { checkAnswer } from "@/lib/diff";
import { BANK } from "@/lib/placement-bank";
import { LEVELS, type Level, type PlacementItem } from "@/lib/placement-types";

export { BANK };
export { LEVELS };
export type { Level, PlacementItem };

/**
 * The placement test's question bank and its grading rules.
 *
 * This lives on the SERVER, and the client is handed a projection of each item
 * with the answer removed (see publicItem). The old test was a client constant,
 * which was fine while every question was multiple choice — the options give
 * the game away anyway. It stops being fine the moment a question asks you to
 * type what you heard: the answer would have been sitting in the JS bundle
 * next to the audio.
 *
 * Cheating a placement test only ever hurts the person doing it — the prize is
 * being put in the wrong level — but "the answers are in the page" is not a
 * property to design in on purpose.
 */

/** How many questions one run asks. */
export const RUN_LENGTH = 15;

/**
 * What the browser is allowed to know about a question.
 *
 * `choice` and `gap` must ship their options — that is the question. Everything
 * else ships the prompt and nothing else; `dictation` does not even ship the
 * sentence, only the id whose audio it can request.
 */
export type PublicItem = {
  id: string;
  level: Level;
  kind: PlacementItem["kind"];
  promptEn: string;
  promptPt?: string;
  options?: string[];
  /** Shuffled tiles for wordbank, including decoys. */
  tiles?: string[];
};

/** Deterministic shuffle from a seed, so a reload does not re-deal the tiles. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    const j = (h >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function publicItem(item: PlacementItem): PublicItem {
  const base = {
    id: item.id,
    level: item.level,
    kind: item.kind,
    promptEn: item.promptEn,
  };
  switch (item.kind) {
    case "choice":
      return { ...base, promptPt: item.promptPt, options: item.options };
    case "gap":
      return { ...base, promptPt: item.promptPt, options: item.options };
    case "wordbank": {
      const words = item.answer.split(/\s+/).filter(Boolean);
      return {
        ...base,
        tiles: seededShuffle([...words, ...(item.extras ?? [])], item.id),
      };
    }
    default:
      // dictation and write ship nothing but the instruction.
      return base;
  }
}

/**
 * Mark one answer.
 *
 * Typed answers go through checkAnswer(), which is accent-significant but
 * treats a pure accent slip as "quase". A placement test should not push
 * somebody down a level because they typed "esta" for "está" on a phone
 * keyboard, so "quase" counts as correct HERE — unlike in a drill, where the
 * accent is the thing being taught.
 */
export function gradeItem(item: PlacementItem, given: string): boolean {
  const said = given.trim();
  if (!said) return false;

  switch (item.kind) {
    case "choice":
    case "gap":
      return said === item.answer;
    case "wordbank":
      return (
        said.replace(/\s+/g, " ").toLowerCase() ===
        item.answer.replace(/\s+/g, " ").toLowerCase()
      );
    case "dictation": {
      const v = checkAnswer(item.say, said).verdict;
      return v === "certo" || v === "quase";
    }
    case "write": {
      for (const target of [item.answer, ...(item.alsoOk ?? [])]) {
        const v = checkAnswer(target, said).verdict;
        if (v === "certo" || v === "quase") return true;
      }
      return false;
    }
  }
}

/** Correct answers needed to actually claim a level. */
const PASS = 2;

/**
 * The highest level whose ladder the learner actually owns.
 *
 * You climb: a level counts only if at least half of what was ASKED there came
 * back right, and the climb stops at the first level not owned. Claiming a
 * level needs two thirds, not a coin flip — otherwise two lucky guesses at B2
 * place somebody at B2 having failed everything beneath it, which is how a
 * real tester once got told B2 means "conjuntivo com à-vontade" after missing
 * both subjunctive questions.
 *
 * Levels never asked break nothing: they are neither owned nor failed.
 */
export function verdict(
  scores: Record<Level, number>,
  askedPerLevel: Record<Level, number>
): Level {
  let best: Level = "A1";
  for (const level of LEVELS) {
    const n = askedPerLevel[level] ?? 0;
    if (n === 0) continue;
    const got = scores[level] ?? 0;
    if (got * 2 < n) break;
    if (got >= PASS && got * 3 >= n * 2) best = level;
  }
  return best;
}
