import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { getDb, users, zonePlaces, zones } from "@/lib/db";
import { PT_STYLE } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { immersionLine, readPrefs } from "@/lib/learning-path";

/**
 * Where the learner lives, and what that means for generated content.
 *
 * Every AI feature invents examples — a market, a bus, a beach. Pinning those
 * to the learner's OWN town is the difference between practising Portuguese
 * and practising the Portuguese you will actually speak this week. The app was
 * hardwired to one family's corner of the coast; this makes that a per-learner
 * fact instead.
 */
export type Place = {
  /** null means we have not asked yet — never guess a town from silence. */
  livesInPortugal: boolean | null;
  /** As typed: "Ericeira", "Lisboa", "Austin, Texas". */
  locality: string | null;
  /** zones.slug — the researched region, when they picked one. */
  zoneSlug: string | null;
  /** zone_places.slug — the optional town inside that zone. */
  placeSlug: string | null;
};

export const EMPTY_PLACE: Place = {
  livesInPortugal: null,
  locality: null,
  zoneSlug: null,
  placeSlug: null,
};

/** Free text from a person, headed for a prompt — keep it short and inert. */
export function cleanLocality(input: unknown): string | null {
  const s = String(input ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>{}]/g, "")
    .trim()
    .slice(0, 80);
  return s.length > 0 ? s : null;
}

export async function getPlace(username: string): Promise<Place> {
  try {
    const [row] = await getDb()
      .select({
        livesInPortugal: users.livesInPortugal,
        locality: users.locality,
        zoneSlug: users.zoneSlug,
        placeSlug: users.placeSlug,
      })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    return {
      livesInPortugal: row?.livesInPortugal ?? null,
      locality: row?.locality ?? null,
      zoneSlug: row?.zoneSlug ?? null,
      placeSlug: row?.placeSlug ?? null,
    };
  } catch {
    // Content generation must never fail because we could not read a preference.
    return EMPTY_PLACE;
  }
}

/**
 * The one paragraph of prompt that localises everything downstream.
 *
 * Living in Portugal and learning from abroad need genuinely different
 * examples — "the queue at your Junta de Freguesia" is useless to someone in
 * Ohio, and "when you visit Portugal" is patronising to someone who lives in
 * Aveiro. So the two cases get different instructions, not one hedged one.
 */
export function placeLine(place: Place): string {
  const where = place.locality?.trim();

  if (place.livesInPortugal && where) {
    return `The learner LIVES in ${where}, Portugal. Set examples in their own town and region: the places, beaches, transport, shops, weather and habits a resident of ${where} would actually recognise, and the errands they really run (o mercado, o multibanco, a farmácia de serviço, a junta de freguesia). Never default to Lisbon or Porto unless that is where they live. Do not explain Portugal to them as a visitor — they live there.`;
  }
  if (place.livesInPortugal) {
    return `The learner lives in Portugal. Use everyday resident contexts — the market, the café, the bus, the pharmacy, dealing with paperwork — not tourist situations.`;
  }
  if (place.livesInPortugal === false && where) {
    return `The learner lives in ${where}, outside Portugal, and is learning European Portuguese for trips, family or a future move. Root examples in their own daily life in ${where} where it fits naturally, and frame Portugal-specific situations (o aeroporto, o café, o mercado, alugar uma casa) as things they are preparing for. Keep every convention strictly pt-PT.`;
  }
  if (place.livesInPortugal === false) {
    return `The learner lives outside Portugal and is learning European Portuguese for trips, family or a future move. Frame Portugal-specific situations as preparation, and keep every convention strictly pt-PT.`;
  }
  // Not asked yet: stay generic rather than inventing a home for them.
  return `Use everyday Portuguese contexts (o mercado, a praia, o autocarro, o multibanco, a farmácia) when inventing examples.`;
}

/**
 * PT_STYLE with the learner's own surroundings folded in. Use this instead of
 * bare PT_STYLE anywhere the signed-in person is known.
 */
/**
 * The researched paragraph for the learner's region, and their town within it.
 *
 * This is what makes "local" mean something. Without it a learner in Faro and
 * one in Braga get the same invented Portuguese village; with it they get the
 * Olhão fish market and Bom Jesus respectively, because a researcher wrote
 * down what is actually there.
 */
async function zoneContextFor(place: Place): Promise<string> {
  if (!place.zoneSlug) return "";
  try {
    const db = getDb();
    const [zone] = await db
      .select({ id: zones.id, namePt: zones.namePt, context: zones.promptContext })
      .from(zones)
      .where(eq(zones.slug, place.zoneSlug))
      .limit(1);
    if (!zone?.context) return "";

    let out = `\nTHE LEARNER'S REGION — ${zone.namePt}. Set examples here, using these specifics: ${zone.context}`;

    if (place.placeSlug) {
      const [town] = await db
        .select({ name: zonePlaces.name, context: zonePlaces.promptContext })
        .from(zonePlaces)
        .where(
          and(eq(zonePlaces.zoneId, zone.id), eq(zonePlaces.slug, place.placeSlug))
        )
        .limit(1);
      if (town?.context) {
        out += `\nThey live specifically in ${town.name}: ${town.context} Prefer ${town.name} itself over anywhere else in the region.`;
      }
    }
    return out;
  } catch {
    // A missing region must never stop a lesson being generated.
    return "";
  }
}

export async function styleFor(username: string): Promise<string> {
  const [place, prefs] = await Promise.all([
    getPlace(username),
    readPrefsFor(username),
  ]);
  const zoneBlock = await zoneContextFor(place);
  // Immersion rides along with the style because every AI surface already
  // appends this — wiring it here reaches all eighteen instead of the three
  // that happen to mention Sandra by name.
  return `${PT_STYLE}\n${placeLine(place)}${zoneBlock}${immersionLine(prefs)}`;
}

export async function readPrefsFor(username: string) {
  try {
    const [row] = await getDb()
      .select({ prefs: users.prefs })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    return readPrefs(row?.prefs);
  } catch {
    return null;
  }
}

/**
 * PT_STYLE localised for whoever is signed in.
 *
 * Resolving the session here rather than threading a username through fifteen
 * prompt builders keeps every call site a one-token change, and cache() means
 * the extra lookup happens once per request no matter how many prompts a route
 * assembles. Falls back to the generic style when there is no session.
 */
/** The signed-in learner's questionnaire answers, cached per request. */
export const currentPrefs = cache(async () => {
  const session = await getSession().catch(() => null);
  return session ? readPrefsFor(session.username) : null;
});

export const currentStyle = cache(async (): Promise<string> => {
  const session = await getSession().catch(() => null);
  return session ? styleFor(session.username) : PT_STYLE;
});
