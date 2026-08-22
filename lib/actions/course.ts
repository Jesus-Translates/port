"use server";

import { cache } from "react";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { getCefrFor, logActivity } from "@/lib/data";
import { getDb, unitItems, unitProgress, units } from "@/lib/db";

/** What a unit looks like on a progress bar. */
export type UnitPct = {
  unitId: number;
  done: number;
  total: number;
  pct: number;
};

export type ItemResult =
  | { ok: true; done: number; total: number; pct: number }
  | { ok: false; error: string };

function pctOf(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(done, total) / total) * 100);
}

/** done/total for ONE unit and ONE learner. Two plain counts, each with its
 *  own WHERE — never a sub-select referencing the outer table (see
 *  getUnitProgress for why that shape is banned in this file). */
async function unitTally(
  username: string,
  unitId: number
): Promise<{ done: number; total: number; pct: number }> {
  const db = getDb();
  const [[totalRow], [doneRow]] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(unitItems)
      .where(eq(unitItems.unitId, unitId)),
    db
      .select({ n: sql<number>`count(distinct ${unitProgress.itemId})::int` })
      .from(unitProgress)
      .where(
        and(
          eq(unitProgress.username, username),
          eq(unitProgress.unitId, unitId)
        )
      ),
  ]);
  const total = Number(totalRow?.n ?? 0);
  const done = Math.min(Number(doneRow?.n ?? 0), total);
  return { done, total, pct: pctOf(done, total) };
}

/** The item plus the slug we need to revalidate, in one round-trip. */
async function loadItem(itemId: number) {
  const [row] = await getDb()
    .select({
      id: unitItems.id,
      unitId: unitItems.unitId,
      titlePt: unitItems.titlePt,
      kind: unitItems.kind,
      slug: units.slug,
      unitTitle: units.title,
    })
    .from(unitItems)
    .innerJoin(units, eq(units.id, unitItems.unitId))
    .where(eq(unitItems.id, itemId))
    .limit(1);
  return row ?? null;
}

/**
 * Tick one path item off for the learner who is signed in.
 *
 * The (username, item_id) uniqueness is enforced by an index in the database,
 * so this is a single atomic insert. It used to be a read-then-write, which
 * two tabs could race through — both saw "not done", both inserted, and XP
 * was awarded twice into the family leaderboard.
 */
export async function completeItem(
  itemId: number,
  score?: number | null
): Promise<ItemResult> {
  const session = await requireSession();
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { ok: false, error: "Atividade inválida." };
  }

  const item = await loadItem(itemId);
  if (!item) return { ok: false, error: "Esta atividade já não existe." };

  const db = getDb();
  const clean =
    typeof score === "number" && Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : null;

  const inserted = await db
    .insert(unitProgress)
    .values({
      username: session.username,
      unitId: item.unitId,
      itemId,
      score: clean,
    })
    .onConflictDoNothing({
      target: [unitProgress.username, unitProgress.itemId],
    })
    .returning({ id: unitProgress.id });

  // XP only when this really was a new completion. Re-ticking an item the
  // learner already finished must never pay out again.
  if (inserted.length > 0) {
    await logActivity(
      session.username,
      "unidade",
      `${item.titlePt || "Atividade"} — ${item.unitTitle}`,
      6
    );
  }

  revalidatePath(`/unidades/${item.slug}`);
  revalidatePath("/unidades");
  return { ok: true, ...(await unitTally(session.username, item.unitId)) };
}

/** Untick an item — ticking the wrong row must never be permanent. */
export async function uncompleteItem(itemId: number): Promise<ItemResult> {
  const session = await requireSession();
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { ok: false, error: "Atividade inválida." };
  }

  const item = await loadItem(itemId);
  if (!item) return { ok: false, error: "Esta atividade já não existe." };

  // Deletes every row for this learner+item, so a legacy duplicate (there is
  // no unique constraint) can't survive an untick.
  await getDb()
    .delete(unitProgress)
    .where(
      and(
        eq(unitProgress.username, session.username),
        eq(unitProgress.itemId, itemId)
      )
    );

  revalidatePath(`/unidades/${item.slug}`);
  revalidatePath("/unidades");
  return { ok: true, ...(await unitTally(session.username, item.unitId)) };
}

