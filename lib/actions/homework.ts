"use server";

import { generateText, Output } from "ai";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FEEDBACK_COACHING,
  homeworkGenSchema,
  getModel,
  itemFeedbackSchema,
  PT_STYLE,
} from "@/lib/ai";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, homework } from "@/lib/db";
import { addMistakeCard } from "@/lib/srs";
import { modelId, recordUsage } from "@/lib/usage";
import {
  type HomeworkItem,
  introBefore,
  itemProgress,
  parseItemsFromMarkdown,
} from "@/lib/homework-items";

export async function createHomework(formData: FormData) {
  const session = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  if (!title || !instructions) return;
  const db = getDb();
  // Split pasted class homework into individually answerable exercises; when
  // that works, keep only the intro as prose so exercises aren't shown twice.
  const parsed = parseItemsFromMarkdown(instructions);
  const [row] = await db
    .insert(homework)
    .values({
      username: session.username,
      title,
      instructions:
        parsed.length > 0 ? introBefore(instructions) || title : instructions,
      items: parsed.length > 0 ? parsed : null,
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
  displayName: string,
  username: string
): Promise<boolean> {
  const db = getDb();
  try {
    const { text, usage } = await generateText({
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
    await recordUsage(username, "grade", modelId(), usage);
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

export async function submitHomework(id: number, responseRaw: string) {
  const session = await requireSession();
  const response = responseRaw.trim().slice(0, 8000);
  if (!response) return;
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
    session.displayName,
    session.username
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
  await gradeWithLuna(
    id,
    hw.instructions,
    hw.response,
    session.displayName,
    session.username
  );
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

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: homeworkGenSchema }),
    instructions: `You are Luna, a European Portuguese tutor. ${PT_STYLE}
The learner brought homework from their Portuguese class. Enhance it: keep the original meaning but return an improved version
that appends a "## ✨ Extras da Luna" markdown section with: key vocabulary they'll need (pt → en), one worked example,
and 1-2 bonus mini-exercises in the same spirit. Return the FULL instructions (original + extras) in the instructions field,
and keep the original title unless it has none.`,
    prompt: `Title: ${hw.title}\n\nAssignment:\n${hw.instructions}`,
  });

  await recordUsage(session.username, "homework", modelId(), usage);
  await db
    .update(homework)
    .set({ title: output.title || hw.title, instructions: output.instructions })
    .where(eq(homework.id, id));

  await logActivity(session.username, "homework", `Enhanced “${hw.title}” with Luna`, 5);
  revalidatePath(`/homework/${id}`);
}

/** Grade one item's answer with Luna. Returns the graded item; on AI failure
 *  the answer is kept with correct=null (an explicit "ungraded" state). */
async function gradeOneItem(
  hwTitle: string,
  item: HomeworkItem,
  answer: string,
  displayName: string,
  username: string
): Promise<HomeworkItem> {
  try {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: itemFeedbackSchema }),
      instructions: `You are Luna, a warm European Portuguese tutor giving instant feedback on ONE homework answer from a learner (${displayName}).
${PT_STYLE}
Accept natural variation (contractions, optional subject pronouns, synonyms). Right meaning with only spelling/accent
slips counts as correct with verdict "quase". If the task asked them to write freely, judge whether the Portuguese is
correct, not whether it matches an expected answer.
${FEEDBACK_COACHING}`,
      prompt: `ASSIGNMENT: ${hwTitle}
EXERCISE ${item.n}${item.section ? ` (${item.section})` : ""}: ${item.prompt}${item.hint ? `\nHINT GIVEN: ${item.hint}` : ""}

${displayName.toUpperCase()}'S ANSWER: ${answer}`,
    });
    await recordUsage(username, "grade", modelId(), usage);
    // Errors become review cards — the review deck is where they get fixed.
    if (output.correct === false && output.correctedPt) {
      await addMistakeCard(username, item.prompt, output.correctedPt, output.tip);
    }
    return {
      ...item,
      answer,
      correct: output.correct,
      verdict: output.verdict,
      correctedPt: output.correctedPt,
      feedbackMd: output.feedbackMd,
      tip: output.tip,
    };
  } catch {
    // Never lose the answer just because the tutor call failed: correct stays
    // null so the UI shows "ungraded", not "wrong".
    return {
      ...item,
      answer,
      correct: null,
      verdict: null,
      correctedPt: null,
      tip: null,
      feedbackMd: null,
    };
  }
}

