"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, users } from "@/lib/db";
import { cleanLocality, getPlace, type Place } from "@/lib/place";
import {
  DEFAULT_PREFS,
  pathFor,
  readPrefs,
  type Prefs,
} from "@/lib/learning-path";

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

/** Where the signed-in person lives — drives the examples every generator invents. */
export async function getMyPlace(): Promise<Place> {
  const session = await requireSession();
  return getPlace(session.username);
}

/**
 * Save the onboarding answer. `livesInPortugal` is the deciding fact and
 * `locality` is optional — someone can say "yes, Portugal" without naming a
 * town, and the content still improves.
 */
export async function setMyPlace(
  livesInPortugal: boolean,
  locality: string
): Promise<void> {
  const session = await requireSession();
  const clean = cleanLocality(locality);

  // Upsert for the same reason setCefrLevel does: a member added after the
  // last seed run has no users row yet, and would otherwise save nothing.
  await getDb()
    .insert(users)
    .values({
      username: session.username,
      displayName: session.displayName,
      livesInPortugal,
      locality: clean,
    })
    .onConflictDoUpdate({
      target: users.username,
      set: { livesInPortugal, locality: clean },
    });

  // Everything generated from here on is pitched at this place, so drop the
  // cached pages that show generated content.
  revalidatePath("/", "layout");
}

/** The questionnaire answers, or null when it has not been taken. */
export async function getMyPrefs(): Promise<Prefs | null> {
  const session = await requireSession();
  try {
    const [row] = await getDb()
      .select({ prefs: users.prefs })
      .from(users)
      .where(eq(users.username, session.username))
      .limit(1);
    return readPrefs(row?.prefs);
  } catch {
    return null;
  }
}

/**
 * Save the questionnaire. Q5 is stored twice on purpose: in prefs as the
 * answer given, and on users.mode because that is what every surface already
 * reads to decide how much to show.
 */
export async function setMyPrefs(input: Partial<Prefs>): Promise<void> {
  const session = await requireSession();
  const prefs = readPrefs({ ...DEFAULT_PREFS, ...input }) ?? DEFAULT_PREFS;

  await getDb()
    .insert(users)
    .values({
      username: session.username,
      displayName: session.displayName,
      prefs,
      mode: prefs.guidance === "escolho" ? "full" : "simple",
    })
    .onConflictDoUpdate({
      target: users.username,
      set: { prefs, mode: prefs.guidance === "escolho" ? "full" : "simple" },
    });

  await logActivity(
    session.username,
    "review",
    `Caminho escolhido: ${pathFor(prefs).namePt}`,
    3
  ).catch(() => {});
  revalidatePath("/", "layout");
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
