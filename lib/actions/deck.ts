"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { cards, getDb } from "@/lib/db";
import { upsertCard } from "@/lib/srs";

/** A "mastered" card is parked far enough away that it never comes back. */
const MASTERED_DAYS = 3650;
/** Guard rail for the bulk delete — nobody needs to nuke more in one click. */
const MAX_DELETE = 200;

function clean(s: string | undefined | null): string {
  return (s ?? "").trim().slice(0, 500);
}

/**
 * Save any Portuguese snippet — from Luna, the book, a story — as a review
 * card. Returns true when a card was created, false when it was already
 * there (the UI shows "no baralho ✓" either way).
 */
export async function addToDeck(
  pt: string,
  en?: string,
  note?: string
): Promise<boolean> {
  const session = await requireSession();
  const back = clean(pt);
  if (!back) return false;
  // No English gloss (harvested straight from a chat bubble) → the Portuguese
  // itself is the front, so the card is still findable and de-duplicable.
  const front = clean(en) || back;

  const added = await upsertCard({
    username: session.username,
    kind: "saved",
    front,
    back,
    note: clean(note) || null,
  });

  if (added) {
    await logActivity(
      session.username,
      "review",
      `Guardou “${back}” no baralho`,
      2
    );
  }
  revalidatePath("/practice/rever/gerir");
  return added;
}

/** "Já domino": park the card ~10 years out so it stops surfacing. */
export async function masterCard(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [card] = await db
    .select()
    .from(cards)
    .where(and(eq(cards.id, id), eq(cards.username, session.username)))
    .limit(1);
  if (!card) return;

  const due = new Date(Date.now() + MASTERED_DAYS * 24 * 60 * 60 * 1000);
  // Keep the FSRS blob and the denormalized columns in step — the scheduler
  // revives the blob on the next grade.
  const fsrs = { ...((card.fsrs as Record<string, unknown>) ?? {}), due, state: 2 };
  await db
    .update(cards)
    .set({ fsrs, due, state: 2 })
    .where(and(eq(cards.id, id), eq(cards.username, session.username)));

  revalidatePath("/practice/rever/gerir");
  revalidatePath("/practice/rever");
}

/** Undo "já domino": bring the card back into today's queue. */
export async function unmasterCard(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [card] = await db
    .select()
    .from(cards)
    .where(and(eq(cards.id, id), eq(cards.username, session.username)))
    .limit(1);
  if (!card) return;

  const due = new Date();
  const fsrs = { ...((card.fsrs as Record<string, unknown>) ?? {}), due };
  await db
    .update(cards)
    .set({ fsrs, due })
    .where(and(eq(cards.id, id), eq(cards.username, session.username)));

  revalidatePath("/practice/rever/gerir");
  revalidatePath("/practice/rever");
}

/** Bulk remove — only ever the caller's own rows. */
export async function deleteCards(ids: number[]): Promise<number> {
  const session = await requireSession();
  const list = [...new Set((ids ?? []).map(Number).filter(Number.isFinite))].slice(
    0,
    MAX_DELETE
  );
  if (list.length === 0) return 0;

  const db = getDb();
  await db
    .delete(cards)
    .where(and(eq(cards.username, session.username), inArray(cards.id, list)));

  revalidatePath("/practice/rever/gerir");
  revalidatePath("/practice/rever");
  return list.length;
}
