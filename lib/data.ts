import { cache } from "react";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
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
  users,
} from "@/lib/db";
import { householdUsernames, visibleOwners } from "@/lib/tenant";
import { dayKey, streakFrom } from "@/lib/streak";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2"] as const;
/**
 * Where a new learner starts.
 *
 * A1, not A2. The placement test moves you UP; nobody should be dropped into
 * a level they never demonstrated, and a beginner meeting A2 content on day
 * one concludes the app is not for them.
 */
export const DEFAULT_CEFR = "A1";

/** Anyone's stored level. Server-only (not a server action) so a client can't
 *  probe other people's rows. Falls back to the default, never throws.
 *  cache(): the dashboard asks three times per render, and setCefrLevel only
 *  ever writes BEFORE the first read in its own request. */
export const getCefrFor = cache(async (username: string): Promise<string> => {
  try {
    const [row] = await getDb()
      .select({ level: users.cefrLevel })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    const level = row?.level ?? "";
    return (CEFR_LEVELS as readonly string[]).includes(level)
      ? level
      : DEFAULT_CEFR;
  } catch {
    return DEFAULT_CEFR;
  }
});

/** This ONE person's recent activity. getStats().recent is deliberately
 *  family-wide for the dashboard feed; anything reasoning about "what should
 *  YOU do next" must use this instead. */
export async function getMyRecentActivity(username: string, limit = 12) {
  return getDb()
    .select({
      kind: activity.kind,
      summary: activity.summary,
      createdAt: activity.createdAt,
    })
    .from(activity)
    .where(eq(activity.username, username))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
}

/** Has this person actually done the placement quiz (or set a level by hand)?
 *  Recorded as an activity row by setCefrLevel — no extra column needed.
 *  cache() is safe for the same reason as getCefrFor. */
export const hasBeenPlaced = cache(async (username: string): Promise<boolean> => {
  try {
    const [row] = await getDb()
      .select({ id: activity.id })
      .from(activity)
      .where(
        and(
          eq(activity.username, username),
          sql`${activity.summary} like 'Nível definido%'`
        )
      )
      .limit(1);
    return Boolean(row);
  } catch {
    // Never nag someone because a query failed.
    return true;
  }
});

export async function getCategoriesWithCounts() {
  const db = getDb();
  // NOT a correlated subquery: drizzle renders `${categories.id}` unqualified
  // inside a sub-select's FROM scope, so it binds to ref_entries.id and the
  // correlation silently vanishes (counts come back 0). Group + Map instead.
  const [cats, counts] = await Promise.all([
    db
      .select({
        id: categories.id,
        slug: categories.slug,
        namePt: categories.namePt,
        nameEn: categories.nameEn,
        emoji: categories.emoji,
        blurbEn: categories.blurbEn,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(inArray(categories.createdBy, await visibleOwners()))
      .orderBy(asc(categories.sortOrder), asc(categories.id)),
    db
      .select({
        categoryId: refEntries.categoryId,
        n: sql<number>`count(*)::int`,
      })
      .from(refEntries)
      .where(inArray(refEntries.addedBy, await visibleOwners()))
      .groupBy(refEntries.categoryId),
  ]);
  const byId = new Map(counts.map((c) => [c.categoryId, c.n]));
  return cats.map((c) => ({ ...c, entryCount: byId.get(c.id) ?? 0 }));
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  const [category] = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.slug, slug),
        inArray(categories.createdBy, await visibleOwners())
      )
    )
    .limit(1);
  if (!category) return null;
  const entries = await db
    .select()
    .from(refEntries)
    .where(
      and(
        eq(refEntries.categoryId, category.id),
        // Seeded entries belong to the product; added ones to whoever added
        // them. A word another family typed is not in your phrasebook.
        inArray(refEntries.addedBy, await visibleOwners())
      )
    )
    .orderBy(asc(refEntries.id));
  return { category, entries };
}

/**
 * A household still shares everything INSIDE it — notes and quizzes are common
 * family space, exactly as before. What changed is the boundary: "everyone"
 * now means everyone in YOUR household, not every account in the database.
 *
 * The single-item getters matter more than the lists. A list that leaks is
 * visible and embarrassing; /notes/5 quietly serving another family's note is
 * the one that actually hurts, so each one re-checks ownership rather than
 * trusting that a link could only have come from a scoped list.
 */
export async function getNotesAll() {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return [];
  return db
    .select()
    .from(notes)
    .where(inArray(notes.username, mine))
    .orderBy(desc(notes.updatedAt));
}

export async function getNote(id: number) {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return null;
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), inArray(notes.username, mine)))
    .limit(1);
  return note ?? null;
}

/** Lessons are product content when seeded, household content when authored. */
export async function getLessons() {
  const db = getDb();
  return db
    .select()
    .from(lessons)
    .where(inArray(lessons.createdBy, await visibleOwners()))
    .orderBy(asc(lessons.id));
}

