"use server";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { activity, getDb } from "@/lib/db";
import { lisbonWeekStart } from "@/lib/period";

/**
 * Today's XP across every household — the one place families are compared.
 *
 * Everything else in this app is walled off by household on purpose, so this
 * needs its own justification: it is a scoreboard, not a directory. Names are
 * MASKED before they leave the database, and nothing else about a person
 * crosses the boundary — no household, no level, no activity, no link. What a
 * rival family learns is "somebody whose name starts Ro and ends t did well
 * today", which is the entire point of a leaderboard and the entire limit of
 * what it may reveal.
 *
 * The mask happens server-side. Sending real names and starring them in the
 * component would ship every learner's name to every browser.
 */

export type LeaderRow = {
  /** "Ro*****t" — first and last letter only. */
  masked: string;
  xp: number;
  /** True for the signed-in learner, so their own row can be marked. */
  isMe: boolean;
};

/**
 * Ro*****t — keep the first and last character, star the middle.
 *
 * Short names would give themselves away ("Al" masked is still "Al"), so
 * anything under four characters is starred whole rather than pretend-masked.
 * The star count is FIXED at five regardless of length: a variable run of
 * stars leaks how long the name is, which with a known family is often enough
 * to identify someone.
 */
function mask(name: string): string {
  const n = name.trim();
  if (n.length < 4) return "*****";
  return `${n[0]}${n[1] ?? ""}*****${n[n.length - 1]}`.replace(
    /^(.)(.)/,
    (_m, a: string, b: string) => `${a.toUpperCase()}${b.toLowerCase()}`
  );
}

/** Midnight in Lisbon — "today" is the family's today, not UTC's. */
function startOfDayLisbon(): Date {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon",
  });
  return new Date(`${day}T00:00:00Z`);
}

/**
 * What the signed-in learner has done today: XP earned, and things finished.
 *
 * BOTH, because they answer different questions and are not interchangeable.
 * dailyGoal() in lib/learning-path counts FINISHED ACTIVITIES (1, 3 or 5) —
 * feeding it an XP total rendered "5/3" on the goal ring, a number over its
 * own target that still looked unfinished. The ring wants `done`; the
 * leaderboard and the streak want `xp`.
 */
export async function getMyToday(): Promise<{ xp: number; done: number }> {
  const session = await requireSession();
  const [row] = await getDb()
    .select({
      xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int`,
      done: sql<number>`count(*)::int`,
    })
    .from(activity)
    .where(
      and(
        eq(activity.username, session.username),
        gte(activity.createdAt, startOfDayLisbon())
      )
    );
  return { xp: row?.xp ?? 0, done: row?.done ?? 0 };
}

/**
 * The public weekly high score — everyone on the platform, this week.
 *
 * Weekly rather than daily because a day is mostly a measure of who happened
 * to practise after dinner, and because a board that RESETS is the only kind a
 * newcomer can ever win. Monday, Lisbon (lib/period) — the same week the rest
 * of the app counts.
 *
 * NAMES STAY MASKED, and that is not negotiable by making the board public.
 * Children are real users here. A public scoreboard is a scoreboard, not a
 * directory: what another family learns is that somebody whose name starts Ro
 * and ends t had a good week, which is all a leaderboard needs and all this
 * one may reveal. Nothing else crosses — no household, no level, no link, no
 * way to reach the person.
 */
export async function getGlobalWeekly(limit = 20): Promise<LeaderRow[]> {
  const session = await requireSession();

  const rows = await getDb()
    .select({
      username: activity.username,
      xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int`,
    })
    .from(activity)
    .where(gte(activity.createdAt, lisbonWeekStart()))
    .groupBy(activity.username)
    .orderBy(desc(sql`coalesce(sum(${activity.xp}), 0)`))
    .limit(Math.min(50, Math.max(1, limit)));

  return rows
    .filter((r) => r.xp > 0)
    .map((r) => ({
      masked: mask(r.username),
      xp: r.xp,
      isMe: r.username === session.username,
    }));
}
