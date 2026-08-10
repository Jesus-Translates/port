"use server";

import { and, desc, gte, inArray, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { activity, getDb } from "@/lib/db";
import { householdUsernames } from "@/lib/tenant";

/**
 * Everything the Progresso screen draws, derived from the activity table.
 *
 * No new columns and no migration: every XP-earning thing in the app already
 * writes an activity row with an xp value and a timestamp, so the weekly
 * chart, the five-week heatmap and the league are all just different windows
 * onto the same rows.
 *
 * All three are day-bucketed in EUROPE/LISBON. Doing it in UTC would move the
 * boundary by an hour and put a late-evening session on the wrong day for
 * half the year — which, on a streak, is the difference between keeping it and
 * losing it.
 */

/** A day in Lisbon, as YYYY-MM-DD. */
const LISBON_DAY = sql<string>`to_char(${activity.createdAt} at time zone 'Europe/Lisbon', 'YYYY-MM-DD')`;

function lisbonToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });
}

/** Midnight in Lisbon, `days` ago. */
function since(days: number): Date {
  const d = new Date(`${lisbonToday()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

/** Day letters as Portuguese uses them: segunda → S T Q Q S S D. */
const DAY_LETTER = ["D", "S", "T", "Q", "Q", "S", "S"];

export type DayXp = { day: string; letter: string; xp: number; isToday: boolean };

/**
 * The last seven days, oldest first, with empty days present as zeroes.
 *
 * Gaps have to be filled here rather than in the chart: a query returns only
 * the days that HAVE rows, and a bar chart that silently omits Tuesday is a
 * chart that lies about a broken streak.
 */
export async function getWeeklyXp(): Promise<DayXp[]> {
  const session = await requireSession();
  const rows = await getDb()
    .select({ day: LISBON_DAY, xp: sql<number>`coalesce(sum(${activity.xp}),0)::int` })
    .from(activity)
    .where(
      and(
        sql`${activity.username} = ${session.username}`,
        gte(activity.createdAt, since(6))
      )
    )
    .groupBy(LISBON_DAY);

  const byDay = new Map(rows.map((r) => [r.day, r.xp]));
  const today = lisbonToday();
  const out: DayXp[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      day: key,
      letter: DAY_LETTER[d.getUTCDay()],
      xp: byDay.get(key) ?? 0,
      isToday: key === today,
    });
  }
  return out;
}

export type HeatCell = { day: string; level: 0 | 1 | 2 | 3 };

/**
 * Thirty-five days, oldest first — five rows of seven for the heatmap.
 *
 * Four levels rather than raw XP: the point is "did you show up", and a day
 * with 200 XP should not make a day with 30 look empty.
 */
export async function getHeatmap(): Promise<HeatCell[]> {
  const session = await requireSession();
  const rows = await getDb()
    .select({ day: LISBON_DAY, xp: sql<number>`coalesce(sum(${activity.xp}),0)::int` })
    .from(activity)
    .where(
      and(
        sql`${activity.username} = ${session.username}`,
        gte(activity.createdAt, since(34))
      )
    )
    .groupBy(LISBON_DAY);

  const byDay = new Map(rows.map((r) => [r.day, r.xp]));
  const today = lisbonToday();
  const out: HeatCell[] = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const xp = byDay.get(key) ?? 0;
    out.push({
      day: key,
      level: xp === 0 ? 0 : xp < 20 ? 1 : xp < 60 ? 2 : 3,
    });
  }
  return out;
}

export type LeagueRow = {
  username: string;
  xp: number;
  isMe: boolean;
};

/**
 * The household league for the last seven days.
 *
 * HOUSEHOLD, not global. Every other surface in this app is walled off by
 * family on purpose, and a league that reached across them would undo that —
 * the cross-family scoreboard exists separately on the same screen, with
 * every name masked.
 */
export async function getHouseholdLeague(): Promise<LeagueRow[]> {
  const session = await requireSession();
  const mine = await householdUsernames();
  if (mine.length === 0) return [];

  const rows = await getDb()
    .select({
      username: activity.username,
      xp: sql<number>`coalesce(sum(${activity.xp}),0)::int`,
    })
    .from(activity)
    .where(
      and(inArray(activity.username, mine), gte(activity.createdAt, since(6)))
    )
    .groupBy(activity.username)
    .orderBy(desc(sql`coalesce(sum(${activity.xp}),0)`));

  // Everyone in the house appears, including whoever did nothing this week —
  // a league that hides the people at the bottom is not a family board.
  const seen = new Map(rows.map((r) => [r.username, r.xp]));
  return mine
    .map((username) => ({
      username,
      xp: seen.get(username) ?? 0,
      isMe: username === session.username,
    }))
    .sort((a, b) => b.xp - a.xp);
}
