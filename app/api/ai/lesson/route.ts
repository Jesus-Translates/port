import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { familyList, getModel, lessonGenSchema } from "@/lib/ai";
import { nonLatinError } from "@/lib/lang-guard";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { householdMembers } from "@/lib/tenant";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";
import { logActivity } from "@/lib/data";
import { getDb, lessons } from "@/lib/db";

/** Display names of my household — never every account on the instance. */
async function householdNames(): Promise<string[]> {
  return (await householdMembers()).map((m) => m.displayName);
}

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Burst limit AND the household's monthly AI allowance, in one check.
  const denied = await aiDenial(session.username);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: { topic?: string; level?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic: topicRaw = "daily routines", level = "A2" } = body;
  const topic = String(topicRaw).slice(0, 300);

  // Turn away a non-Latin topic before it reaches the prompt — same rule as
  // the listening route. This app has two languages, both Latin-script.
  const langErr = nonLatinError(topic);
  if (langErr) {
    return NextResponse.json({ error: langErr }, { status: 400 });
  }

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: lessonGenSchema }),
    instructions: `You write complete workbook lessons for a family learning European Portuguese together (${familyList(await householdNames())}). ${await currentStyle()}
A lesson has blocks: intro (English markdown), prompts (sentence starters with en glosses), vocab (pt→en pairs),
reading (a short pt-PT text with comprehension questions), writing (a prompt), speaking (conversation prompts — you may
personalize with "user" set to one of: ${(await householdNames()).join(", ")}), game (a fun group activity in markdown).
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
