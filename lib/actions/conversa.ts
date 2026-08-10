"use server";

import { and, desc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import {
  CONVERSA_GOAL,
  CONVERSA_MAX_TURN,
  type StoredMsg,
} from "@/lib/conversa";
import { conversas, getDb } from "@/lib/db";
import { logActivity } from "@/lib/data";

/**
 * Persistence for a conversation with Sandra.
 *
 * Two things were broken without it. Leaving the page threw the whole exchange
 * away, so Sandra was the one part of the app with no memory of you. And the
 * step had no completion point at all: nothing was counted, so nothing could
 * ever be finished.
 *
 * XP is the completion gate. It accumulates on the SERVER from the per-turn
 * judgement, because a score the client can set is a score the learner can
 * set — and this one unlocks course progress.
 */

export type OpenConversa = {
  id: number;
  topic: string;
  voice: string;
  messages: StoredMsg[];
  xp: number;
};

function clean(messages: unknown): StoredMsg[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m): m is StoredMsg => {
      const r = (m as StoredMsg)?.role;
      return (r === "sandra" || r === "eu") && typeof (m as StoredMsg).pt === "string";
    })
    .map((m) => ({ role: m.role, pt: m.pt, en: m.en }));
}

/**
 * The learner's conversation still in progress, if any.
 *
 * Scoped to a unit item when there is one, so a course step resumes its own
 * conversation rather than an unrelated one about the beach.
 */
export async function loadOpenConversa(
  unitItemId?: number | null
): Promise<OpenConversa | null> {
  const session = await requireSession();
  const db = getDb();

  const where = unitItemId
    ? and(
        eq(conversas.username, session.username),
        eq(conversas.status, "open"),
        eq(conversas.unitItemId, unitItemId)
      )
    : and(
        eq(conversas.username, session.username),
        eq(conversas.status, "open")
      );

  const [row] = await db
    .select()
    .from(conversas)
    .where(where)
    .orderBy(desc(conversas.updatedAt))
    .limit(1);
  if (!row) return null;

  return {
    id: row.id,
    topic: row.topic,
    voice: row.voice,
    messages: clean(row.messages),
    xp: row.xp,
  };
}

/** Start a conversation, or reopen the one already in progress for this step. */
export async function startConversa(input: {
  topic: string;
  voice: string;
  cefr: string;
  unitItemId?: number | null;
  messages: StoredMsg[];
}): Promise<{ id: number }> {
  const session = await requireSession();
  const db = getDb();
  const [row] = await db
    .insert(conversas)
    .values({
      username: session.username,
      topic: input.topic.slice(0, 200),
      voice: input.voice.slice(0, 60),
      cefr: input.cefr.slice(0, 8),
      unitItemId: input.unitItemId ?? null,
      messages: clean(input.messages),
      xp: 0,
      status: "open",
    })
    .returning({ id: conversas.id });
  return { id: row.id };
}

/**
 * Record one exchange and the XP the learner's line earned.
 *
 * `turnXp` is clamped here rather than trusted: it arrives from a model, and
 * an unbounded number would let one turn complete the step outright.
 */
export async function saveTurn(input: {
  id: number;
  messages: StoredMsg[];
  turnXp: number;
}): Promise<{ xp: number; done: boolean }> {
  const session = await requireSession();
  const db = getDb();

  const [row] = await db
    .select({ xp: conversas.xp, username: conversas.username })
    .from(conversas)
    .where(eq(conversas.id, input.id))
    .limit(1);
  // Someone else's conversation is not yours to write to.
  if (!row || row.username !== session.username) return { xp: 0, done: false };

  const gain = Math.max(
    0,
    Math.min(CONVERSA_MAX_TURN, Math.round(input.turnXp || 0))
  );
  const xp = Math.min(CONVERSA_GOAL, row.xp + gain);

  await db
    .update(conversas)
    .set({ messages: clean(input.messages), xp, updatedAt: new Date() })
    .where(eq(conversas.id, input.id));

  return { xp, done: xp >= CONVERSA_GOAL };
}

/**
 * Close the conversation.
 *
 * Refuses below the goal: the button that calls this is the course step's
 * completion, and letting it through early would make the gate decorative.
 */
export async function finishConversa(
  id: number
): Promise<{ ok: boolean; xp: number }> {
  const session = await requireSession();
  const db = getDb();

  const [row] = await db
    .select({ xp: conversas.xp, username: conversas.username, topic: conversas.topic })
    .from(conversas)
    .where(eq(conversas.id, id))
    .limit(1);
  if (!row || row.username !== session.username) return { ok: false, xp: 0 };
  if (row.xp < CONVERSA_GOAL) return { ok: false, xp: row.xp };

  await db
    .update(conversas)
    .set({ status: "done", updatedAt: new Date() })
    .where(eq(conversas.id, id));

  await logActivity(
    session.username,
    "tutor",
    `Conversa com a Sandra: ${row.topic}`,
    row.xp
  ).catch(() => {});

  return { ok: true, xp: row.xp };
}
