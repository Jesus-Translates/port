"use server";

import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import {
  readPlacement,
  type PlacementRecord,
} from "@/lib/placement-record";
import {
  BANK,
  counts,
  gradeItem,
  LEVELS,
  passMarkFor,
  publicItem,
  type Level,
  type PlacementItem,
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

/**
 * Easiest kind first, hardest last — a block opens gently and climbs.
 *
 * The bank order used to be shuffled, so a true beginner's FIRST question
 * could be a dictation: hear a Portuguese sentence and type it back. That is
 * the hardest thing the test asks and a brutal opening move for someone who
 * has just told us they are starting — they conclude the app is not for them
 * before question two.
 *
 * The ranking is by how much PRODUCTION each kind demands. Recognising the
 * right option is easiest; assembling given words needs word order but no
 * spelling; writing from scratch needs both; dictation needs all of that plus
 * decoding speech in a language you are still learning to hear.
 */
const KIND_ORDER: Record<PlacementItem["kind"], number> = {
  choice: 0,
  gap: 1,
  wordbank: 2,
  write: 3,
  dictation: 4,
};

function levelAt(levelIdx: number): Level {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, Math.round(levelIdx)))];
}

/**
 * A whole level's block at once, answers stripped.
 *
 * It used to hand out one question at a time, which made going back
 * impossible: the previous question was gone from the client and the server
 * kept no run state to rebuild it from. A block is a fixed set of a level's own
 * questions, so sending all of them costs nothing extra and lets the learner
 * move around inside the section — reread, change an answer, come back to the
 * one they skipped — exactly like a real exam paper.
 *
 * publicItem() still strips every answer, and dictation still ships only the
 * id whose audio it can request. Nothing gradeable crosses.
 */
export async function placementBlock(levelIdx: number): Promise<PublicItem[]> {
  await requireSession();
  const level = levelAt(levelIdx);
  return BANK.filter((i) => i.level === level)
    .slice()
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
    .map(publicItem);
}

export type BlockResult = {
  right: number;
  of: number;
  passed: boolean;
  /** Answers that counted but had spelling slips — reported, never punished. */
  nearMisses: number;
  /** What they got wrong, for the end-of-run summary. Ids, not answers. */
  misses: { id: string; given: string }[];
};

/**
 * Mark a whole block, once, when the learner submits it.
 *
 * Per-question grading is gone. It leaked a result for every answer (the
 * client could read whether each one landed as it was given), and it made the
 * tally a running client-side total that back-navigation would have had to
 * unpick. One call at the end of a section is simpler AND tells the browser
 * less: a single count, decided here.
 *
 * Every item in the level is marked, so an unanswered question is a wrong one
 * — leaving one blank cannot be cheaper than guessing.
 */
export async function gradeBlock(
  levelIdx: number,
  answers: Record<string, string>
): Promise<BlockResult> {
  await requireSession();
  const level = levelAt(levelIdx);
  const items = BANK.filter((i) => i.level === level);

  let right = 0;
  let nearMisses = 0;
  const misses: { id: string; given: string }[] = [];

  for (const item of items) {
    const given = String(answers?.[item.id] ?? "").slice(0, 400);
    const mark = gradeItem(item, given);
    if (counts(mark)) {
      right += 1;
      if (mark === "quase") nearMisses += 1;
    } else {
      misses.push({ id: item.id, given });
    }
  }

  return {
    right,
    of: items.length,
    passed: right >= passMarkFor(items.length),
    nearMisses,
    misses,
  };
}

/* ── What we keep afterwards ─────────────────────────────────────────── */

/** Read this learner's stored placement summary and plan. */
export async function getPlacementRecord(): Promise<PlacementRecord> {
  const session = await requireSession();
  try {
    const [row] = await getDb()
      .select({ placement: users.placement })
      .from(users)
      .where(eq(users.username, session.username))
      .limit(1);
    return readPlacement(row?.placement);
  } catch {
    return {};
  }
}

/** Merge a patch into the stored record without losing the other half. */
export async function savePlacementRecord(
  patch: PlacementRecord
): Promise<void> {
  const session = await requireSession();
  try {
    const current = await getPlacementRecord();
    await getDb()
      .update(users)
      .set({ placement: { ...current, ...patch } })
      .where(eq(users.username, session.username));
  } catch {
    // A lost summary must never cost somebody their placement.
  }
}
