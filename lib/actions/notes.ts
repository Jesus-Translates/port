"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
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

export async function updateNote(
  id: number,
  data: { title: string; body: string; tags: string }
) {
  const session = await requireSession();
  const db = getDb();
  await db
    .update(notes)
    .set({
      title: data.title.trim() || "Sem título",
      body: data.body,
      tags: data.tags,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, id), eq(notes.username, session.username)));
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
}

export async function deleteNote(id: number) {
  const session = await requireSession();
  const db = getDb();
  await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.username, session.username)));
  revalidatePath("/notes");
  redirect("/notes");
}
