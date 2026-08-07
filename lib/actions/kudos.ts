"use server";

import { and, eq, gte, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession, getValidUsers } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, kudos } from "@/lib/db";

function isFamily(username: string): boolean {
  return getValidUsers().some((u) => u.toLowerCase() === username.toLowerCase());
}

/**
 * Award a golden star — at most one per giver→receiver pair per (Lisbon) day,
 * enforced, so stars stay meaningful and the wall can't be flooded.
 * Deliberately worth 0 XP to the giver: kudos must never farm the leaderboard.
 */
export async function giveStar(toUser: string, message: string) {
  const session = await requireSession();
  const to = toUser.trim().toLowerCase();
  if (!isFamily(to) || to === session.username) return;

  const db = getDb();
  const dayStart = lisbonDayStart();
  const [existing] = await db
    .select({ id: kudos.id })
    .from(kudos)
    .where(
      and(
        eq(kudos.fromUser, session.username),
        eq(kudos.toUser, to),
        eq(kudos.kind, "star"),
        gte(kudos.createdAt, dayStart)
      )
    )
    .limit(1);
  if (existing) return;

  await db.insert(kudos).values({
    fromUser: session.username,
    toUser: to,
    kind: "star",
    message: message.trim().slice(0, 300),
  });
  await logActivity(
    session.username,
    "kudos",
    `Deu uma estrela ⭐ a ${titleCase(to)}`,
    0
  );
  revalidatePath("/familia");
  revalidatePath("/");
}

export async function sendNote(toUser: string, message: string) {
  const session = await requireSession();
  const to = toUser.trim().toLowerCase();
  const text = message.trim();
  if (!isFamily(to) || to === session.username || !text) return;

  const db = getDb();
  // Gentle flood guard: max 10 notes per sender per day.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(kudos)
    .where(
      and(
        eq(kudos.fromUser, session.username),
        eq(kudos.kind, "note"),
        gte(kudos.createdAt, lisbonDayStart())
      )
    );
  if (count >= 10) return;

  await db.insert(kudos).values({
    fromUser: session.username,
    toUser: to,
    kind: "note",
    message: text.slice(0, 500),
  });
  await logActivity(
    session.username,
    "kudos",
    `Deixou um recado a ${titleCase(to)}`,
    0
  );
  revalidatePath("/familia");
  revalidatePath("/");
}

/** Sender or recipient can take a kudo off the wall. */
export async function deleteKudo(id: number) {
  const session = await requireSession();
  const db = getDb();
  await db
    .delete(kudos)
    .where(
      and(
        eq(kudos.id, id),
        or(
          eq(kudos.fromUser, session.username),
          eq(kudos.toUser, session.username)
        )
      )
    );
  revalidatePath("/familia");
  revalidatePath("/");
}

function lisbonDayStart(): Date {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon",
  });
  // Lisbon is UTC+0/+1; using UTC midnight is at most 1h off at the boundary,
  // which is fine for a courtesy limit.
  return new Date(`${day}T00:00:00Z`);
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
