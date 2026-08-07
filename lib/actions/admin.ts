"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRole, getValidUsers, requireSession, requireStaff } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import {
  cards,
  getDb,
  homework,
  kudos,
  notes,
  quizzes,
  ttsAudio,
} from "@/lib/db";
import { introBefore, parseItemsFromMarkdown } from "@/lib/homework-items";

/** Teacher/admin: assign written-by-hand homework to chosen students. */
export async function assignHomework(formData: FormData) {
  const staff = await requireStaff();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const instructions = String(formData.get("instructions") ?? "")
    .trim()
    .slice(0, 8000);
  const assignees = formData
    .getAll("assignees")
    .map((a) => String(a).toLowerCase())
    .filter((a) => getValidUsers().some((u) => u.toLowerCase() === a));
  if (!title || !instructions || assignees.length === 0) return;

  const db = getDb();
  // Same per-question treatment students get everywhere else.
  const parsed = parseItemsFromMarkdown(instructions);
  await db.insert(homework).values(
    assignees.map((username) => ({
      username,
      title,
      instructions:
        parsed.length > 0 ? introBefore(instructions) || title : instructions,
      items: parsed.length > 0 ? parsed : null,
      source: "teacher",
    }))
  );
  await logActivity(
    staff.username,
    "homework",
    `${staff.role === "teacher" ? "A professora" : "O admin"} atribuiu “${title}” a ${assignees.length} ${assignees.length === 1 ? "aluno" : "alunos"}`,
    5
  );
  revalidatePath("/homework");
  revalidatePath("/admin");
}

/** Admin: remove any content, regardless of owner. */
export async function adminDeleteContent(
  kind: "homework" | "quiz" | "note" | "kudo",
  id: number
) {
  const session = await requireSession();
  if (getRole(session.username) !== "admin") return;
  const db = getDb();
  if (kind === "homework") await db.delete(homework).where(eq(homework.id, id));
  else if (kind === "quiz") await db.delete(quizzes).where(eq(quizzes.id, id));
  else if (kind === "note") await db.delete(notes).where(eq(notes.id, id));
  else if (kind === "kudo") await db.delete(kudos).where(eq(kudos.id, id));
  revalidatePath("/admin");
  revalidatePath("/homework");
  revalidatePath("/familia");
}

/** Admin: wipe the cached audio so a new voice regenerates everything. */
export async function clearTtsCache() {
  const session = await requireSession();
  if (getRole(session.username) !== "admin") return;
  const db = getDb();
  await db.delete(ttsAudio);
  revalidatePath("/admin");
}

/** Admin: reset one learner's review deck (fresh start). */
export async function resetDeck(username: string) {
  const session = await requireSession();
  if (getRole(session.username) !== "admin") return;
  const u = username.toLowerCase();
  if (!getValidUsers().some((v) => v.toLowerCase() === u)) return;
  const db = getDb();
  await db.delete(cards).where(eq(cards.username, u));
  revalidatePath("/admin");
}

export type StudentStatus = {
  username: string;
  open: number;
  submitted: number;
  reviewed: number;
  latestTitle: string | null;
  latestId: number | null;
};

/** Teacher/admin: homework status per student. */
export async function getClassOverview(): Promise<StudentStatus[]> {
  await requireStaff();
  const db = getDb();
  const users = getValidUsers().map((u) => u.toLowerCase());

  const rows = await db
    .select({
      username: homework.username,
      status: homework.status,
      n: sql<number>`count(*)::int`,
    })
    .from(homework)
    .where(inArray(homework.username, users))
    .groupBy(homework.username, homework.status);

  const latest = await db
    .select({
      username: homework.username,
      id: homework.id,
      title: homework.title,
      createdAt: homework.createdAt,
    })
    .from(homework)
    .orderBy(sql`${homework.createdAt} desc`)
    .limit(50);

  return users.map((u) => {
    const mine = rows.filter((r) => r.username === u);
    const newest = latest.find((l) => l.username === u);
    const count = (s: string) =>
      Number(mine.find((r) => r.status === s)?.n ?? 0);
    return {
      username: u,
      open: count("open"),
      submitted: count("submitted"),
      reviewed: count("reviewed"),
      latestTitle: newest?.title ?? null,
      latestId: newest?.id ?? null,
    };
  });
}
