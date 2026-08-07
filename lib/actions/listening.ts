"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, listeningClips } from "@/lib/db";

/** Log a clip the learner says they've listened through. */
export async function finishListening(clipId: number): Promise<void> {
  const session = await requireSession();
  if (!Number.isInteger(clipId)) return;
  const [clip] = await getDb()
    .select({ title: listeningClips.title })
    .from(listeningClips)
    .where(eq(listeningClips.id, clipId))
    .limit(1);
  if (!clip) return;
  await logActivity(
    session.username,
    "escutar",
    `Ouviu “${clip.title.slice(0, 60)}”`,
    6
  );
  revalidatePath("/escutar");
}
