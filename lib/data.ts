import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import {
  activity,
  categories,
  getDb,
  homework,
  kudos,
  lessons,
  notes,
  quizzes,
  refEntries,
} from "@/lib/db";

export async function getCategoriesWithCounts() {
  const db = getDb();
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      namePt: categories.namePt,
      nameEn: categories.nameEn,
      emoji: categories.emoji,
      blurbEn: categories.blurbEn,
      sortOrder: categories.sortOrder,
      entryCount: sql<number>`(select count(*)::int from ${refEntries} where ${refEntries.categoryId} = ${categories.id})`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (!category) return null;
  const entries = await db
    .select()
    .from(refEntries)
    .where(eq(refEntries.categoryId, category.id))
    .orderBy(asc(refEntries.id));
  return { category, entries };
}

// The whole hub is shared family space: notes and quizzes are visible to all
// three users; `username` records who created a thing, not who may see it.
export async function getNotesAll() {
  const db = getDb();
  return db.select().from(notes).orderBy(desc(notes.updatedAt));
}

export async function getNote(id: number) {
  const db = getDb();
  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1);
  return note ?? null;
}

export async function getLessons() {
  const db = getDb();
  return db.select().from(lessons).orderBy(asc(lessons.id));
}

export async function getLesson(id: number) {
  const db = getDb();
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);
  return lesson ?? null;
}

export async function getHomeworkAll() {
  const db = getDb();
  return db.select().from(homework).orderBy(desc(homework.createdAt));
}

export async function getHomeworkItem(id: number) {
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  return hw ?? null;
}

export async function getQuizzesAll() {
  const db = getDb();
  return db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
}

export async function getQuiz(id: number) {
  const db = getDb();
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  return quiz ?? null;
}

export type Stats = {
  xp: number;
  streakDays: number;
  activeThisWeek: number;
  recent: { kind: string; summary: string; createdAt: Date; username: string }[];
};

export async function getStats(username: string): Promise<Stats> {
  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const rows = await db
    .select({
      xp: activity.xp,
      createdAt: activity.createdAt,
    })
    .from(activity)
    .where(and(eq(activity.username, username), gte(activity.createdAt, since)))
    .orderBy(desc(activity.createdAt));

  const [{ total }] = await db
    .select({ total: sql<number>`coalesce(sum(${activity.xp}), 0)::int` })
    .from(activity)
    .where(eq(activity.username, username));

  // Bucket days in the family's timezone, not UTC — a 00:30 study session in
  // Portugal should count as its own local day.
  const dayKey = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });

  const days = new Set(rows.map((r) => dayKey(r.createdAt)));
  let streak = 0;
  const cursor = new Date();
  // Streak counts today (if active) or is anchored on yesterday.
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const activeThisWeek = new Set(
    rows.filter((r) => r.createdAt >= weekAgo).map((r) => dayKey(r.createdAt))
  ).size;

  const recent = await db
    .select({
      kind: activity.kind,
      summary: activity.summary,
      createdAt: activity.createdAt,
      username: activity.username,
    })
    .from(activity)
    .orderBy(desc(activity.createdAt))
    .limit(8);

  return { xp: total, streakDays: streak, activeThisWeek, recent };
}

export type FamilyMember = {
  username: string;
  xp: number;
  streakDays: number;
  quizzesDone: number;
  quizAccuracy: number | null;
  stars: number;
  xpThisWeek: number;
};

/** Leaderboard data: one row per family member, ranked by XP this week. */
export async function getFamilyBoard(usernames: string[]): Promise<FamilyMember[]> {
  const db = getDb();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const [xpRows, weekRows, quizRows, starRows, actRows] = await Promise.all([
    db
      .select({
        username: activity.username,
        xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int`,
      })
      .from(activity)
      .groupBy(activity.username),
    db
      .select({
        username: activity.username,
        xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int`,
      })
      .from(activity)
      .where(gte(activity.createdAt, weekAgo))
      .groupBy(activity.username),
    db
      .select({
        username: quizzes.username,
        done: sql<number>`count(*)::int`,
        score: sql<number>`coalesce(sum(${quizzes.score}), 0)::int`,
        total: sql<number>`coalesce(sum(${quizzes.total}), 0)::int`,
      })
      .from(quizzes)
      .where(eq(quizzes.status, "completed"))
      .groupBy(quizzes.username),
    db
      .select({
        username: kudos.toUser,
        stars: sql<number>`count(*)::int`,
      })
      .from(kudos)
      .where(eq(kudos.kind, "star"))
      .groupBy(kudos.toUser),
    db
      .select({ username: activity.username, createdAt: activity.createdAt })
      .from(activity)
      .where(gte(activity.createdAt, since)),
  ]);

  const dayKey = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });

  return usernames
    .map((name) => {
      const u = name.toLowerCase();
      const days = new Set(
        actRows.filter((r) => r.username === u).map((r) => dayKey(r.createdAt))
      );
      let streak = 0;
      const cursor = new Date();
      if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
      while (days.has(dayKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      const q = quizRows.find((r) => r.username === u);
      return {
        username: u,
        xp: xpRows.find((r) => r.username === u)?.xp ?? 0,
        xpThisWeek: weekRows.find((r) => r.username === u)?.xp ?? 0,
        streakDays: streak,
        quizzesDone: q?.done ?? 0,
        quizAccuracy: q && q.total > 0 ? Math.round((q.score / q.total) * 100) : null,
        stars: starRows.find((r) => r.username === u)?.stars ?? 0,
      };
    })
    .sort((a, b) => b.xpThisWeek - a.xpThisWeek || b.xp - a.xp);
}

export async function getKudosFor(username: string, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(kudos)
    .where(eq(kudos.toUser, username))
    .orderBy(desc(kudos.createdAt))
    .limit(limit);
}

export async function getRecentKudos(limit = 12) {
  const db = getDb();
  return db.select().from(kudos).orderBy(desc(kudos.createdAt)).limit(limit);
}

/** Best score per quiz topic across the family — the number to beat. */
export async function getTopScores() {
  const db = getDb();
  return db
    .select({
      topic: quizzes.topic,
      username: quizzes.username,
      score: quizzes.score,
      total: quizzes.total,
    })
    .from(quizzes)
    .where(eq(quizzes.status, "completed"))
    .orderBy(desc(quizzes.score));
}

export async function logActivity(
  username: string,
  kind: string,
  summary: string,
  xp = 5
) {
  const db = getDb();
  await db.insert(activity).values({ username, kind, summary, xp });
}
