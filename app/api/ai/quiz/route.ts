import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, normalizeQuiz, PT_STYLE, quizGenSchema } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, quizzes } from "@/lib/db";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { topic?: string; level?: string; count?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic = "everyday life at home", level = "A2", count = 8 } = body;

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: quizGenSchema }),
    instructions: `You create short European Portuguese quizzes for adult learners. ${PT_STYLE}
Mix roughly 2/3 multiple-choice with 1/3 translate (English → pt-PT) questions. Multiple-choice options must be plausible,
with exactly one correct option repeated verbatim in "answer". Keep questions practical and slightly playful.
Use EXACTLY these fields per question: type ("multiple" or "translate"), promptEn (the question, in English),
promptPt (optional pt-PT snippet), options (exactly 4, only for multiple), answer, explanation.`,
    prompt: `Create a quiz with ${Math.min(Math.max(Number(count) || 8, 4), 12)} questions on the topic "${topic}" at CEFR level ${level}.`,
  });

  const quiz = normalizeQuiz(output);
  if (quiz.questions.length < 3) {
    return NextResponse.json(
      { error: "A Luna não conseguiu montar o teste. Tenta outra vez." },
      { status: 502 }
    );
  }

  const db = getDb();
  const [row] = await db
    .insert(quizzes)
    .values({
      username: session.username,
      topic,
      level,
      questions: quiz,
      status: "ready",
    })
    .returning({ id: quizzes.id });

  await logActivity(session.username, "quiz", `Generated a quiz on “${topic}”`, 5);
  return NextResponse.json({ id: row.id });
}
