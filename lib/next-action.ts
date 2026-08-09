import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { activity, getDb, homework, users } from "@/lib/db";
import { getCourseProgress } from "@/lib/actions/course";
import { onboardingState } from "@/lib/onboarding";
import { countDue } from "@/lib/srs";
import { firstUnfinishedStep } from "@/lib/next-step";
import { DEFAULT_PREFS, dailyGoal, readPrefs } from "@/lib/learning-path";

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
  /** True when there is genuinely nothing left today. */
  done?: boolean;
};

/**
 * Resolve a unit to the exact activity to open, falling back to the unit page
 * when its path has no runnable step left.
 */
async function intoUnit(
  slug: string,
  title: string,
  emoji: string,
  lead: string
): Promise<NextAction> {
  const step = await firstUnfinishedStep(slug).catch(() => null);
  if (!step) {
    return {
      href: `/unidades/${slug}`,
      emoji,
      label: lead,
      why: `“${title}” — read the note, then work the path through it.`,
    };
  }
  return {
    href: step.href,
    emoji,
    label: lead,
    why: `“${title}” · passo ${step.index} de ${step.total} — ${step.label}`,
  };
}

export async function resolveNextAction(
  username: string,
  displayName: string
): Promise<NextAction> {
  const db = getDb();

  const [due, openHw, doneToday, prefs] = await Promise.all([
    countDue(username).catch(() => 0),
    db
      .select({ id: homework.id, title: homework.title })
      .from(homework)
      .where(and(eq(homework.username, username), eq(homework.status, "open")))
      .orderBy(asc(homework.createdAt))
      .limit(1)
      .catch(() => []),
    // What counts as "work" today. Kudos and admin notes are not activities the
    // learner did, so they must not tick the day off on their behalf.
    db
      .select({ n: sql<number>`count(*)` })
      .from(activity)
      .where(
        and(
          eq(activity.username, username),
          sql`${activity.createdAt} >= date_trunc('day', now())`,
          inArray(activity.kind, ["review", "jogo", "homework", "quiz", "falar"])
        )
      )
      .then((r) => Number(r[0]?.n ?? 0))
      .catch(() => 0),
    db
      .select({ prefs: users.prefs })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .then((r) => readPrefs(r[0]?.prefs))
      .catch(() => null),
  ]);

  // First run is a sequence, not a pile: where you live, then your level,
  // then how you like to learn — each answer makes the next step better, and
  // the course is waiting at the end of it.
  const onboarding = await onboardingState(username).catch(() => null);
  if (onboarding?.required) {
    const label =
      onboarding.step === "place"
        ? "Começar por aqui"
        : onboarding.step === "level"
          ? "Descobre o teu nível"
          : "Como gostas de aprender?";
    return {
      href: "/bem-vindo",
      emoji: "🧭",
      label,
      why: `Passo ${onboarding.index} de ${onboarding.total} — five minutes, and everything after is pitched at you.`,
    };
  }

  // Placed but the course is untouched: starting it beats everything else.
  // This is the gap that made placement feel like a dead end — you got a
  // level and were left to find the 126 units on your own.
  const course = await getCourseProgress().catch(() => null);
  if (course && course.unitsTotal > 0 && course.unitsDone === 0 && course.unitsStarted === 0 && course.next) {
    return intoUnit(
      course.next.slug,
      course.next.title,
      "🎓",
      "Começar o teu curso"
    );
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
      why: `“${openHw[0].title}” is waiting, and Sandra marks each answer as you go.`,
    };
  }

  // Forward progress along the course spine. Use the SAME resolver the course
  // card uses — selecting by sortOrder alone ignored what you had finished, so
  // the hero could say "continue X" while the card below said "continue Y".
  // The day's goal is met and nothing is overdue: stop asking for more. The
  // learner most likely to quit is the one who can never see the end of a day.
  const goal = dailyGoal(prefs ?? DEFAULT_PREFS);
  if (doneToday >= goal) {
    return {
      href: "/practice/conversa",
      emoji: "✅",
      label: "Feito por hoje",
      why: `${doneToday} ${doneToday === 1 ? "atividade" : "atividades"} hoje, ${displayName} — objetivo cumprido. Queres mais? Fala com a Sandra.`,
      done: true,
    };
  }

  if (course?.next) {
    return intoUnit(
      course.next.slug,
      course.next.title,
      "🧩",
      "Continuar a unidade"
    );
  }

  // Genuinely nothing pending: say so and stop. An app that never admits you
  // are finished is an app that nags, and the learner most likely to give up
  // is the one who can never see the end of a day.
  return {
    href: "/practice/conversa",
    emoji: "✅",
    label: "Feito por hoje",
    why: `Nothing is due and the course is up to date, ${displayName}. Want more? Five minutes talking to Sandra.`,
    done: true,
  };
}
