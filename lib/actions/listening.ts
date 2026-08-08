"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { activity, getDb, listeningClips } from "@/lib/db";

// Kept module-local: a "use server" file may only export async functions.
/** What one clip listened through is worth. */
const CLIP_XP = 6;

/** Everything this learner has ever earned. Reads the ledger — there is no
 *  running-total column and there shouldn't be one. Null when the count could
 *  not be read: showing "0 XP" to someone who just earned some reads as broken,
 *  and the card simply hides a total it doesn't have. */
async function sumXp(username: string): Promise<number | null> {
  try {
    const [row] = await getDb()
      .select({ total: sql<number>`coalesce(sum(${activity.xp}), 0)::int` })
      .from(activity)
      .where(eq(activity.username, username));
    return row?.total ?? 0;
  } catch {
    // A score board is never worth breaking the page for.
    return null;
  }
}

/**
 * Log a clip the learner says they've listened through, and hand back the XP
 * it was worth plus their new running total so the completion card can show
 * both without a second round trip.
 */
export async function finishListening(
  clipId: number
): Promise<{ xp: number; total: number | null }> {
  const session = await requireSession();
  if (!Number.isInteger(clipId)) {
    return { xp: 0, total: await sumXp(session.username) };
  }
  const [clip] = await getDb()
    .select({ title: listeningClips.title })
    .from(listeningClips)
    .where(eq(listeningClips.id, clipId))
    .limit(1);
  if (!clip) return { xp: 0, total: await sumXp(session.username) };

  await logActivity(
    session.username,
    "escutar",
    `Ouviu “${clip.title.slice(0, 60)}”`,
    CLIP_XP
  );
  revalidatePath("/escutar");
  return { xp: CLIP_XP, total: await sumXp(session.username) };
}

/**
 * The signed-in learner's running XP total. Takes no username on purpose:
 * every exported function here is a public endpoint, so the identity comes
 * from the session and never from the caller.
 */
export async function myTotalXp(): Promise<number | null> {
  const session = await requireSession();
  return sumXp(session.username);
}
