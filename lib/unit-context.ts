import { and, eq } from "drizzle-orm";
import { getDb, unitItems, units } from "@/lib/db";

/**
 * The unit a learner arrived from, when an activity is opened from a course path.
 *
 * Path links carry `?unidade=<slug>&item=<id>`. Before this existed, every
 * destination threw that away: no screen in the app ever showed the unit's
 * name, and only two of fifteen offered a way back. An activity that cannot
 * say where it came from cannot feel like part of a course.
 */
export type UnitContext = {
  slug: string;
  title: string;
  titlePt: string;
  /** The path item being fulfilled, so the activity can tick itself off. */
  itemId: number | null;
};

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

/**
 * Resolve `?unidade=&item=` into a real unit, or null when the learner came in
 * some other way. Validates that the item genuinely belongs to that unit, so a
 * hand-edited URL cannot tick an unrelated step.
 */
export async function unitContextFrom(
  searchParams: Record<string, string | string[] | undefined>
): Promise<UnitContext | null> {
  const slug = one(searchParams.unidade).slice(0, 120);
  if (!slug) return null;

  const db = getDb();
  const [unit] = await db
    .select({
      id: units.id,
      slug: units.slug,
      title: units.title,
      titlePt: units.titlePt,
    })
    .from(units)
    .where(eq(units.slug, slug))
    .limit(1);
  if (!unit) return null;

  const asked = Number(one(searchParams.item));
  let itemId: number | null = null;
  if (Number.isInteger(asked) && asked > 0) {
    const [item] = await db
      .select({ id: unitItems.id })
      .from(unitItems)
      .where(and(eq(unitItems.id, asked), eq(unitItems.unitId, unit.id)))
      .limit(1);
    itemId = item?.id ?? null;
  }

  return {
    slug: unit.slug,
    title: unit.title,
    titlePt: unit.titlePt,
    itemId,
  };
}
