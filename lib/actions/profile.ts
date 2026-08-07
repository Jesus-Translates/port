"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, users } from "@/lib/db";

// Kept module-local: a "use server" file may only export async functions.
const LEVELS = ["A1", "A2", "B1", "B2"];
const DEFAULT_LEVEL = "A2";

/** The signed-in person's CEFR level, "A2" when unknown or unreadable. */
export async function getMyCefr(): Promise<string> {
  const session = await requireSession();
  try {
    const [row] = await getDb()
      .select({ level: users.cefrLevel })
      .from(users)
      .where(eq(users.username, session.username))
      .limit(1);
    const level = row?.level ?? "";
    return LEVELS.includes(level) ? level : DEFAULT_LEVEL;
  } catch {
    // A level is only ever a default for a <select>; never block a page on it.
    return DEFAULT_LEVEL;
  }
}

/** Store the level from the placement quiz (or a manual pick). */
export async function setCefrLevel(level: string): Promise<void> {
  const session = await requireSession();
  if (!LEVELS.includes(level)) throw new Error("Nível inválido");

  // Upsert: the users row normally exists (seed), but a family member added to
  // VALID_USERS after the last seed run would otherwise silently save nothing.
  await getDb()
    .insert(users)
    .values({
      username: session.username,
      displayName: session.displayName,
      cefrLevel: level,
    })
    .onConflictDoUpdate({
      target: users.username,
      set: { cefrLevel: level },
    });

  await logActivity(session.username, "review", `Nível definido: ${level}`, 2);
  revalidatePath("/");
}
