import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSmartModel, smartModelId, SANDRA } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { getCefrFor } from "@/lib/data";
import { currentStyle } from "@/lib/place";
import { getPlacementRecord, savePlacementRecord } from "@/lib/actions/placement";
import { getMyPrefs } from "@/lib/actions/profile";
import { DEFAULT_PREFS, QUESTIONS } from "@/lib/learning-path";
import { aiDenial, recordUsage } from "@/lib/usage";

export const maxDuration = 60;

/**
 * The plan, built where both halves are finally known.
 *
 * The placement test found the GAPS. The questionnaire that runs straight
 * afterwards found how this person actually wants to study — ten minutes or
 * thirty, games or no games, guided or self-directed. Either on its own
 * produces advice somebody ignores: a plan that ignores the gaps is generic,
 * and a plan that ignores the preferences is a plan for a learner who does not
 * exist.
 *
 * So this runs at the END of onboarding, reads both, and returns an ordered
 * handful of steps that each point somewhere real in the app.
 */

const schema = z.object({
  introEn: z
    .string()
    .describe("Two sentences tying their level to how they said they want to study. ≤ 40 words."),
  steps: z
    .array(
      z.object({
        titlePt: z
          .string()
          .describe("What to do, in short European Portuguese. ≤ 8 words, e.g. 'Treinar o pretérito perfeito'."),
        whyEn: z
          .string()
          .describe("Which gap this closes, naming it. ≤ 22 words. Never 'this will help you improve'."),
        kind: z
          .string()
          .describe(
            "One of: unidade (a course unit), verbos (conjugation drill), ditado (dictation), conversa (speaking with Sandra), jogos (games), reference (phrasebook), quiz."
          ),
        param: z
          .string()
          .describe(
            "For verbos: a tense (presente|perfeito|imperfeito|futuro|conjuntivo|imperativo). For ditado/conversa: a short pt-PT topic. Otherwise empty string."
          ),
      })
    )
    .min(3)
    .max(5),
});

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Onboarding is never refused for budget — see aiDenial({essential}).
  const denied = await aiDenial(session.username, { essential: true });
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  const [record, prefs, cefr] = await Promise.all([
    getPlacementRecord(),
    getMyPrefs(),
    getCefrFor(session.username),
  ]);
  const p = prefs ?? DEFAULT_PREFS;

  // Render the answers as the QUESTIONS themselves phrase them, so the model
  // reads what the learner actually chose rather than a set of enum codes.
  const answers = QUESTIONS.map((q) => {
    const chosen = q.options.find((o) => o.value === p[q.id]);
    return `- ${q.en} → ${chosen?.en ?? String(p[q.id])}`;
  }).join("\n");

  const s = record.summary;
  const gaps =
    s && s.gaps.length > 0
      ? s.gaps.map((g) => `- ${g.topicEn}: ${g.whyEn}`).join("\n")
      : "- No specific gaps recorded; treat this as a fresh start at their level.";

  const { output, usage } = await generateText({
    model: getSmartModel(),
    output: Output.object({ schema }),
    instructions: `${SANDRA}

You are designing ${session.displayName}'s first few weeks. ${await currentStyle()}

Two inputs, and BOTH must show in the result:
- The placement gaps say WHAT to work on. Every step must close a named gap, or consolidate the level they were placed at when no gaps were recorded.
- The questionnaire says HOW they will actually do it. Someone with ten minutes a day gets short steps and fewer of them; someone who dislikes games gets none; someone who wants to be guided gets a definite order, someone who wants to choose gets steps that stand alone.

Order matters: put first the thing that unlocks the most, not the easiest.
Do not recommend a level above ${cefr} — they have not shown it yet.
Use each kind at most twice; a plan of five conjugation drills is a spreadsheet, not a plan.
titlePt is European Portuguese, tu register. Everything else is English.`,
    prompt: `LEVEL: ${cefr}
${s ? `PLACEMENT SAID: ${s.headlineEn}\nFOCUS FIRST: ${s.focusEn}` : "PLACEMENT: no summary recorded."}
GAPS:
${gaps}

HOW THEY WANT TO STUDY:
${answers}`,
  });

  // Billed against the model actually used, not the default one.
  await recordUsage(session.username, "lesson", smartModelId(), usage);

  const plan = {
    introEn: output.introEn,
    steps: output.steps,
    at: new Date().toISOString().slice(0, 10),
  };
  // Persist so the plan survives the page and can be shown again later.
  await savePlacementRecord({ plan: plan as never });

  return NextResponse.json(plan);
}
