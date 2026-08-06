import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, PT_STYLE, quizGenSchema } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, quizzes } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const {
    topic = "everyday life at home",
    level = "A2",
    count = 8,
  }: { topic?: string; level?: string; count?: number } = await request.json();

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: quizGenSchema }),
    instructions: `You create short European Portuguese quizzes for adult learners. ${PT_STYLE}
Mix roughly 2/3 multiple-choice with 1/3 translate (English → pt-PT) questions. Multiple-choice options must be plausible,
with exactly one correct option repeated verbatim in "answer". Keep questions practical and slightly playful.`,
    prompt: `Create a quiz with ${Math.min(Math.max(Number(count) || 8, 4), 12)} questions on the topic "${topic}" at CEFR level ${level}.`,
  });

  const db = getDb();
  const [row] = await db
    .insert(quizzes)
    .values({
      username: session.username,
      topic,
      level,
      questions: output,
      status: "ready",
    })
    .returning({ id: quizzes.id });

  await logActivity(session.username, "quiz", `Generated a quiz on “${topic}”`, 5);
  return NextResponse.json({ id: row.id });
}
