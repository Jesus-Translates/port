"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getDb, units } from "@/lib/db";

export type UnitStatus = "draft" | "published";

/** Every unit lands as a draft; only Kelly (or an admin) puts it in front of
 *  the class. Revalidate the index and the unit itself so the chip flips. */
export async function setUnitStatus(id: number, status: UnitStatus) {
  await requireStaff();
  if (!Number.isInteger(id) || id <= 0) return;
  if (status !== "draft" && status !== "published") return;

  const [row] = await getDb()
    .update(units)
    .set({ status })
    .where(eq(units.id, id))
    .returning({ slug: units.slug });

  revalidatePath("/unidades");
  revalidatePath("/admin");
  if (row) revalidatePath(`/unidades/${row.slug}`);
}

export async function deleteUnit(id: number) {
  await requireStaff();
  if (!Number.isInteger(id) || id <= 0) return;

  // unit_items cascade on the FK, so one delete is enough.
  const [row] = await getDb()
    .delete(units)
    .where(eq(units.id, id))
    .returning({ slug: units.slug });

  revalidatePath("/unidades");
  revalidatePath("/admin");
  if (row) revalidatePath(`/unidades/${row.slug}`);
}

/** The teacher's correction pass over the AI's Learning Note. */
export async function updateUnitNote(id: number, noteMd: string) {
  await requireStaff();
  if (!Number.isInteger(id) || id <= 0) return;
  const note = String(noteMd ?? "").slice(0, 20000);

  const [row] = await getDb()
    .update(units)
    .set({ noteMd: note })
    .where(eq(units.id, id))
    .returning({ slug: units.slug });

  revalidatePath("/unidades");
  if (row) revalidatePath(`/unidades/${row.slug}`);
}
