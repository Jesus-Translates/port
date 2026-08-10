"use server";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { activity, getDb } from "@/lib/db";

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

export async function getGlobalLeaderboard(limit = 20): Promise<LeaderRow[]> {
  const session = await requireSession();
  const db = getDb();

  // Grouped query, never a correlated sub-select — that pattern binds to the
  // wrong table here and silently returns zeros.
  const rows = await db
    .select({
      username: activity.username,
      xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int`,
    })
    .from(activity)
    .where(gte(activity.createdAt, startOfDayLisbon()))
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

/**
 * The signed-in learner's XP so far today.
 *
 * Home's daily-goal ring needs a SUM, and getStats().recent carries no xp
 * column — counting its rows would have shown "number of things done" in a
 * field labelled XP, which is the kind of wrong that looks right.
 */
export async function getMyTodayXp(): Promise<number> {
  const session = await requireSession();
  const [row] = await getDb()
    .select({ xp: sql<number>`coalesce(sum(${activity.xp}), 0)::int` })
    .from(activity)
    .where(
      and(
        eq(activity.username, session.username),
        gte(activity.createdAt, startOfDayLisbon())
      )
    );
  return row?.xp ?? 0;
}