/**
 * Completion for a whole list of units at once — for the /unidades index.
 *
 * TWO GROUPED QUERIES + a Map, deliberately. Do NOT "simplify" this into a
 * correlated sub-select like
 *   sql`(select count(*) from ${unitItems} where ${unitItems.unitId} = ${units.id})`
 * — drizzle renders `${units.id}` unqualified inside the sub-select, Postgres
 * resolves the bare column against the INNER table, and every count comes back
 * wrong (zeros) without erroring. That has bitten this repo twice.
 */
export async function getUnitProgress(
  unitIds: number[]
): Promise<UnitPct[]> {
  // Every exported function in a "use server" file is a callable endpoint, so
  // the learner is taken from the session — never from an argument.
  const { username: who } = await requireSession();

  const ids = [...new Set(unitIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (ids.length === 0) return [];

  const db = getDb();
  const [totals, dones] = await Promise.all([
    db
      .select({ unitId: unitItems.unitId, n: sql<number>`count(*)::int` })
      .from(unitItems)
      .where(inArray(unitItems.unitId, ids))
      .groupBy(unitItems.unitId),
    db
      .select({
        unitId: unitProgress.unitId,
        // distinct is belt-and-braces: a unique index now prevents duplicates.
        n: sql<number>`count(distinct ${unitProgress.itemId})::int`,
      })
      .from(unitProgress)
      .where(and(eq(unitProgress.username, who), inArray(unitProgress.unitId, ids)))
      .groupBy(unitProgress.unitId),
  ]);

  const totalBy = new Map(totals.map((r) => [r.unitId, Number(r.n)]));
  const doneBy = new Map(dones.map((r) => [r.unitId, Number(r.n)]));

  return ids.map((unitId) => {
    const total = totalBy.get(unitId) ?? 0;
    const done = Math.min(doneBy.get(unitId) ?? 0, total);
    return { unitId, done, total, pct: pctOf(done, total) };
  });
}

/** The item ids this learner has already ticked in ONE unit. */
export async function getCompletedItemIds(
  unitId: number
): Promise<number[]> {
  const { username: who } = await requireSession();
  if (!Number.isInteger(unitId) || unitId <= 0) return [];
  const rows = await getDb()
    .select({ itemId: unitProgress.itemId })
    .from(unitProgress)
    .where(and(eq(unitProgress.username, who), eq(unitProgress.unitId, unitId)));
  return [...new Set(rows.map((r) => r.itemId))];
}

/**
 * Where this learner should START the course, given their placement level.
 *
 * The placement quiz used to end by announcing a level and nothing else — the
 * learner was told their defaults had changed and left to find the course on
 * their own. This is what turns a score into a next step.
 */
export async function getStartUnit(): Promise<{
  slug: string;
  title: string;
  titlePt: string;
  cefr: string;
} | null> {
  const session = await requireSession();
  const cefr = await getCefrFor(session.username);
  const db = getDb();

  // The first unit at their level that they have not already finished.
  const rows = await db
    .select({
      id: units.id,
      slug: units.slug,
      title: units.title,
      titlePt: units.titlePt,
      cefr: units.cefr,
    })
    .from(units)
    .where(and(eq(units.status, "published"), eq(units.cefr, cefr)))
    .orderBy(asc(units.sortOrder), asc(units.id))
    .limit(40);
  if (rows.length === 0) return null;

  const pcts = await getUnitProgress(rows.map((r) => r.id));
  const doneIds = new Set(
    pcts.filter((p) => p.total > 0 && p.done >= p.total).map((p) => p.unitId)
  );
  const next = rows.find((r) => !doneIds.has(r.id)) ?? rows[0];
  return {
    slug: next.slug,
    title: next.title,
    titlePt: next.titlePt,
    cefr: next.cefr,
  };
}

export type CourseProgress = {
  level: string;
  unitsTotal: number;
  unitsDone: number;
  unitsStarted: number;
  pct: number;
  next: { slug: string; title: string; titlePt: string } | null;
};

/**
 * The learner's whole course at a glance: how far through their level they
 * are, and which unit is next.
 *
 * Placement assigns a level; this is what makes that assignment feel like an
 * actual course rather than a label on a dropdown.
 *
 * cache() lives on an inner function because a "use server" file may only
 * export async functions. Safe: completeAndNext writes unit_progress BEFORE
 * its first read, so the memoised value is always post-write.
 */
const courseProgress = cache(async (): Promise<CourseProgress> => {
  const session = await requireSession();
  const level = await getCefrFor(session.username);
  const db = getDb();

  const rows = await db
    .select({
      id: units.id,
      slug: units.slug,
      title: units.title,
      titlePt: units.titlePt,
    })
    .from(units)
    .where(and(eq(units.status, "published"), eq(units.cefr, level)))
    .orderBy(asc(units.sortOrder), asc(units.id));

  const empty: CourseProgress = {
    level,
    unitsTotal: rows.length,
    unitsDone: 0,
    unitsStarted: 0,
    pct: 0,
    next: rows[0]
      ? { slug: rows[0].slug, title: rows[0].title, titlePt: rows[0].titlePt }
      : null,
  };
  if (rows.length === 0) return empty;

  const pcts = await getUnitProgress(rows.map((r) => r.id));
  const byId = new Map(pcts.map((p) => [p.unitId, p]));
  const done = new Set<number>();
  let started = 0;
  for (const r of rows) {
    const p = byId.get(r.id);
    if (!p) continue;
    if (p.total > 0 && p.done >= p.total) done.add(r.id);
    else if (p.done > 0) started += 1;
  }
  const nextRow = rows.find((r) => !done.has(r.id)) ?? null;

  return {
    level,
    unitsTotal: rows.length,
    unitsDone: done.size,
    unitsStarted: started,
    pct: pctOf(done.size, rows.length),
    next: nextRow
      ? { slug: nextRow.slug, title: nextRow.title, titlePt: nextRow.titlePt }
      : null,
  };
});

export async function getCourseProgress(): Promise<CourseProgress> {
  return courseProgress();
}

export type NextDestination =
  | { kind: "step"; href: string; label: string; index: number; total: number }
  | { kind: "unit"; href: string; title: string }
  | { kind: "done"; href: string };

/**
 * Finish this activity and say where to go next.
 *
 * The end of a lesson used to offer one button: back to the unit, to pick the
 * next thing from a list. That is a decision at exactly the moment the learner
 * has momentum. This ticks the item off and hands back the NEXT step's href —
 * within the unit while steps remain, then the next unit, then an honest "you
 * have finished this level".
 */
export async function completeAndNext(
  itemId: number,
  score?: number | null
): Promise<NextDestination> {
  await completeItem(itemId, score ?? null).catch(() => null);

  const row = await loadItem(itemId);
  if (row) {
    const { firstUnfinishedStep } = await import("@/lib/next-step");
    const step = await firstUnfinishedStep(row.slug).catch(() => null);
    if (step) {
      return {
        kind: "step",
        href: step.href,
        label: step.label,
        index: step.index,
        total: step.total,
      };
    }
  }

  // Unit finished: move to the next one rather than dead-ending on a page
  // whose every item is ticked.
  const course = await getCourseProgress().catch(() => null);
  if (course?.next && course.next.slug !== row?.slug) {
    return {
      kind: "unit",
      href: `/unidades/${course.next.slug}`,
      title: course.next.title,
    };
  }
  return { kind: "done", href: "/" };
}

/**
 * The learner's stretch of calçada: the units at their level, as stones.
 *
 * "Current" is the FIRST unfinished unit in syllabus order — the same rule the
 * unit list uses for "A seguir", so the path and the list can never disagree
 * about where you are.
 *
 * Units AHEAD are not locked. The path says where you are, it does not decide
 * where you may go: an adult who wants to read next week's unit tonight, or
 * skip a topic they already know, should not be told no by their own
 * textbook. The stones ahead simply look quieter than the one you are on.
 *
 * Nine at most. The design's weave is nine offsets, and a longer path stops
 * being a glance and becomes a scroll.
 */
export async function getCaminho(
  limit = 9
): Promise<{ slug: string; label: string; state: "done" | "current" | "ahead" }[]> {
  const session = await requireSession();
  const level = await getCefrFor(session.username);
  const db = getDb();

  const rows = await db
    .select({
      id: units.id,
      slug: units.slug,
      title: units.title,
      titlePt: units.titlePt,
    })
    .from(units)
    .where(and(eq(units.status, "published"), eq(units.cefr, level)))
    .orderBy(asc(units.sortOrder), asc(units.id));
  if (rows.length === 0) return [];

  const pcts = await getUnitProgress(rows.map((r) => r.id));
  const pctFor = new Map(pcts.map((p) => [p.unitId, p.pct]));

  const currentIndex = rows.findIndex((r) => (pctFor.get(r.id) ?? 0) < 100);

  // Window the path around where they actually are, so someone twenty units in
  // does not get nine finished stones and no next step.
  const start =
    currentIndex < 0
      ? Math.max(0, rows.length - limit)
      : Math.max(0, Math.min(currentIndex - 2, rows.length - limit));

  return rows.slice(start, start + limit).map((r, i) => {
    const absolute = start + i;
    const pct = pctFor.get(r.id) ?? 0;
    return {
      slug: r.slug,
      label: r.titlePt || r.title,
      state:
        pct >= 100
          ? ("done" as const)
          : absolute === currentIndex
            ? ("current" as const)
            : ("ahead" as const),
    };
  });
}

/**
 * Where "Concluir e seguir" WILL go, without completing anything.
 *
 * The hand-off card names the next session before you press the button —
 * "A seguir: 6 palavras para rever · 2 min" — so the destination has to be
 * resolvable up front. The current item is treated as already finished,
 * because from the learner's point of view it is: they are looking at its
 * completion screen.
 *
 * Read-only. It must never tick anything off, or opening a completion screen
 * would complete the step by merely rendering.
 */
export async function peekNextStep(
  itemId: number
): Promise<NextDestination | null> {
  await requireSession();
  const row = await loadItem(itemId);
  if (row) {
    const { firstUnfinishedStep } = await import("@/lib/next-step");
    const step = await firstUnfinishedStep(row.slug, itemId).catch(() => null);
    if (step) {
      return {
        kind: "step",
        href: step.href,
        label: step.label,
        index: step.index,
        total: step.total,
      };
    }
  }
  const course = await getCourseProgress().catch(() => null);
  if (course?.next && course.next.slug !== row?.slug) {
    return {
      kind: "unit",
      href: `/unidades/${course.next.slug}`,
      title: course.next.title,
    };
  }
  return { kind: "done", href: "/" };
}

/**
 * Mark a generated lesson finished.
 *
 * Lessons had no end. You read to the bottom and the page simply stopped —
 * nothing to press, nothing recorded, no XP, and no way to tell tomorrow
 * whether you had read it. Every other activity in the app finishes with
 * something; this one just trailed off, which is exactly as confusing as it
 * sounds.
 *
 * There is no completion column on `lessons`, and adding one would need a
 * per-user join table because a lesson is shared content. An activity row is
 * how the rest of the app records "somebody did a thing today" — it feeds the
 * streak, the daily goal and the family feed — so that is what this writes.
 * A lesson opened FROM a course step ticks that step instead, through
 * UnitContinue, which is the stronger record.
 */
export async function finishLesson(title: string): Promise<void> {
  const session = await requireSession();
  await logActivity(
    session.username,
    "lesson",
    `Leu a lição “${String(title).slice(0, 80)}”`,
    5
  ).catch(() => {});
  revalidatePath("/workbook");
  revalidatePath("/");
}
