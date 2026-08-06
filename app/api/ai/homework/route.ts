import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { homeworkGenSchema, getModel, PT_STYLE } from "@/lib/ai";
import { getSession, getValidUsers } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, homework } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const {
    topic = "everyday life in Portugal",
    forEveryone = false,
  }: { topic?: string; forEveryone?: boolean } = await request.json();

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: homeworkGenSchema }),
    instructions: `You are Luna, a European Portuguese tutor writing homework for adult A2 learners. ${PT_STYLE}
The assignment must be doable in 15-25 minutes with just a pen or keyboard: a short intro, then 3-5 numbered exercises
(mix of: answer questions in Portuguese, translate sentences, fill vocabulary, write a few lines about their own life).
Instructions in English, all target content in pt-PT. Markdown.`,
    prompt: `Write one homework assignment on "${topic}".`,
  });

  const db = getDb();
  const assignees = forEveryone
    ? getValidUsers().map((u) => u.toLowerCase())
    : [session.username];

  const rows = await db
    .insert(homework)
    .values(
      assignees.map((username) => ({
        username,
        title: output.title,
        instructions: output.instructions,
        source: "ai",
      }))
    )
    .returning({ id: homework.id, username: homework.username });

  await logActivity(
    session.username,
    "homework",
    `Luna assigned “${output.title}”${forEveryone ? " to everyone" : ""}`,
    5
  );

  const mine = rows.find((r) => r.username === session.username) ?? rows[0];
  return NextResponse.json({ id: mine.id });
}
