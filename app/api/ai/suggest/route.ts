import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { getModel, PT_STYLE, suggestSchema } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { getCategoriesWithCounts, getStats } from "@/lib/data";

export const maxDuration = 120;

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [stats, cats] = await Promise.all([
    getStats(session.username),
    getCategoriesWithCounts(),
  ]);

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: suggestSchema }),
    instructions: `You are Luna, the tutor inside a family's European Portuguese learning app. ${PT_STYLE}
Given the learner's recent activity, propose what to do next INSIDE the app. Available actions:
- kind "quiz": take a generated quiz (param = topic)
- kind "lesson": generate a workbook lesson (param = topic)
- kind "reference": study or grow a phrasebook category (param = one of the category slugs provided)
- kind "tutor": chat with you (param = a good opening question for the learner to ask)
- kind "homework": get a homework assignment (param = topic)
Vary the kinds. Ground each reason in their actual activity (or gently note inactivity). Keep it light and encouraging.`,
    prompt: `Learner: ${session.displayName}. XP: ${stats.xp}. Streak: ${stats.streakDays} days. Active days this week: ${stats.activeThisWeek}.
Recent activity (newest first): ${stats.recent.map((r) => `[${r.username}] ${r.summary}`).join("; ") || "nothing yet"}.
Category slugs: ${cats.map((c) => `${c.slug} (${c.entryCount} entries)`).join(", ")}.`,
  });

  const KINDS = ["quiz", "lesson", "reference", "tutor", "homework"];
  return NextResponse.json({
    greetingPt: output.greetingPt,
    suggestions: output.suggestions.map((s) => ({
      ...s,
      kind: KINDS.includes(s.kind?.toLowerCase()) ? s.kind.toLowerCase() : "tutor",
    })),
  });
}
