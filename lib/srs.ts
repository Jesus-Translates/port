import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card as FsrsCard,
  type Grade,
} from "ts-fsrs";
import { and, asc, eq, gt, gte, lte, sql } from "drizzle-orm";
import { cards, getDb, reviewLogs } from "@/lib/db";

// Default FSRS-6 weights, 90% retention target. Fuzz spreads due times so
// eight people don't all get identical schedules.
const scheduler = fsrs(
  generatorParameters({ enable_fuzz: true, request_retention: 0.9 })
);

export type ReviewRating = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy
const RATING: Grade[] = [
  Rating.Again,
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
];

/** jsonb → ts-fsrs Card (dates come back as ISO strings). */
function reviveCard(raw: unknown): FsrsCard {
  const c = raw as FsrsCard & { due: string | Date; last_review?: string | Date };
  return {
    ...c,
    due: new Date(c.due),
    last_review: c.last_review ? new Date(c.last_review) : undefined,
  } as FsrsCard;
}

export function emptyCard(): FsrsCard {
  return createEmptyCard(new Date());
}

/** Apply a grade; returns the next FSRS state. */
export function nextState(raw: unknown, rating: ReviewRating): FsrsCard {
  return scheduler.next(reviveCard(raw), new Date(), RATING[rating]).card;
}

const NEW_PER_DAY = 20;
const MAX_QUEUE = 100;

/** Today's queue: due learning/review cards first, then up to the daily cap of
 *  brand-new cards (minus new cards already introduced today). */
export async function getQueue(username: string) {
  const db = getDb();
  const now = new Date();

  const due = await db
    .select()
    .from(cards)
    .where(
      and(eq(cards.username, username), gt(cards.state, 0), lte(cards.due, now))
    )
    .orderBy(asc(cards.due))
    .limit(MAX_QUEUE);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const [{ introduced }] = await db
    .select({ introduced: sql<number>`count(distinct ${reviewLogs.cardId})::int` })
    .from(reviewLogs)
    .innerJoin(cards, eq(cards.id, reviewLogs.cardId))
    .where(
      and(
        eq(reviewLogs.username, username),
        gte(reviewLogs.createdAt, dayStart),
        sql`(${cards.fsrs}->>'reps')::int <= 2`
      )
    );

  const newBudget = Math.max(0, NEW_PER_DAY - Number(introduced ?? 0));
  const fresh =
    newBudget > 0
      ? await db
          .select()
          .from(cards)
          .where(and(eq(cards.username, username), eq(cards.state, 0)))
          // MISTAKES FIRST. Ordering by id alone starved them: enrolling a
          // phrasebook category inserts hundreds of low-id "entry" cards, so a
          // word you actually got wrong queued behind all of them — for weeks,
          // at 20 new/day. Auto-enrolling mistakes is the whole point of the
          // deck; showing them promptly is what makes it true.
          .orderBy(
            sql`case when ${cards.kind} = 'mistake' then 0 else 1 end`,
            asc(cards.id)
          )
          .limit(newBudget)
      : [];

  return [...due, ...fresh];
}

/** Flash review: a quick sanity-check hand — due cards first, then a random
 *  sample of the rest of the deck. Grades still feed FSRS like any review. */
export async function getFlashQueue(username: string, n = 5) {
  const db = getDb();
  const now = new Date();
  return db
    .select()
    .from(cards)
    .where(eq(cards.username, username))
    .orderBy(
      sql`case when ${cards.state} > 0 and ${cards.due} <= ${now} then 0 else 1 end`,
      sql`random()`
    )
    .limit(n);
}

export async function countDue(username: string): Promise<number> {
  const db = getDb();
  const now = new Date();
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(cards)
    .where(
      and(eq(cards.username, username), gt(cards.state, 0), lte(cards.due, now))
    );
  return Number(row?.n ?? 0);
}

/** Insert a card unless the user already has one with the same identity. */
export async function upsertCard(input: {
  username: string;
  kind: string;
  sourceId?: number | null;
  front: string;
  back: string;
  note?: string | null;
  direction?: string;
}): Promise<boolean> {
  const db = getDb();
  const front = input.front.trim().slice(0, 500);
  const back = input.back.trim().slice(0, 500);
  if (!front || !back) return false;
  const [existing] = await db
    .select({ id: cards.id })
    .from(cards)
    .where(
      and(
        eq(cards.username, input.username),
        eq(cards.kind, input.kind),
        eq(cards.front, front)
      )
    )
    .limit(1);
  if (existing) return false;
  const state = emptyCard();
  await db.insert(cards).values({
    username: input.username,
    kind: input.kind,
    sourceId: input.sourceId ?? null,
    front,
    back,
    note: input.note?.trim().slice(0, 500) || null,
    direction: input.direction ?? "en-pt",
    fsrs: state,
    due: state.due,
    state: 0,
  });
  return true;
}

/** A graded error becomes a review card — the highest-signal content we have.
 *  Fire-and-forget: card creation must never fail a grading flow. */
export async function addMistakeCard(
  username: string,
  prompt: string,
  correctedPt: string,
  tip?: string | null
): Promise<void> {
  try {
    await upsertCard({
      username,
      kind: "mistake",
      front: prompt,
      back: correctedPt,
      note: tip ?? null,
    });
  } catch {
    // never block grading on this
  }
}
