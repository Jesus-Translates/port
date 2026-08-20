/**
 * The shapes the placement test is made of.
 *
 * Separated from both the bank and the marking so the content file can import
 * them without importing the grader, and the grader can import the content
 * without a cycle.
 */

export const LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type Level = (typeof LEVELS)[number];

/*
 * Client-safe placement constants live HERE, not in lib/placement.ts.
 *
 * lib/placement.ts imports and re-exports BANK (every question WITH its
 * answer). A client component importing a value from it keeps the bank out of
 * the browser bundle only by tree-shaking — and a placement test whose answers
 * ship in view-source is exactly what this module's header warns against. These
 * four carry no bank reference, so the quiz can import them safely.
 */

/** A level's whole block. You answer all of them before anything is decided. */
export const BLOCK_SIZE = 7;

/** Correct answers needed in a block to be let through to the next level. */
export const PASS_MARK = 5;

/** The bar for a block of `n` questions, scaled if a level is short. */
export function passMarkFor(n: number): number {
  return Math.max(1, Math.ceil((n * PASS_MARK) / BLOCK_SIZE));
}

/**
 * Where a run of blocks leaves the learner: the highest block CLEARED, A1 when
 * none was. The floor is a starting point, not a failure.
 */
export function placeAt(blocksPassed: number): Level {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, blocksPassed - 1))] ?? "A1";
}

export type PlacementItem =
  | {
      id: string;
      level: Level;
      kind: "choice";
      promptEn: string;
      promptPt?: string;
      options: string[];
      answer: string;
    }
  | {
      id: string;
      level: Level;
      kind: "gap";
      promptEn: string;
      /** Contains exactly one "___". */
      promptPt: string;
      options: string[];
      answer: string;
    }
  | {
      id: string;
      level: Level;
      kind: "dictation";
      promptEn: string;
      /** Spoken aloud; never sent to the client. */
      say: string;
    }
  | {
      id: string;
      level: Level;
      kind: "write";
      promptEn: string;
      answer: string;
      /** Other genuinely correct renderings. */
      alsoOk?: string[];
    }
  | {
      id: string;
      level: Level;
      kind: "wordbank";
      promptEn: string;
      answer: string;
      /**
       * Other orderings that are equally correct.
       *
       * A word bank has exactly one set of tiles but often more than one right
       * sentence — Portuguese drops subject pronouns freely, and a subordinate
       * clause can lead or follow. Marking only one arrangement failed people
       * for writing better Portuguese than the target.
       */
      alsoOk?: string[];
      /** Plausible decoy words mixed into the tiles. */
      extras?: string[];
    };

