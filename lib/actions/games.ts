"use server";

import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { addMistakeCard } from "@/lib/srs";

/**
 * Close a finished game round: what the learner missed becomes review cards,
 * and the round itself becomes XP on the family board.
 *
 * `score`/`total` mean whatever the game measures — pares reports points out
 * of 100 (the clock and the wrong taps both count), frase reports sentences
 * built right first time out of the round length. Only the ratio is used for
 * XP, so both scales behave the same on the way in.
 */
export async function finishGame(
  game: "pares" | "frase",
  score: number,
  total: number,
  misses: { prompt: string; answer: string; tip?: string | null }[]
): Promise<void> {
  const session = await requireSession();

  const safeTotal = Math.min(200, Math.max(1, Math.round(total) || 1));
  const safeScore = Math.min(safeTotal, Math.max(0, Math.round(score) || 0));

  // A miss is the highest-signal card we can make: the English side is the
  // prompt, the Portuguese the answer — same direction as the rest of the deck.
  for (const m of (misses ?? []).slice(0, 10)) {
    const prompt = (m?.prompt ?? "").trim();
    const answer = (m?.answer ?? "").trim();
    if (!prompt || !answer) continue;
    await addMistakeCard(
      session.username,
      game === "frase" ? `Frase: “${prompt}”` : prompt,
      answer,
      m.tip?.trim() || null
    );
  }

  const summary =
    game === "frase"
      ? `Constrói a frase: ${safeScore}/${safeTotal} frases`
      : `Jogo dos pares: ${safeScore}/${safeTotal} pontos`;

  await logActivity(
    session.username,
    "jogo",
    summary,
    Math.max(4, Math.round((safeScore / safeTotal) * 12))
  );
}
