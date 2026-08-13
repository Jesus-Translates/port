"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { inMyHousehold } from "@/lib/tenant";
import { logActivity } from "@/lib/data";
import { getDb, notes } from "@/lib/db";

export async function createNote(formData: FormData) {
  const session = await requireSession();
  const title = String(formData.get("title") ?? "").trim() || "Sem título";
  const db = getDb();
  const [row] = await db
    .insert(notes)
    .values({ username: session.username, title })
    .returning({ id: notes.id });
  await logActivity(session.username, "note", `Created note “${title}”`, 5);
  revalidatePath("/notes");
  redirect(`/notes/${row.id}`);
}

// Notes are family-shared: any logged-in user can edit or delete any note.
export async function updateNote(
  id: number,
  data: { title: string; body: string; tags: string }
) {
  await requireSession();
  if (!(await ownsNote(id))) return;
  const db = getDb();
  await db
    .update(notes)
    .set({
      title: data.title.trim() || "Sem título",
      body: data.body,
      tags: data.tags,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id));
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
}

/**
 * Notes are shared WITHIN a household — never across them.
 *
 * Both writes filtered on the id alone, so walking ids let any customer edit
 * or delete another family's notes. The READ path was scoped all along, which
 * is what hid it.
 */
export async function deleteNote(id: number) {
  await requireSession();
  if (!(await ownsNote(id))) return;
  const db = getDb();
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/notes");
  redirect("/notes");
}

/** Is this note one of my household's? Guards both writes. */
async function ownsNote(id: number): Promise<boolean> {
  const [row] = await getDb()
    .select({ username: notes.username })
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1);
  return row ? inMyHousehold(row.username) : Promise.resolve(false);
}
