import { and, eq, inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, quizzes, refEntries } from "@/lib/db";
import { getTtsAudio } from "@/lib/tts";
import { budgetState } from "@/lib/budget";
import { inMyHousehold, visibleOwners } from "@/lib/tenant";

export const maxDuration = 60;

/**
 * Serves cached pt-PT audio. Three modes:
 *   ?text=…      arbitrary short text (the caller already knows the words)
 *   ?entry=ID    a phrasebook entry — text stays server-side (used by ditado,
 *                where the whole point is that you can't read the answer)
 *   ?quiz=ID     a listening quiz's audio script (also server-side only)
 *   ?placement=ID a placement dictation item — the whole question is that you
 *                cannot read it, so the sentence never leaves the server
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const p = request.nextUrl.searchParams;
  let text: string | null = null;

  const entryId = Number(p.get("entry"));
  const quizId = Number(p.get("quiz"));
  /*
   * Both id modes are SCOPED.
   *
   * They looked safe because neither returns text to the browser — but they
   * return the AUDIO of it, which is the same disclosure out loud. Walking
   * ids let anyone hear another family's phrasebook additions, or the audio
   * script of a quiz built for their child.
   */
  if (Number.isInteger(entryId) && entryId > 0) {
    const [e] = await getDb()
      .select({ pt: refEntries.pt })
      .from(refEntries)
      .where(
        and(
          eq(refEntries.id, entryId),
          inArray(refEntries.addedBy, await visibleOwners())
        )
      )
      .limit(1);
    // pt only — ditado depends on the listener not being able to read it.
    text = e?.pt ?? null;
  } else if (Number.isInteger(quizId) && quizId > 0) {
    const [q] = await getDb()
      .select({ questions: quizzes.questions, username: quizzes.username })
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);
    const script =
      q && (await inMyHousehold(q.username))
        ? (q.questions as { audioScript?: string } | null)?.audioScript
        : null;
    text = script ?? null;
  } else if (p.get("placement")) {
    const { BANK } = await import("@/lib/placement");
    const item = BANK.find((i) => i.id === p.get("placement"));
    text = item?.kind === "dictation" ? item.say : null;
  } else {
    text = p.get("text");
  }

  if (!text?.trim()) {
    return NextResponse.json({ error: "Sem texto." }, { status: 400 });
  }

  /*
   * The one billable path that had NO gate, and it is the expensive one:
   * speech is ~86% of this app's AI cost. Every /api/ai/* route checks the
   * allowance and this did not, so a household could spend its whole month
   * here without ever touching a gated route.
   *
   * Replay is still free. Only SYNTHESIS is refused, so a family that has
   * used its allowance keeps every clip it already generated.
   */
  const budget = await budgetState();
  const audio = await getTtsAudio(text, session.username, {
    cachedOnly: budget.blocked !== null,
  });
  if (!audio && budget.blocked !== null) {
    return NextResponse.json(
      {
        error:
          budget.blocked === "month"
            ? "A tua família já usou a IA incluída neste mês. O áudio já gerado continua a tocar."
            : "Já usaram bastante IA hoje. O áudio já gerado continua a tocar.",
      },
      { status: 429 }
    );
  }
  if (!audio) {
    return NextResponse.json(
      { error: "Áudio indisponível (OPENAI_API_KEY em falta?)" },
      { status: 503 }
    );
  }

  return new NextResponse(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      // Same text+voice always yields the same clip — cache hard.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
