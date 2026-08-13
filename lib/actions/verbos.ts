"use server";

import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { addMistakeCards } from "@/lib/srs";

/** Log a finished conjugation round; misses become review cards. */
export async function finishVerbRound(
  score: number,
  total: number,
  misses: { prompt: string; answer: string }[]
) {
  const session = await requireSession();
  await addMistakeCards(
    session.username,
    misses.slice(0, 10).map((m) => ({ prompt: m.prompt, correctedPt: m.answer }))
  );
  await logActivity(
    session.username,
    "verbos",
    `Verbos: ${score}/${total}`,
    Math.max(4, Math.round((score / Math.max(total, 1)) * 12))
  );
}