export async function getLesson(id: number) {
  const db = getDb();
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, id), inArray(lessons.createdBy, await visibleOwners())))
    .limit(1);
  return lesson ?? null;
}

export async function getHomeworkAll() {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return [];
  return db
    .select()
    .from(homework)
    .where(inArray(homework.username, mine))
    .orderBy(desc(homework.createdAt));
}

export async function getHomeworkItem(id: number) {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return null;
  const [hw] = await db
    .select()
    .from(homework)
    .where(and(eq(homework.id, id), inArray(homework.username, mine)))
    .limit(1);
  return hw ?? null;
}

export async function getQuizzesAll() {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return [];
  return db
    .select()
    .from(quizzes)
    .where(inArray(quizzes.username, mine))
    .orderBy(desc(quizzes.createdAt));
}

export async function getQuiz(id: number) {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return null;
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(and(eq(quizzes.id, id), inArray(quizzes.username, mine)))
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

  const days = new Set(rows.map((r) => dayKey(r.createdAt)));
  const { streak } = streakFrom(days);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const activeThisWeek = new Set(
    rows.filter((r) => r.createdAt >= weekAgo).map((r) => dayKey(r.createdAt))
  ).size;

  /*
   * The family feed — HOUSEHOLD ONLY.
   *
   * TENANCY: this had no WHERE clause at all. It selected the eight most
   * recent activity rows in the entire instance and rendered them under "A
   * família esta semana", so a brand-new family saw another family's lessons,
   * and the platform operator — who belongs to no household — saw a stranger's
   * homework, including account names from deletions.
   *
   * An empty household yields an empty feed rather than everyone's: someone
   * with no family has no family activity, which is the honest answer.
   */
  const mine = await householdUsernames();
  const recent =
    mine.length === 0
      ? []
      : await db
          .select({
            kind: activity.kind,
            summary: activity.summary,
            createdAt: activity.createdAt,
            username: activity.username,
          })
          .from(activity)
          .where(inArray(activity.username, mine))
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
  // The JS below already kept only the household's rows, but the queries were
  // aggregating the WHOLE instance first — this runs on every dashboard load,
  // so its cost scaled with the deployment instead of with the family.
  const names = usernames.map((n) => n.toLowerCase());
  if (names.length === 0) return [];
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
      .where(inArray(activity.username, names))
      .groupBy(activity.username),
    db
      .select({
        username: activity.username,
        xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int`,
      })
      .from(activity)
      .where(
        and(inArray(activity.username, names), gte(activity.createdAt, weekAgo))
      )
      .groupBy(activity.username),
    db
      .select({
        username: quizzes.username,
        done: sql<number>`count(*)::int`,
        score: sql<number>`coalesce(sum(${quizzes.score}), 0)::int`,
        total: sql<number>`coalesce(sum(${quizzes.total}), 0)::int`,
      })
      .from(quizzes)
      .where(
        and(inArray(quizzes.username, names), eq(quizzes.status, "completed"))
      )
      .groupBy(quizzes.username),
    db
      .select({
        username: kudos.toUser,
        stars: sql<number>`count(*)::int`,
      })
      .from(kudos)
      .where(and(inArray(kudos.toUser, names), eq(kudos.kind, "star")))
      .groupBy(kudos.toUser),
    db
      .select({ username: activity.username, createdAt: activity.createdAt })
      .from(activity)
      .where(
        and(inArray(activity.username, names), gte(activity.createdAt, since))
      ),
  ]);

  return names
    .map((u) => {
      const days = new Set(
        actRows.filter((r) => r.username === u).map((r) => dayKey(r.createdAt))
      );
      const { streak } = streakFrom(days);
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

/** Kudos received in the last 7 days — the dashboard shows fresh cheer, not
 *  the same five rows forever. */
export async function getKudosFor(username: string, limit = 20) {
  const db = getDb();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return db
    .select()
    .from(kudos)
    .where(and(eq(kudos.toUser, username), gte(kudos.createdAt, weekAgo)))
    .orderBy(desc(kudos.createdAt))
    .limit(limit);
}

/**
 * The household's recent stars.
 *
 * TENANCY: this used to select the most recent kudos across the whole
 * instance, with no filter at all, and /familia renders it for every signed-in
 * user — so a brand-new family saw another family's names on their own board.
 * Both ends are checked, not just the recipient: a kudo is a thing that
 * happens inside one house, and either name leaking is a leak.
 */
export async function getRecentKudos(limit = 12) {
  const db = getDb();
  const mine = await householdUsernames();
  if (mine.length === 0) return [];
  return db
    .select()
    .from(kudos)
    .where(
      and(inArray(kudos.fromUser, mine), inArray(kudos.toUser, mine))
    )
    .orderBy(desc(kudos.createdAt))
    .limit(limit);
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
