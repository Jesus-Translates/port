"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { cards, categories, getDb, refEntries, reviewLogs } from "@/lib/db";
import { emptyCard, nextState, type ReviewRating } from "@/lib/srs";

/** Grade one card and reschedule it. */
export async function gradeCard(cardId: number, rating: ReviewRating) {
  const session = await requireSession();
  const db = getDb();
  const [card] = await db
    .select()
    .from(cards)
    .where(and(eq(cards.id, cardId), eq(cards.username, session.username)))
    .limit(1);
  if (!card) return;

  const next = nextState(card.fsrs, rating);
  await db
    .update(cards)
    .set({ fsrs: next, due: next.due, state: next.state })
    .where(eq(cards.id, cardId));
  await db.insert(reviewLogs).values({
    cardId,
    username: session.username,
    rating,
  });

  // Small XP per review, logged at most once per day for the feed (the
  // review_logs table is the real record; activity is just streak/XP glue).
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(reviewLogs)
    .where(
      and(
        eq(reviewLogs.username, session.username),
        sql`${reviewLogs.createdAt} >= ${dayStart}`
      )
    );
  if (Number(n) === 1 || Number(n) % 20 === 0) {
    await logActivity(
      session.username,
      "review",
      `Reviu ${n} ${Number(n) === 1 ? "cartão" : "cartões"} hoje`,
      Number(n) === 1 ? 5 : 8
    );
  }
  revalidatePath("/practice/rever");
}

/** Enrol every entry of one category (or all categories) as review cards.
 *  en→pt production cards; phrases keep their reply as the note. */
export async function enrolCategory(categoryId: number | null) {
  const session = await requireSession();
  const db = getDb();

  const where =
    categoryId === null
      ? undefined
      : eq(refEntries.categoryId, categoryId);
  const entries = await db
    .select()
    .from(refEntries)
    .where(where)
    .limit(1500);

  // One query to find which sourceIds this user already has.
  const existing = await db
    .select({ sourceId: cards.sourceId })
    .from(cards)
    .where(and(eq(cards.username, session.username), eq(cards.kind, "entry")));
  const have = new Set(existing.map((e) => e.sourceId));

  const fresh = entries.filter((e) => !have.has(e.id));
  if (fresh.length === 0) return { added: 0 };

  const rows = fresh.map((e) => {
    const state = emptyCard();
    return {
      username: session.username,
      kind: "entry",
      sourceId: e.id,
      front: e.en.slice(0, 500),
      back: e.pt.slice(0, 500),
      note: (e.replyPt ? `Resposta: ${e.replyPt}` : e.note)?.slice(0, 500) ?? null,
      direction: "en-pt",
      fsrs: state,
      due: state.due,
      state: 0,
    };
  });
  await db.insert(cards).values(rows);
  await logActivity(
    session.username,
    "review",
    `Adicionou ${rows.length} cartões ao baralho`,
    3
  );
  revalidatePath("/practice/rever");
  return { added: rows.length };
}

/** Remove cards for entries that no longer exist (housekeeping, owner only). */
export async function removeCard(cardId: number) {
  const session = await requireSession();
  const db = getDb();
  await db
    .delete(cards)
    .where(and(eq(cards.id, cardId), eq(cards.username, session.username)));
  revalidatePath("/practice/rever");
}

export type DeckStats = {
  total: number;
  due: number;
  newToday: number;
  byCategory: { id: number; namePt: string; emoji: string; enrolled: number; total: number }[];
};

export async function getDeckOverview(): Promise<DeckStats> {
  const session = await requireSession();
  const db = getDb();
  const now = new Date();

  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      due: sql<number>`count(*) filter (where ${cards.state} > 0 and ${cards.due} <= ${now})::int`,
      fresh: sql<number>`count(*) filter (where ${cards.state} = 0)::int`,
    })
    .from(cards)
    .where(eq(cards.username, session.username));

  const [cats, entryTotals, enrolledTotals] = await Promise.all([
    db
      .select({
        id: categories.id,
        namePt: categories.namePt,
        emoji: categories.emoji,
      })
      .from(categories)
      .orderBy(categories.sortOrder),
    db
      .select({
        categoryId: refEntries.categoryId,
        n: sql<number>`count(*)::int`,
      })
      .from(refEntries)
      .groupBy(refEntries.categoryId),
    db
      .select({
        categoryId: refEntries.categoryId,
        n: sql<number>`count(*)::int`,
      })
      .from(cards)
      .innerJoin(refEntries, eq(refEntries.id, cards.sourceId))
      .where(and(eq(cards.username, session.username), eq(cards.kind, "entry")))
      .groupBy(refEntries.categoryId),
  ]);

  const totalBy = new Map(entryTotals.map((t) => [t.categoryId, Number(t.n)]));
  const enrolledBy = new Map(
    enrolledTotals.map((t) => [t.categoryId, Number(t.n)])
  );

  return {
    total: Number(totals?.total ?? 0),
    due: Number(totals?.due ?? 0),
    newToday: Number(totals?.fresh ?? 0),
    byCategory: cats.map((c) => ({
      id: c.id,
      namePt: c.namePt,
      emoji: c.emoji,
      enrolled: enrolledBy.get(c.id) ?? 0,
      total: totalBy.get(c.id) ?? 0,
    })),
  };
}
