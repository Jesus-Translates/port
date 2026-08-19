import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSmartModel, smartModelId, SANDRA } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { currentStyle } from "@/lib/place";
import { BANK, LEVELS } from "@/lib/placement";
import { getPlacementRecord, savePlacementRecord } from "@/lib/actions/placement";
import { aiDenial, recordUsage } from "@/lib/usage";

export const maxDuration = 60;

/**
 * Sandra reads the placement result and says what it actually means.
 *
 * A CEFR letter is a filing code, not an answer. "You are A2" tells a learner
 * nothing about what they can already do, what tripped them, or what to open
 * first — and the one moment they are most curious about their own Portuguese
 * is the minute after finding out.
 *
 * Everything here is grounded in the run: the questions asked, what was missed
 * and how. The model is given the misses verbatim and told not to invent
 * anything beyond them, because a summary that praises grammar the learner
 * never demonstrated is worse than no summary — it is the app being wrong
 * about them in the first thirty seconds.
 */

const schema = z.object({
  headlineEn: z
    .string()
    .describe(
      "One sentence, ≤ 22 words, naming where this learner actually is. Concrete, never 'you did great'."
    ),
  canDoEn: z
    .array(z.string())
    .max(3)
    .describe(
      "What they DEMONSTRATED in this run — each tied to questions they got right. Empty if they cleared nothing."
    ),
  gapsEn: z
    .array(
      z.object({
        topicEn: z.string().describe("The grammar or vocabulary area, 2-5 words."),
        whyEn: z
          .string()
          .describe("What went wrong, quoting their answer vs the right one where it helps. ≤ 25 words."),
      })
    )
    .max(4)
    .describe("Grounded ONLY in questions they actually missed. Empty if they missed nothing."),
  focusEn: z
    .string()
    .describe("The single thing to work on first, and why it unlocks the most. ≤ 30 words."),
  encouragementPt: z
    .string()
    .describe("One warm closing line in very simple European Portuguese, tu register."),
});

type Miss = {
  id?: unknown;
  given?: unknown;
  mark?: unknown;
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // First summary is essential (bypasses budget so a new learner always gets
  // their result); regenerating one already stored is a normal budgeted call,
  // closing the loop where a blocked household could re-POST this forever.
  const existing = await getPlacementRecord();
  const denied = await aiDenial(session.username, { essential: !existing.summary });
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: {
    level?: unknown;
    perLevel?: unknown;
    nearMisses?: unknown;
    misses?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const level = LEVELS.includes(String(body.level) as never)
    ? String(body.level)
    : "A1";
  const nearMisses = Math.max(0, Math.min(50, Number(body.nearMisses) || 0));

  // Scores per level, filtered to what the client can legitimately report.
  const perLevelRaw = (body.perLevel ?? {}) as Record<string, unknown>;
  const perLevel = LEVELS.map((l) => {
    const v = (perLevelRaw[l] ?? {}) as { right?: unknown; asked?: unknown };
    const asked = Math.max(0, Math.min(20, Number(v.asked) || 0));
    const right = Math.max(0, Math.min(asked, Number(v.right) || 0));
    return { level: l, right, asked };
  }).filter((r) => r.asked > 0);

  /*
   * The misses are re-read from the BANK by id rather than trusted from the
   * request. The client knows which questions it was asked; it does not get to
   * tell the server what the right answer was.
   */
  const misses = (Array.isArray(body.misses) ? body.misses : [])
    .slice(0, 12)
    .map((m: Miss) => {
      const item = BANK.find((i) => i.id === String(m.id));
      if (!item) return null;
      const correct = item.kind === "dictation" ? item.say : item.answer;
      return {
        level: item.level,
        kind: item.kind,
        asked: item.promptEn,
        pt: item.kind === "gap" ? item.promptPt : "",
        correct,
        given: String(m.given ?? "").slice(0, 200),
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const { output, usage } = await generateText({
    model: getSmartModel(),
    output: Output.object({ schema }),
    instructions: `${SANDRA}

You have just marked ${session.displayName}'s placement test and are telling them what it means. ${await currentStyle()}

This is the first thing they read about their own Portuguese, so it sets whether they trust the app.

- Ground EVERYTHING in the run below. Do not credit knowledge they did not demonstrate, and do not invent weaknesses from questions they were never asked. If the test stopped after one section, say plainly that this is a starting point rather than a ceiling.
- gapsEn comes only from questions they actually MISSED. If they missed nothing, return an empty array rather than manufacturing a fault.
- canDoEn comes only from sections they CLEARED. If they cleared none, return an empty array and let the headline carry it.
- Near misses were spelling slips that were marked correct. Mention them only if there were several, and only as a spelling note — never as a knowledge gap.
- Be specific and adult. "Your past tense is inconsistent — you wrote 'comprava' where 'comprei' was needed" beats "keep practising verbs".
- English for everything except encouragementPt, which is European Portuguese: tu register, simple words, warm and short.`,
    prompt: `PLACED AT: ${level}
SECTIONS ATTEMPTED: ${perLevel.map((r) => `${r.level} ${r.right}/${r.asked}`).join(", ") || "none"}
SPELLING SLIPS FORGIVEN: ${nearMisses}
${
  misses.length === 0
    ? "MISSED: nothing."
    : `MISSED:\n${misses
        .map(
          (m) =>
            `- [${m.level}, ${m.kind}] ${m.asked}${m.pt ? ` (${m.pt})` : ""}\n  they answered: "${m.given || "(blank)"}"\n  correct: "${m.correct}"`
        )
        .join("\n")}`
}`,
  });

  // Billed against the model actually used, not the default one.
  await recordUsage(session.username, "grade", smartModelId(), usage);

  // Kept because the questionnaire runs next and builds the plan from exactly
  // these gaps — they have to survive the navigation.
  await savePlacementRecord({
    summary: {
      level,
      headlineEn: output.headlineEn,
      canDoEn: output.canDoEn,
      gaps: output.gapsEn,
      focusEn: output.focusEn,
      encouragementPt: output.encouragementPt,
      at: new Date().toISOString().slice(0, 10),
    },
  });

  /*
   * The answers they got wrong, sent back so the result screen can SHOW them.
   *
   * The test itself now reveals nothing while it runs — that stopped it being
   * re-rollable — which means this is the only moment a learner ever finds out
   * what they actually missed. Themes alone ("your past tense is
   * inconsistent") are not reviewable: you cannot study a theme without the
   * sentence that produced it.
   *
   * Only the items THIS run reported as misses, re-read from the bank above
   * and capped at 12 — this is not an endpoint that will read out the question
   * bank. Fabricating ids to harvest answers would cost an AI call each time
   * and still trip the burst limit in aiDenial.
   */
  return NextResponse.json({
    ...output,
    review: misses.map((m) => ({
      level: m.level,
      asked: m.asked,
      pt: m.pt,
      given: m.given,
      correct: m.correct,
    })),
  });
}
