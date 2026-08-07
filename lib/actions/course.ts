"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
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
