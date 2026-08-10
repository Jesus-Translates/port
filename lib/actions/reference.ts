"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { categories, getDb, refEntries } from "@/lib/db";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function addCategory(formData: FormData) {
  const session = await requireSession();
  const namePt = String(formData.get("namePt") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "📖";
  if (!namePt || !nameEn) return;

  const db = getDb();
  const slug = slugify(namePt) || `categoria-${Date.now()}`;
  const [row] = await db
    .insert(categories)
    .values({
      slug,
      namePt,
      nameEn,
      emoji,
      sortOrder: 99,
      createdBy: session.username,
    })
    .onConflictDoNothing({ target: categories.slug })
    .returning({ slug: categories.slug });
  await logActivity(session.username, "reference", `Added category ${namePt}`, 5);
  revalidatePath("/reference");
  redirect(`/reference/${row?.slug ?? slug}`);
}

export type NewEntry = {
  kind: string;
  section: string;
  pt: string;
  en: string;
  replyPt?: string;
  replyEn?: string;
  note?: string;
};

export async function addEntry(categoryId: number, slug: string, entry: NewEntry) {
  const session = await requireSession();
  if (!entry.pt.trim() || !entry.en.trim()) return;
  const db = getDb();
  await db.insert(refEntries).values({
    categoryId,
    kind: ["term", "verb", "phrase", "task"].includes(entry.kind)
      ? entry.kind
      : "term",
    section: entry.section.trim() || "Geral",
    pt: entry.pt.trim(),
    en: entry.en.trim(),
    replyPt: entry.replyPt?.trim() || null,
    replyEn: entry.replyEn?.trim() || null,
    note: entry.note?.trim() || null,
    addedBy: session.username,
  });
  await logActivity(
    session.username,
    "reference",
    `Added “${entry.pt.trim()}” to the book`,
    5
  );
  revalidatePath(`/reference/${slug}`);
}

export async function addEntries(
  categoryId: number,
  slug: string,
  entries: NewEntry[]
) {
  const session = await requireSession();
  const clean = entries.filter((e) => e.pt.trim() && e.en.trim());
  if (clean.length === 0) return;
  const db = getDb();
  await db.insert(refEntries).values(
    clean.map((e) => ({
      categoryId,
      kind: ["term", "verb", "phrase", "task"].includes(e.kind) ? e.kind : "term",
      section: e.section.trim() || "Geral",
      pt: e.pt.trim(),
      en: e.en.trim(),
      replyPt: e.replyPt?.trim() || null,
      replyEn: e.replyEn?.trim() || null,
      note: e.note?.trim() || null,
      addedBy: session.username,
    }))
  );
  await logActivity(
    session.username,
    "reference",
    `Added ${clean.length} AI-suggested entries to the book`,
    8
  );
  revalidatePath(`/reference/${slug}`);
}

export async function deleteEntry(id: number, slug: string) {
  await requireSession();
  const db = getDb();
  await db.delete(refEntries).where(eq(refEntries.id, id));
  revalidatePath(`/reference/${slug}`);
}
