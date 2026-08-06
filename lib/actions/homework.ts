"use server";

import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { homeworkGenSchema, getModel, PT_STYLE } from "@/lib/ai";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, homework } from "@/lib/db";

export async function createHomework(formData: FormData) {
  const session = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  if (!title || !instructions) return;
  const db = getDb();
  const [row] = await db
    .insert(homework)
    .values({
      username: session.username,
      title,
      instructions,
      source: "class",
    })
    .returning({ id: homework.id });
  await logActivity(session.username, "homework", `Added homework “${title}”`, 5);
  revalidatePath("/homework");
  redirect(`/homework/${row.id}`);
}

async function gradeWithLuna(
  id: number,
  instructions: string,
  response: string,
  displayName: string
): Promise<boolean> {
  const db = getDb();
  try {
    const { text } = await generateText({
      model: getModel(),
      instructions: `You are Luna, a kind European Portuguese tutor grading homework from an adult A2 learner.
${PT_STYLE}
Return markdown feedback with exactly these sections:
### O que está ótimo ✨  (2-3 genuine positives, quote their Portuguese)
### Correções 🔧  (each mistake: their sentence → corrected sentence → one-line why; skip if none)
### Nota  (a friendly score out of 10 with one encouraging line)
Keep it warm, specific and compact. English prose, pt-PT examples.`,
      prompt: `THE ASSIGNMENT:\n${instructions}\n\nTHE LEARNER'S ANSWER (by ${displayName}):\n${response}`,
    });
    await db
      .update(homework)
      .set({ feedback: text, status: "reviewed" })
      .where(eq(homework.id, id));
    return true;
  } catch {
    // The answer is safely stored with status "submitted"; grading can be retried.
    return false;
  }
}

export async function submitHomework(id: number, response: string) {
  const session = await requireSession();
  if (!response.trim()) return;
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username || hw.status !== "open") return;

  await db
    .update(homework)
    .set({ response, status: "submitted", submittedAt: new Date() })
    .where(eq(homework.id, id));

  const graded = await gradeWithLuna(
    id,
    hw.instructions,
    response,
    session.displayName
  );

  await logActivity(
    session.username,
    "homework",
    graded
      ? `Submitted “${hw.title}” and got feedback`
      : `Submitted “${hw.title}”`,
    15
  );
  revalidatePath("/homework");
  revalidatePath(`/homework/${id}`);
}

/** Retry grading for an already-submitted homework (e.g. after an AI hiccup). */
export async function requestFeedback(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username || !hw.response) return;
  await gradeWithLuna(id, hw.instructions, hw.response, session.displayName);
  revalidatePath("/homework");
  revalidatePath(`/homework/${id}`);
}

export async function enhanceHomework(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  // Only the assignee may rewrite their assignment, and only before submitting.
  if (!hw || hw.username !== session.username || hw.status !== "open") return;

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: homeworkGenSchema }),
    instructions: `You are Luna, a European Portuguese tutor. ${PT_STYLE}
The learner brought homework from their Portuguese class. Enhance it: keep the original meaning but return an improved version
that appends a "## ✨ Extras da Luna" markdown section with: key vocabulary they'll need (pt → en), one worked example,
and 1-2 bonus mini-exercises in the same spirit. Return the FULL instructions (original + extras) in the instructions field,
and keep the original title unless it has none.`,
    prompt: `Title: ${hw.title}\n\nAssignment:\n${hw.instructions}`,
  });

  await db
    .update(homework)
    .set({ title: output.title || hw.title, instructions: output.instructions })
    .where(eq(homework.id, id));

  await logActivity(session.username, "homework", `Enhanced “${hw.title}” with Luna`, 5);
  revalidatePath(`/homework/${id}`);
}

export async function deleteHomework(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select({ username: homework.username })
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username) return;
  await db.delete(homework).where(eq(homework.id, id));
  revalidatePath("/homework");
  redirect("/homework");
}