/** Atomically write ONE item into the jsonb array (no read-modify-write of the
 *  whole array — a slow grade + a second device must not erase each other),
 *  then recompute status from what's actually stored. */
async function writeItem(
  id: number,
  idx: number,
  item: HomeworkItem,
  firstSubmit: boolean
): Promise<{ items: HomeworkItem[]; allDone: boolean }> {
  const db = getDb();
  const [row] = await db
    .update(homework)
    .set({
      items: sql`jsonb_set(${homework.items}, ARRAY[${String(idx)}]::text[], ${JSON.stringify(item)}::jsonb)`,
      ...(firstSubmit ? { submittedAt: new Date() } : {}),
    })
    .where(eq(homework.id, id))
    .returning({ items: homework.items });
  const items = (row?.items as HomeworkItem[]) ?? [];
  const { allDone } = itemProgress(items);
  await db
    .update(homework)
    .set({ status: allDone ? "reviewed" : "submitted" })
    .where(eq(homework.id, id));
  return { items, allDone };
}

/**
 * Answer ONE exercise and get Luna's feedback straight away, so the next
 * answer can be better.
 */
export async function submitHomeworkItem(
  id: number,
  n: number,
  answer: string
): Promise<HomeworkItem | null> {
  const session = await requireSession();
  const clean = answer.trim().slice(0, 4000);
  if (!clean) return null;
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username) return null;

  const items = (hw.items as HomeworkItem[] | null) ?? [];
  const idx = items.findIndex((i) => i.n === n);
  if (idx === -1) return null;

  const graded = await gradeOneItem(
    hw.title,
    items[idx],
    clean,
    session.displayName,
    session.username
  );
  const { allDone } = await writeItem(id, idx, graded, hw.submittedAt === null);

  await logActivity(
    session.username,
    "homework",
    allDone
      ? `Finished “${hw.title}”`
      : `Answered question ${n} of “${hw.title}”`,
    allDone ? 12 : 4
  );
  revalidatePath("/homework");
  revalidatePath(`/homework/${id}`);
  return graded;
}

/** Re-run grading for an answered item whose grading call failed. No XP. */
export async function regradeHomeworkItem(id: number, n: number) {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username) return;
  const items = (hw.items as HomeworkItem[] | null) ?? [];
  const idx = items.findIndex((i) => i.n === n);
  const item = idx === -1 ? undefined : items[idx];
  if (!item || item.answer === null || item.correct !== null) return;

  const graded = await gradeOneItem(
    hw.title,
    item,
    item.answer,
    session.displayName,
    session.username
  );
  await writeItem(id, idx, graded, false);
  revalidatePath(`/homework/${id}`);
}

/** Clear one answer so it can be attempted again. */
export async function retryHomeworkItem(id: number, n: number) {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username) return;
  const items = (hw.items as HomeworkItem[] | null) ?? [];
  const idx = items.findIndex((i) => i.n === n);
  if (idx === -1) return;
  const reset: HomeworkItem = {
    ...items[idx],
    answer: null,
    feedbackMd: null,
    correctedPt: null,
    correct: null,
    verdict: null,
    tip: null,
  };
  await writeItem(id, idx, reset, false);
  revalidatePath(`/homework/${id}`);
}

/** Turn a legacy/pasted assignment into per-question items on demand. */
export async function splitIntoItems(id: number) {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select()
    .from(homework)
    .where(eq(homework.id, id))
    .limit(1);
  if (!hw || hw.username !== session.username || hw.items) return;
  const parsed = parseItemsFromMarkdown(hw.instructions);
  if (parsed.length === 0) return;
  await db
    .update(homework)
    .set({
      items: parsed,
      // The exercises now live in items — don't render them twice.
      instructions: introBefore(hw.instructions) || hw.title,
    })
    .where(eq(homework.id, id));
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
