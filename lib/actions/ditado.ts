"use server";

import { eq } from "drizzle-orm";
import {
  gradeDitadoText,
  normalizeWord,
  type DitadoResult,
} from "@/lib/ditado";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, refEntries } from "@/lib/db";
import { addMistakeCard } from "@/lib/srs";

/** Grade one dictated sentence. The target text never went to the client —
 *  only the audio did — so this is where it's finally revealed. */
export async function gradeDitado(
  entryId: number,
  typed: string
): Promise<DitadoResult | null> {
  await requireSession();
  if (!Number.isInteger(entryId)) return null;
  const db = getDb();
  const [entry] = await db
    .select({ pt: refEntries.pt, en: refEntries.en })
    .from(refEntries)
    .where(eq(refEntries.id, entryId))
    .limit(1);
  if (!entry) return null;
  return gradeDitadoText(entry.pt, typed.slice(0, 1000));
}

export type ClozeResult = { correct: boolean; word: string };

/** Grade the one hidden word of an audio-cloze sentence. The client only ever
 *  held the masked sentence, so the answer is resolved from the row here. */
export async function gradeCloze(
  entryId: number,
  blankIndex: number,
  typed: string
): Promise<ClozeResult | null> {
  const session = await requireSession();
  if (!Number.isInteger(entryId) || !Number.isInteger(blankIndex)) return null;
  if (blankIndex < 0) return null;
  const db = getDb();
  const [entry] = await db
    .select({ pt: refEntries.pt })
    .from(refEntries)
    .where(eq(refEntries.id, entryId))
    .limit(1);
  if (!entry) return null;

  const tokens = entry.pt.split(/\s+/).filter(Boolean);
  const word = tokens[blankIndex];
  if (!word) return null;

  const target = normalizeWord(word);
  const correct = target.length > 0 && normalizeWord(typed.slice(0, 100)) === target;

  if (!correct) {
    // Three words either side is enough context to make the card answerable.
    const from = Math.max(0, blankIndex - 3);
    const context = tokens
      .slice(from, blankIndex + 4)
      .map((w, i) => (from + i === blankIndex ? "____" : w))
      .join(" ");
    await addMistakeCard(
      session.username,
      `Cloze: “…${context}…”`,
      word,
      null
    );
  }
  return { correct, word };
}

/** Log a finished cloze round — same activity kind and XP curve as a ditado. */
export async function finishCloze(score: number, total: number) {
  const session = await requireSession();
  await logActivity(
    session.username,
    "ditado",
    `Palavra escondida: ${score}/${total} certas`,
    Math.max(4, Math.round((score / Math.max(total, 1)) * 12))
  );
}

/** Log a finished round: XP + missed sentences become review cards. */
export async function finishDitado(
  score: number,
  total: number,
  missed: { pt: string; en: string }[]
) {
  const session = await requireSession();
  for (const m of missed.slice(0, 10)) {
    await addMistakeCard(session.username, `Ditado: “${m.en}”`, m.pt, null);
  }
  await logActivity(
    session.username,
    "ditado",
    `Ditado: ${score}/${total} palavras certas`,
    Math.max(4, Math.round((score / Math.max(total, 1)) * 12))
  );
}
