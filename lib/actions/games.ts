"use server";

import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { addMistakeCards } from "@/lib/srs";
import { GAME_KINDS, KIND_META, type ItemKind } from "@/lib/course";

/**
 * Close a finished game round: what the learner missed becomes review cards,
 * and the round itself becomes XP on the family board.
 *
 * Every game reports ONE number — accuracy out of 100. It used to be whatever
 * each game happened to measure (pares in points out of 100, frase in
 * sentences out of six), which meant two results on the same board could not
 * be compared. XP keeps the ratio formula it always had, so history stays
 * comparable across the change.
 */
export async function finishGame(
  game: string,
  score100: number,
  misses: { prompt: string; answer: string; tip?: string | null }[]
): Promise<void> {
  const session = await requireSession();

  const kind = (GAME_KINDS as string[]).includes(game)
    ? (game as ItemKind)
    : null;
  if (!kind) return;

  const score = Math.min(100, Math.max(0, Math.round(score100) || 0));

  // A miss is the highest-signal card we can make: the English side is the
  // prompt, the Portuguese the answer — same direction as the rest of the deck.
  await addMistakeCards(
    session.username,
    (misses ?? []).slice(0, 10).map((m) => ({
      prompt: m?.prompt ?? "",
      correctedPt: m?.answer ?? "",
      tip: m?.tip ?? null,
    }))
  );

  await logActivity(
    session.username,
    "jogo",
    `${KIND_META[kind].label}: ${score}/100`,
    Math.max(4, Math.round((score / 100) * 12))
  );
}
