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

/**
 * A level's whole block. You answer all of them before anything is decided.
 */
export const BLOCK_SIZE = 7;

/** Correct answers needed in a block to be let through to the next level. */
export const PASS_MARK = 5;

/** The bar for a block of `n` questions, scaled if a level is short. */
export function passMarkFor(n: number): number {
  return Math.max(1, Math.ceil((n * PASS_MARK) / BLOCK_SIZE));
}

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
 * Damerau-Levenshtein: like Levenshtein, but a SWAP of two adjacent letters
 * costs one edit rather than two.
 *
 * That single difference is most of the point. "cozinah" for "cozinha" is the
 * commonest typo there is and plain Levenshtein scores it 2 — the same as a
 * genuinely different word — so any threshold loose enough to forgive it also
 * forgives real errors.
 */
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Letters and digits only, accents folded, lowercase. */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Folded, with the spaces taken out too — joins and splits stop mattering. */
function squash(s: string): string {
  return fold(s).replace(/ /g, "");
}

export type Mark = "certo" | "quase" | "errado";

/**
 * How wrong a typed answer is allowed to be and still count.
 *
 * A placement test is trying to find out what somebody KNOWS, and a dropped
 * accent or a transposed letter is not a gap in knowledge — it is a phone
 * keyboard. Failing those was placing real learners a level below themselves,
 * which is the single most discouraging thing this screen can do.
 *
 * So the tolerance scales with length: one character on a short answer, up to
 * four on a long sentence. Tight enough that a wrong verb form is still wrong
 * on a six-letter answer, loose enough that "portugues" for "português", or
 * "cozinah" for "cozinha", sails through.
 *
 * The distinction is kept, not discarded — "quase" still counts as correct,
 * but the learner is shown the exact spelling, and the result names how many
 * were near misses. Scored generously, reported honestly.
 */
function tolerance(len: number): number {
  return len >= 8 ? 2 : 1;
}

export function scoreTyped(target: string, attempt: string): Mark {
  const t = target.trim();
  const a = attempt.trim();
  if (!a) return "errado";
  if (t === a) return "certo";

  const ft = fold(t);
  const fa = fold(a);
  if (ft === fa) return "quase"; // accents and punctuation only

  /*
   * Word BOUNDARIES are formatting, not knowledge.
   *
   * "da me as chaves porfavor" for "Dá-me as chaves, por favor" has every
   * word, in the right order, with the clitic in the right place — the one
   * thing that sentence is testing. What is missing is a hyphen, a comma, an
   * accent and a space. Failing that outright says "you do not know this" to
   * somebody who plainly does, and on a placement test the punishment for
   * that is a whole level.
   *
   * So collapse the spaces and compare. This forgives joins and splits and
   * nothing else: letters still have to match, so "sabem" for "saibam" is
   * still wrong — which is the entire point of that B2 item. Marked "quase",
   * which counts as correct and shows them the exact spelling.
   */
  const st = squash(t);
  const sa = squash(a);
  if (st === sa) return "quase";

  /*
   * Word by word, NOT across the whole sentence.
   *
   * A sentence-wide budget lets a wrong word hide inside a long answer: at B2
   * "Duvido que eles sabem o caminho" sat two edits from "saibam", well inside
   * a budget scaled to a thirty-character sentence — so the test forgave
   * exactly the subjunctive error that question exists to catch. Per word, a
   * six-letter form gets one edit and no more.
   */
  const tw = ft.split(" ");
  const aw = fa.split(" ");
  if (tw.length !== aw.length) return "errado"; // a missing word is a real gap

  let slips = 0;
  for (let i = 0; i < tw.length; i++) {
    if (tw[i] === aw[i]) continue;
    if (editDistance(tw[i], aw[i]) > tolerance(tw[i].length)) return "errado";
    slips++;
  }
  // A few slips is a keyboard; every word slightly off is not knowing it.
  return slips <= Math.max(1, Math.ceil(tw.length / 4)) ? "quase" : "errado";
}

/**
 * Mark one answer.
 *
 * Choices are exact — you either tapped the right option or you did not, and
 * there is no such thing as a typo in a button. Everything typed goes through
 * scoreTyped().
 */
export function gradeItem(item: PlacementItem, given: string): Mark {
  const said = given.trim();
  if (!said) return "errado";

  switch (item.kind) {
    case "choice":
    case "gap":
      return said === item.answer ? "certo" : "errado";
    case "wordbank":
      // Tiles are tapped, not typed, so the only slip possible is word order.
      return fold(said) === fold(item.answer) ? "certo" : "errado";
    case "dictation":
      return scoreTyped(item.say, said);
    case "write": {
      let best: Mark = "errado";
      for (const target of [item.answer, ...(item.alsoOk ?? [])]) {
        const m = scoreTyped(target, said);
        if (m === "certo") return "certo";
        if (m === "quase") best = "quase";
      }
      return best;
    }
  }
}

/** A mark that counts toward passing the block. */
export function counts(mark: Mark): boolean {
  return mark === "certo" || mark === "quase";
}

/**
 * Where a run of blocks leaves the learner.
 *
 * The ladder is strict and stops early ON PURPOSE. Each level is a block of
 * its own questions; clear it and the next block opens, miss it and the test
 * ends there. Nobody is asked to guess at the conjuntivo after failing the
 * present tense — that is demoralising, it tells us nothing we did not already
 * know, and it is how a test ends up placing somebody by luck.
 *
 * The placement is the highest block actually CLEARED, and A1 when none was:
 * the floor is a starting point, not a failure.
 */
export function placeAt(blocksPassed: number): Level {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, blocksPassed - 1))] ?? "A1";
}
