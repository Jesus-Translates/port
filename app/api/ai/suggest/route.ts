import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { getModel, suggestSchema } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";
import {
  getCategoriesWithCounts,
  getCefrFor,
  getMyRecentActivity,
  getStats,
} from "@/lib/data";

export const maxDuration = 120;

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos à Sandra — espera uns minutos." },
      { status: 429 }
    );
  }

  const [stats, cats, mine, cefr] = await Promise.all([
    getStats(session.username),
    getCategoriesWithCounts(),
    getMyRecentActivity(session.username),
    getCefrFor(session.username),
  ]);

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: suggestSchema }),
    instructions: `You are Sandra, the tutor inside a family's European Portuguese learning app. ${await currentStyle()}
Given the learner's recent activity, propose what to do next INSIDE the app. Available actions:
- kind "quiz": take a generated quiz (param = topic)
- kind "lesson": generate a workbook lesson (param = topic)
- kind "reference": study or grow a phrasebook category (param = one of the category slugs provided)
- kind "tutor": chat with you (param = a good opening question for the learner to ask)
- kind "homework": get a homework assignment (param = topic)
Vary the kinds. Ground each reason in their actual activity (or gently note inactivity). Keep it light and encouraging.`,
    prompt: `Learner: ${session.displayName}. XP: ${stats.xp}. Streak: ${stats.streakDays} days. Active days this week: ${stats.activeThisWeek}.
CEFR level: ${cefr}.\nTHEIR OWN recent activity (newest first): ${mine.map((r) => r.summary).join("; ") || "nothing yet"}.
Category slugs: ${cats.map((c) => `${c.slug} (${c.entryCount} entries)`).join(", ")}.`,
  });

  await recordUsage(session.username, "suggest", modelId(), usage);

  const KINDS = ["quiz", "lesson", "reference", "tutor", "homework"];
  return NextResponse.json({
    greetingPt: output.greetingPt,
    suggestions: output.suggestions.map((s) => ({
      ...s,
      kind: KINDS.includes(s.kind?.toLowerCase()) ? s.kind.toLowerCase() : "tutor",
    })),
  });
}
