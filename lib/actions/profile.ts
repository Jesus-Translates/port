"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, users, zonePlaces, zones } from "@/lib/db";
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
  /*
   * Merge over what they already chose, not over the defaults.
   *
   * The signature says Partial, but spreading onto DEFAULT_PREFS meant any
   * single-field update silently reset the other five — flipping immersion
   * from settings would also have thrown away their minutes, their level of
   * help and their games appetite.
   */
  const current = (await getMyPrefs()) ?? DEFAULT_PREFS;
  const prefs =
    readPrefs({ ...DEFAULT_PREFS, ...current, ...input }) ?? DEFAULT_PREFS;
  const changedPath = pathFor(prefs).namePt !== pathFor(current).namePt;

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

  // Only when the PATH actually changed. Logging every save turned a settings
  // toggle into 3 XP a tap, and filled the activity feed with a line that said
  // nothing had happened.
  if (changedPath) {
    await logActivity(
      session.username,
      "review",
      `Caminho escolhido: ${pathFor(prefs).namePt}`,
      3
    ).catch(() => {});
  }
  revalidatePath("/", "layout");
}

/**
 * Mark the "Quem mais vive cá em casa?" onboarding step answered — whether by
 * adding people or by saying it's just me. Skipping IS an answer and must
 * stick: without a stored one, a solo learner would meet the same question on
 * every visit to /bem-vindo, which is the trap the step was told never to be.
 */
export async function finishFamilyStep(): Promise<void> {
  const session = await requireSession();
  // Upsert for the same reason setMyPlace does: a member without a users row
  // yet would otherwise save nothing and stay stuck on the step.
  await getDb()
    .insert(users)
    .values({
      username: session.username,
      displayName: session.displayName,
      familyStepAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.username,
      set: { familyStepAt: new Date() },
    });
  revalidatePath("/bem-vindo");
  // The dashboard's next-action card reads onboarding state too.
  revalidatePath("/");
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

export type ZoneOption = {
  slug: string;
  namePt: string;
  nameEn: string;
  emoji: string;
  places: { slug: string; name: string }[];
};

/**
 * The zone list for the picker, with each zone's towns.
 *
 * Cached across requests (revalidated hourly) and column-PROJECTED: the full
 * row carries each zone's promptContext — a multi-hundred-word researched
 * paragraph used only for AI prompts — which was being shipped over the wire
 * and then mapped away on every /perfil and /bem-vindo render. The picker
 * needs only the labels.
 */
const loadZones = unstable_cache(
  async (): Promise<ZoneOption[]> => {
    const db = getDb();
    const [zoneRows, placeRows] = await Promise.all([
      db
        .select({
          id: zones.id,
          slug: zones.slug,
          namePt: zones.namePt,
          nameEn: zones.nameEn,
          emoji: zones.emoji,
        })
        .from(zones)
        .where(eq(zones.kind, "zone"))
        .orderBy(asc(zones.sortOrder)),
      db
        .select({
          zoneId: zonePlaces.zoneId,
          slug: zonePlaces.slug,
          name: zonePlaces.name,
        })
        .from(zonePlaces)
        .orderBy(asc(zonePlaces.sortOrder)),
    ]);
    // Grouped + Map, never a correlated sub-select.
    const byZone = new Map<number, { slug: string; name: string }[]>();
    for (const p of placeRows) {
      const list = byZone.get(p.zoneId) ?? [];
      list.push({ slug: p.slug, name: p.name });
      byZone.set(p.zoneId, list);
    }
    return zoneRows.map((z) => ({
      slug: z.slug,
      namePt: z.namePt,
      nameEn: z.nameEn,
      emoji: z.emoji,
      places: byZone.get(z.id) ?? [],
    }));
  },
  ["zones-list"],
  { revalidate: 3600 }
);

export async function getZones(): Promise<ZoneOption[]> {
  try {
    return await loadZones();
  } catch {
    return [];
  }
}

/**
 * Save the region, and optionally the town inside it.
 *
 * The zone is the useful answer — it unlocks a researched paragraph of real
 * local detail. The town is a bonus that narrows it further, and is genuinely
 * optional: plenty of people would rather not say exactly where they live.
 */
export async function setMyZone(
  zoneSlug: string,
  placeSlug: string | null
): Promise<void> {
  const session = await requireSession();
  const db = getDb();

  const [zone] = await db
    .select({ id: zones.id, namePt: zones.namePt })
    .from(zones)
    .where(eq(zones.slug, zoneSlug))
    .limit(1);
  if (!zone) throw new Error("Zona desconhecida");

  let place: { slug: string; name: string } | null = null;
  if (placeSlug) {
    const [row] = await db
      .select({ slug: zonePlaces.slug, name: zonePlaces.name })
      .from(zonePlaces)
      .where(and(eq(zonePlaces.zoneId, zone.id), eq(zonePlaces.slug, placeSlug)))
      .limit(1);
    place = row ?? null;
  }

  await db
    .insert(users)
    .values({
      username: session.username,
      displayName: session.displayName,
      livesInPortugal: true,
      zoneSlug,
      placeSlug: place?.slug ?? null,
      // Keep the human-readable locality in step, so existing prompts that
      // read it still say something true.
      locality: place?.name ?? zone.namePt,
    })
    .onConflictDoUpdate({
      target: users.username,
      set: {
        livesInPortugal: true,
        zoneSlug,
        placeSlug: place?.slug ?? null,
        locality: place?.name ?? zone.namePt,
      },
    });

  revalidatePath("/", "layout");
}
