import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import {
  getModel,
  homeworkGenSchema,
  homeworkItemsGenSchema,
  PT_STYLE,
} from "@/lib/ai";
import { getSession, getValidUsers } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";
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

  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos à Luna — espera uns minutos." },
      { status: 429 }
    );
  }

  let body: { topic?: string; forEveryone?: boolean; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic: topicRaw = "everyday life in Portugal", forEveryone = false } = body;
  const topic = String(topicRaw).slice(0, 300);
  const cipleEscrita = body.mode === "ciple-escrita";

  const SHARED = cipleEscrita
    ? `You are Luna, preparing an adult learner for the CIPLE A2 exam's Expressão Escrita component. ${PT_STYLE}
Produce EXACTLY 2 exercises mirroring the real exam:
1. A short interactional text (postal, recado, convite or email) of 25-35 words — give a concrete everyday situation.
2. A longer text of 60-80 words about personal experience or daily life (descrever, contar, opinar).
Each exercise's prompt must state the word count and the situation clearly. Section = "Expressão Escrita".
Instructions in English, situations rooted in daily life near Torres Vedras.`
    : `You are Luna, a European Portuguese tutor writing homework for adult learners (around A2). ${PT_STYLE}
The whole assignment should take 15-25 minutes. Produce 4-6 exercises. Each exercise is answered on its own in a single
input box and graded immediately, so every exercise must be self-contained and answerable in one or two sentences — never
"do all of the following" or a multi-part task. Mix kinds across the set: answer a question in Portuguese, translate a
sentence into pt-PT, and write a couple of lines about the learner's own life in Portugal. Draw from more than one
sub-topic and mix verb tenses — interleaving beats blocking.
Instructions in English, all target content in pt-PT.`;

  let title: string;
  let introMd: string;
  let items: HomeworkItem[];

  try {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: homeworkItemsGenSchema }),
      instructions: SHARED,
      prompt: cipleEscrita
        ? `Write one CIPLE A2 Expressão Escrita practice set${topic !== "everyday life in Portugal" ? ` themed around "${topic}"` : ""}.`
        : `Write one homework assignment on "${topic}".`,
    });
    title = cipleEscrita ? `CIPLE Escrita: ${output.title}`.slice(0, 120) : output.title;
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
