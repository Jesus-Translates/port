"use server";

import { eq } from "drizzle-orm";
import { gradeDitadoText, type DitadoResult } from "@/lib/ditado";
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
