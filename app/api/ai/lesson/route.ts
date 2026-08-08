import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { familyList, getModel, lessonGenSchema } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession, getValidUsers } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";
import { logActivity } from "@/lib/data";
import { getDb, lessons } from "@/lib/db";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos à Luna — espera uns minutos." },
      { status: 429 }
    );
  }

  let body: { topic?: string; level?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic: topicRaw = "daily routines", level = "A2" } = body;
  const topic = String(topicRaw).slice(0, 300);

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: lessonGenSchema }),
    instructions: `You write complete workbook lessons for a family learning European Portuguese together (${familyList(getValidUsers())}). ${await currentStyle()}
A lesson has blocks: intro (English markdown), prompts (sentence starters with en glosses), vocab (pt→en pairs),
reading (a short pt-PT text with comprehension questions), writing (a prompt), speaking (conversation prompts — you may
personalize with "user" set to one of: ${getValidUsers().join(", ")}), game (a fun group activity in markdown).
Model the style of a real tutor's worksheet: warm, practical, rooted in daily life on the Portuguese Atlantic coast.
Use 4-7 blocks. Every pt string needs a natural English gloss.`,
    prompt: `Write a lesson on "${topic}" at level ${level}.`,
  });

  await recordUsage(session.username, "lesson", modelId(), usage);

  const db = getDb();
  const [row] = await db
    .insert(lessons)
    .values({
      title: output.title,
      level: output.level,
      descriptionEn: output.descriptionEn,
      blocks: output.blocks,
      source: "ai",
      createdBy: session.username,
    })
    .returning({ id: lessons.id });

  await logActivity(
    session.username,
    "lesson",
    `Generated lesson “${output.title}”`,
    8
  );
  return NextResponse.json({ id: row.id });
}
