/**
 * The shapes the placement test is made of.
 *
 * Separated from both the bank and the marking so the content file can import
 * them without importing the grader, and the grader can import the content
 * without a cycle.
 */

export const LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type Level = (typeof LEVELS)[number];

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
      /** Plausible decoy words mixed into the tiles. */
      extras?: string[];
    };

