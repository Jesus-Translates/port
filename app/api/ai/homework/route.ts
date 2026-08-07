import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import {
  getModel,
  homeworkGenSchema,
  homeworkItemsGenSchema,
  PT_STYLE,
} from "@/lib/ai";
import { getSession, getValidUsers } from "@/lib/auth";
import { modelId, recordUsage } from "@/lib/usage";
import { logActivity } from "@/lib/data";
import { getDb, homework } from "@/lib/db";
import {
  blankItem,
  type HomeworkItem,
  parseItemsFromMarkdown,
} from "@/lib/homework-items";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { topic?: string; forEveryone?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic = "everyday life in Portugal", forEveryone = false } = body;

  const SHARED = `You are Luna, a European Portuguese tutor writing homework for adult learners (around A2). ${PT_STYLE}
The whole assignment should take 15-25 minutes. Each exercise is answered on its own in a single input box and graded
immediately, so every exercise must be self-contained and answerable in one or two sentences — never "do all of the
following" or a multi-part task. Mix kinds across the set: answer a question in Portuguese, translate a sentence
into pt-PT, and write a couple of lines about the learner's own life in Portugal.
Instructions in English, all target content in pt-PT.`;

  let title: string;
  let introMd: string;
  let items: HomeworkItem[];

  try {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: homeworkItemsGenSchema }),
      instructions: SHARED,
      prompt: `Write one homework assignment on "${topic}".`,
    });
    title = output.title;
    introMd = output.introMd;
    await recordUsage(session.username, "homework", modelId(), usage);
    items = output.exercises.map((e, i) =>
      blankItem(i + 1, e.prompt, e.section, e.hint)
    );
  } catch {
    // Some models drift from the exact field names. Fall back to markdown
    // (structured, then plain text) and split it ourselves.
    let md = "";
    try {
      const { output, usage } = await generateText({
        model: getModel(),
        output: Output.object({ schema: homeworkGenSchema }),
        instructions: `${SHARED}\nReturn a short intro, then the exercises as a numbered markdown list — one task per number.`,
        prompt: `Write one homework assignment on "${topic}".`,
      });
      title = output.title;
      md = output.instructions;
      await recordUsage(session.username, "homework", modelId(), usage);
    } catch {
      const { text, usage } = await generateText({
        model: getModel(),
        instructions: `${SHARED}
Reply with ONLY markdown: a "# " title line, one or two intro sentences, then the exercises as a numbered list
("1. ", "2. " …) with exactly one self-contained task per number. No preamble, no JSON, no code fences.`,
        prompt: `Write one homework assignment on "${topic}".`,
      });
      md = text;
      await recordUsage(session.username, "homework", modelId(), usage);
      title =
        md.match(/^#\s+(.+)$/m)?.[1]?.replace(/\*/g, "").trim() ||
        `TPC: ${topic}`;
    }
    items = parseItemsFromMarkdown(md);
    // Keep the intro only; the exercises now live in items.
    introMd =
      items.length > 0
        ? md
            .replace(/^#\s+.+$/m, "")
            .split(/\n\s*\d+[.)]\s+/)[0]
            .trim()
        : md;
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "A Luna não conseguiu montar o TPC. Tenta outra vez." },
      { status: 502 }
    );
  }

  const db = getDb();
  const assignees = forEveryone
    ? getValidUsers().map((u) => u.toLowerCase())
    : [session.username];

  const rows = await db
    .insert(homework)
    .values(
      assignees.map((username) => ({
        username,
        title,
        instructions: introMd,
        items,
        source: "ai",
      }))
    )
    .returning({ id: homework.id, username: homework.username });

  await logActivity(
    session.username,
    "homework",
    `Luna assigned “${title}”${forEveryone ? " to everyone" : ""}`,
    5
  );

  const mine = rows.find((r) => r.username === session.username) ?? rows[0];
  return NextResponse.json({ id: mine.id });
}
