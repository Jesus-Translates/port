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
  publicItem,
  type Level,
  type Mark,
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
 * The next unasked question AT THIS LEVEL — never from another one.
 *
 * The test used to widen outwards when a level ran dry, which suited the old
 * adaptive format and is exactly wrong now. A block is a level's own set of
 * questions: borrowing a B1 item to pad out the A2 block would mean somebody
 * cleared A2 on a question A2 never asked.
 *
 * Returns null when the block is finished, which is how the client knows to
 * total it up and decide whether the next level opens.
 */
export async function nextPlacementItem(
  askedIds: string[],
  levelIdx: number
): Promise<PublicItem | null> {
  await requireSession();
  const asked = new Set(askedIds);
  const level = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, Math.round(levelIdx)))];

  const pool = BANK.filter((i) => i.level === level && !asked.has(i.id));
  if (pool.length === 0) return null;
  // A route handler, not a render — plain randomness is fine here.
  return publicItem(pool[Math.floor(Math.random() * pool.length)]);
}

/** How many questions each level's block holds, for the progress display. */
export async function placementBlockSizes(): Promise<Record<string, number>> {
  await requireSession();
  const out: Record<string, number> = {};
  for (const l of LEVELS) out[l] = BANK.filter((i) => i.level === l).length;
  return out;
}

export type PlacementMark = {
  /** certo | quase | errado — "quase" counts, but is shown as a near miss. */
  mark: Mark;
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

  const mark = gradeItem(item, String(given ?? "").slice(0, 400));
  return { mark, correct: counts(mark), level: item.level, correctAnswer };
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
