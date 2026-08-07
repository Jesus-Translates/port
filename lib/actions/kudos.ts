"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession, getValidUsers } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, kudos } from "@/lib/db";

function isFamily(username: string): boolean {
  return getValidUsers().some((u) => u.toLowerCase() === username.toLowerCase());
}

/** Award a golden star. One per person per day keeps them meaningful. */
export async function giveStar(toUser: string, message: string) {
  const session = await requireSession();
  const to = toUser.trim().toLowerCase();
  if (!isFamily(to) || to === session.username) return;

  const db = getDb();
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
    3
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
    2
  );
  revalidatePath("/familia");
  revalidatePath("/");
}

export async function markKudosSeen() {
  const session = await requireSession();
  const db = getDb();
  await db
    .update(kudos)
    .set({ seen: 1 })
    .where(and(eq(kudos.toUser, session.username), eq(kudos.seen, 0)));
  revalidatePath("/");
  revalidatePath("/familia");
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
