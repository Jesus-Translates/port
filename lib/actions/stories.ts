"use server";

import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { upsertCard } from "@/lib/srs";

/** Save a glossary word into the reader's review deck. */
export async function saveGlossaryWord(pt: string, en: string) {
  const session = await requireSession();
  await upsertCard({
    username: session.username,
    kind: "story",
    front: en,
    back: pt,
  });
}

/** Log a finished chapter + comprehension score. */
export async function finishStory(
  storyId: number,
  title: string,
  score: number,
  total: number
) {
  const session = await requireSession();
  await logActivity(
    session.username,
    "story",
    `Leu “${title.slice(0, 60)}” — ${score}/${total}`,
    6 + score * 2
  );
}
