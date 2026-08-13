"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { getDb, userVerbs } from "@/lib/db";
import { logActivity } from "@/lib/data";
import { addMistakeCard } from "@/lib/srs";
import { visibleOwners } from "@/lib/tenant";
import { findVerb, regularVerb } from "@/lib/verb-filter";
import type { Verb } from "@/lib/verbs";

/**
 * The household's own verbs, on the shelf beside the curated ones.
 *
 * Conjugations are STORED, not regenerated on read. Two reasons: a saved verb
 * must read the same tomorrow even if the pattern rules change, and storing
 * them is what makes a hand-corrected irregular possible at all — regenerating
 * would overwrite the correction every time.
 */

export type SavedVerb = Verb & { id: number; source: string; addedBy: string };

export async function listMyVerbs(): Promise<SavedVerb[]> {
  await requireSession();
  try {
    const rows = await getDb()
      .select()
      .from(userVerbs)
      .where(inArray(userVerbs.addedBy, await visibleOwners()))
      .orderBy(asc(userVerbs.inf));
    return rows.map((r) => ({
      id: r.id,
      inf: r.inf,
      en: r.en,
      forms: r.forms as Verb["forms"],
      source: r.source,
      addedBy: r.addedBy,
    }));
  } catch {
    return [];
  }
}

export type AddVerbResult =
  | { ok: true; verb: SavedVerb }
  | { ok: false; error: string };

export async function addVerb(
  input: string,
  meaning: string
): Promise<AddVerbResult> {
  const session = await requireSession();
  const inf = String(input ?? "").trim().toLowerCase();
  const en = String(meaning ?? "").trim().slice(0, 120);

  if (!inf) return { ok: false, error: "Escreve o verbo." };

  // Already curated? Say so rather than making a duplicate the drill would
  // then ask twice — and the curated entry is hand-checked, so it wins.
  if (findVerb(inf)) {
    return {
      ok: false,
      error: `“${inf}” já está na lista principal — procura por ele acima.`,
    };
  }

  const built = regularVerb(inf);
  if (!built) {
    return {
      ok: false,
      error:
        "Só consigo conjugar infinitivos terminados em -ar, -er ou -ir (4 letras ou mais).",
    };
  }
  if (!en) {
    return { ok: false, error: "Escreve o que o verbo significa em inglês." };
  }

  const db = getDb();
  try {
    const [row] = await db
      .insert(userVerbs)
      .values({ inf, en, forms: built.forms, source: "auto", addedBy: session.username })
      .onConflictDoUpdate({
        // Re-adding a verb you already have should correct its meaning, not
        // throw an error at somebody who has forgotten they added it.
        target: [userVerbs.addedBy, userVerbs.inf],
        set: { en, forms: built.forms },
      })
      .returning();

    await logActivity(
      session.username,
      "verbos",
      `Guardou o verbo “${inf}” ⚡`,
      2
    ).catch(() => {});

    revalidatePath("/verbos");
    revalidatePath("/jogos/cartoes");
    return {
      ok: true,
      verb: {
        id: row.id,
        inf: row.inf,
        en: row.en,
        forms: row.forms as Verb["forms"],
        source: row.source,
        addedBy: row.addedBy,
      },
    };
  } catch {
    return { ok: false, error: "Não deu para guardar. Tenta outra vez." };
  }
}

export async function removeVerb(id: number): Promise<{ ok: boolean }> {
  const session = await requireSession();
  try {
    // Scoped to the OWNER, not just the household: deleting somebody else's
    // saved verb from under them is not a shared-shelf feature.
    await getDb()
      .delete(userVerbs)
      .where(and(eq(userVerbs.id, id), eq(userVerbs.addedBy, session.username)));
    revalidatePath("/verbos");
    revalidatePath("/jogos/cartoes");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Close out a flashcard round: log the activity and send the misses to SRS.
 *
 * Self-graded cards are cheap and fast but leave no trace, so the one thing
 * worth persisting is what the learner did NOT know — that goes to the review
 * deck, where the grading is real and the spacing is handled.
 */
export async function finishVerbCards(
  mode: string,
  knew: number,
  total: number,
  missed: { inf: string; prompt: string; answer: string; en: string }[]
): Promise<void> {
  const session = await requireSession();

  // Cap the write: a round is 12 cards, so anything longer is not a round.
  for (const m of missed.slice(0, 12)) {
    await addMistakeCard(
      session.username,
      m.prompt.slice(0, 200),
      m.answer.slice(0, 200),
      m.en ? `${m.inf} — ${m.en}` : m.inf
    ).catch(() => {});
  }

  await logActivity(
    session.username,
    "verbos",
    `Cartões de verbos (${mode}) — ${knew}/${total} de cor 🎴`,
    Math.min(20, 5 + knew)
  ).catch(() => {});
}
