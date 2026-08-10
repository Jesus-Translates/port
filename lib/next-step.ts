import { asc, eq } from "drizzle-orm";
import { categories, getDb, unitItems, units } from "@/lib/db";
import { getCompletedItemIds } from "@/lib/actions/course";
import { resolve, type ItemRow } from "@/lib/unit-href";
import { sortByPath } from "@/lib/learning-path";
import { getMyPrefs } from "@/lib/actions/profile";

/**
 * The first step of a unit the learner has not finished yet.
 *
 * The dashboard used to link at the unit, which meant "start your course" put
 * you on a page listing eight activities and asked you to choose — a decision
 * at exactly the moment the app had promised to remove one. This resolves the
 * whole way to the activity that is actually next.
 */
export type NextStep = {
  href: string;
  /** What the step is, in Portuguese — used as the button's second line. */
  label: string;
  /** How far into the unit this is, for "passo 3 de 8". */
  index: number;
  total: number;
};

export async function firstUnfinishedStep(
  unitSlug: string,
  /**
   * Treat this item as finished even if it is not yet.
   *
   * Lets the hand-off card name the NEXT step before the current one has been
   * ticked off — the redesign shows "A seguir: 6 palavras para rever" while
   * you are still on the completion screen, so the destination has to be
   * known before the button is pressed, not after.
   */
  alsoDone?: number | null
): Promise<NextStep | null> {
  const db = getDb();
  const [unit] = await db
    .select({ id: units.id, slug: units.slug })
    .from(units)
    .where(eq(units.slug, unitSlug))
    .limit(1);
  if (!unit) return null;

  const rows = await db
    .select({
      id: unitItems.id,
      kind: unitItems.kind,
      titlePt: unitItems.titlePt,
      config: unitItems.config,
      catSlug: categories.slug,
      catName: categories.namePt,
    })
    .from(unitItems)
    .leftJoin(categories, eq(categories.id, unitItems.refId))
    .where(eq(unitItems.unitId, unit.id))
    .orderBy(asc(unitItems.sortOrder), asc(unitItems.id));
  if (rows.length === 0) return null;

  const done = new Set(await getCompletedItemIds(unit.id));
  if (alsoDone) done.add(alsoDone);
  // The learner's own ordering decides which activity is "next".
  const ordered = sortByPath(rows, await getMyPrefs().catch(() => null));

  // Only items that resolve to a real screen count as steps — an unresolvable
  // row must not be able to stall the whole path.
  const steps: { id: number; href: string; label: string }[] = [];
  for (const row of ordered) {
    const target = resolve(row as ItemRow, unit.slug);
    if (!target) continue;
    steps.push({
      id: row.id,
      href: target.href,
      label: row.titlePt || target.hint,
    });
  }
  if (steps.length === 0) return null;

  const idx = steps.findIndex((s) => !done.has(s.id));
  if (idx === -1) return null;

  return {
    href: steps[idx].href,
    label: steps[idx].label,
    index: idx + 1,
    total: steps.length,
  };
}
