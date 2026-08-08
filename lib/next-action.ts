import { and, asc, eq } from "drizzle-orm";
import { getDb, homework, units } from "@/lib/db";
import { getCourseProgress } from "@/lib/actions/course";
import { getCefrFor, hasBeenPlaced } from "@/lib/data";
import { countDue } from "@/lib/srs";

/**
 * "What do I do now?" — resolved on the server, deterministically.
 *
 * The app has ~20 destinations behind two grids of identical tiles, which
 * leaves every session starting with a decision. This answers it with ONE
 * primary action, chosen from real state in priority order. No AI call: it
 * must be instant and free, because it renders on every dashboard load.
 *
 * Order is deliberate — placement first (everything downstream is pitched
 * off it), then the things with a deadline or a decay cost, then forward
 * progress, then a default that is never a dead end.
 */
export type NextAction = {
  href: string;
  emoji: string;
  /** Portuguese, imperative — the button. */
  label: string;
  /** English, one line — why this, now. */
  why: string;
};

export async function resolveNextAction(
  username: string,
  displayName: string
): Promise<NextAction> {
  const db = getDb();

  const [placed, due, openHw] = await Promise.all([
    hasBeenPlaced(username).catch(() => true),
    countDue(username).catch(() => 0),
    db
      .select({ id: homework.id, title: homework.title })
      .from(homework)
      .where(and(eq(homework.username, username), eq(homework.status, "open")))
      .orderBy(asc(homework.createdAt))
      .limit(1)
      .catch(() => []),
  ]);

  if (!placed) {
    return {
      href: "/placement",
      emoji: "🧭",
      label: "Descobre o teu nível",
      why: "Five minutes. Everything after this gets pitched at what you can actually do.",
    };
  }

  // Placed but the course is untouched: starting it beats everything else.
  // This is the gap that made placement feel like a dead end — you got a
  // level and were left to find the 126 units on your own.
  const course = await getCourseProgress().catch(() => null);
  if (course && course.unitsTotal > 0 && course.unitsDone === 0 && course.unitsStarted === 0 && course.next) {
    return {
      href: `/unidades/${course.next.slug}`,
      emoji: "🎓",
      label: "Começar o teu curso",
      why: `${course.unitsTotal} unidades em ${course.level}, a começar por “${course.next.title}”.`,
    };
  }

  if (due > 0) {
    return {
      href: "/practice/rever",
      emoji: "🔁",
      label: `Rever ${due} ${due === 1 ? "cartão" : "cartões"}`,
      why: "These are due today — reviewing now is what stops you forgetting them.",
    };
  }

  if (openHw.length > 0) {
    return {
      href: `/homework/${openHw[0].id}`,
      emoji: "✍️",
      label: "Fazer o TPC",
      why: `“${openHw[0].title}” is waiting, and Luna marks each answer as you go.`,
    };
  }

  // Forward progress along the course spine: the first unit AT THE LEARNER'S
  // OWN LEVEL, in syllabus order. (Not the newest unit — with a full A1→B2
  // syllabus seeded, "newest" is the last B2 unit, which is nobody's next step.)
  const cefr = await getCefrFor(username);
  const [unit] = await db
    .select({ slug: units.slug, title: units.title })
    .from(units)
    .where(and(eq(units.status, "published"), eq(units.cefr, cefr)))
    .orderBy(asc(units.sortOrder), asc(units.id))
    .limit(1)
    .catch(() => []);
  if (unit) {
    return {
      href: `/unidades/${unit.slug}`,
      emoji: "🧩",
      label: "Continuar a unidade",
      why: `“${unit.title}” — read the note, then work the path through it.`,
    };
  }

  // Nothing pending and nothing to continue: talk. Never a dead end.
  return {
    href: "/practice/conversa",
    emoji: "💬",
    label: "Falar com a Luna",
    why: `Nothing is due, ${displayName} — so spend five minutes actually speaking.`,
  };
}
