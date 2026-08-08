import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import {
  getModel,
  homeworkGenSchema,
  homeworkItemsGenSchema,
} from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getRole, getSession, getValidUsers } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";
import { CEFR_LEVELS, getCefrFor, logActivity } from "@/lib/data";
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

  let body: {
    topic?: string;
    forEveryone?: boolean;
    mode?: string;
    transcript?: string;
    assignees?: string[];
    level?: string;
    unitItemId?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic: topicRaw = "everyday life in Portugal", forEveryone = false } = body;
  const topic = String(topicRaw).slice(0, 300);
  const unitItemId =
    Number.isInteger(body.unitItemId) && Number(body.unitItemId) > 0
      ? Number(body.unitItemId)
      : null;
  const cipleEscrita = body.mode === "ciple-escrita";
  const transcript = String(body.transcript ?? "").slice(0, 6000);
  // Homework built from a tutor session: practise exactly what just happened.
  const fromChat = body.mode === "from-chat" && transcript.trim().length > 0;

  const staff = getRole(session.username) !== "student";
  // Staff may target specific students; everyone else assigns to themselves
  // (or the whole family via forEveryone). Resolved here because the target
  // decides which level the exercises are written for.
  const requested = staff
    ? (body.assignees ?? [])
        .map((a) => String(a).toLowerCase())
        .filter((a) => getValidUsers().some((u) => u.toLowerCase() === a))
    : [];

  // Pitch the work at the learner it is FOR: an explicit pick wins, then the
  // single target student's own level, then the requester's.
  const picked = String(body.level ?? "").toUpperCase();
  const level = (CEFR_LEVELS as readonly string[]).includes(picked)
    ? picked
    : await getCefrFor(requested.length === 1 ? requested[0] : session.username);

  const LEVEL_GUIDE: Record<string, string> = {
    A1: "Level A1: present tense only, very high-frequency words, short concrete sentences about immediate needs. No past tenses, no subjunctive. One idea per exercise.",
    A2: "Level A2: present plus pretérito perfeito and a little imperfeito; everyday topics (shops, home, weather, routines). Keep sentences short and concrete.",
    B1: "Level B1: past tenses used naturally, future and conditional, opinions and reasons, linking words (porque, embora, apesar de). Longer answers expected.",
    B2: "Level B2: idiomatic register, conjuntivo where a native would use it, abstract topics, argument and nuance. Expect a paragraph, not a sentence.",
  };
  const levelLine = LEVEL_GUIDE[level] ?? LEVEL_GUIDE.A2;

  const SHARED = fromChat
    ? `You are Luna, a European Portuguese tutor writing homework for the adult learner you have just been chatting with. ${await currentStyle()}
${levelLine}
The assignment must come STRAIGHT out of that conversation — "practise what you just talked about". Produce EXACTLY 4-5 exercises that target:
- the words and expressions the learner struggled with, asked about, or got wrong;
- every correction you made in the conversation (make them use the corrected form again, in a new sentence);
- the structures and tenses that actually came up, in the same everyday situations the learner mentioned.
Reuse the learner's own vocabulary and context — if they talked about the market, the exercises happen at the market.
The whole assignment should take 15-25 minutes. Each exercise is answered on its own in a single input box and graded
immediately, so every exercise must be self-contained and answerable in one or two sentences — never "do all of the
following" or a multi-part task. Mix kinds: answer a question in Portuguese, translate a sentence into pt-PT, and write
a couple of lines using something that came up.
Instructions in English, all target content in pt-PT.`
    : cipleEscrita
    ? `You are Luna, preparing an adult learner for the CIPLE A2 exam's Expressão Escrita component. ${await currentStyle()}
Produce EXACTLY 2 exercises mirroring the real exam:
1. A short interactional text (postal, recado, convite or email) of 25-35 words — give a concrete everyday situation.
2. A longer text of 60-80 words about personal experience or daily life (descrever, contar, opinar).
Each exercise's prompt must state the word count and the situation clearly. Section = "Expressão Escrita".
Instructions in English, situations rooted in the learner's own daily life.`
    : `You are Luna, a European Portuguese tutor writing homework for an adult learner. ${await currentStyle()}
${levelLine}
The whole assignment should take 15-25 minutes. Produce 4-6 exercises. Each exercise is answered on its own in a single
input box and graded immediately, so every exercise must be self-contained and answerable in one or two sentences — never
"do all of the following" or a multi-part task. Mix kinds across the set: answer a question in Portuguese, translate a
sentence into pt-PT, and write a couple of lines about the learner's own life in Portugal. Draw from more than one
sub-topic and mix verb tenses — interleaving beats blocking.
Instructions in English, all target content in pt-PT.`;

  // The transcript-driven prompt is shared by all three generation tiers.
  const chatPrompt = `Here is the tutoring conversation, most recent last (the learner is "Aluno", you are "Luna"):

"""
${transcript}
"""

Write one homework assignment of 4-5 exercises that makes the learner practise exactly what came up above:
the words they stumbled on, the corrections you gave, and the structures you used together.`;
  const topicPrompt = `Write one homework assignment on "${topic}".`;
  const genPrompt = fromChat ? chatPrompt : topicPrompt;
  const chatTitle = (t: string) =>
    `Da conversa: ${t.replace(/^Da conversa:\s*/i, "").trim()}`.slice(0, 120);

  let title: string;
  let introMd: string;
  let items: HomeworkItem[];

  try {
    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: homeworkItemsGenSchema }),
      instructions: SHARED,
      prompt: fromChat
        ? chatPrompt
        : cipleEscrita
          ? `Write one CIPLE A2 Expressão Escrita practice set${topic !== "everyday life in Portugal" ? ` themed around "${topic}"` : ""}.`
          : topicPrompt,
    });
    title = fromChat
      ? chatTitle(output.title)
      : cipleEscrita
        ? `CIPLE Escrita: ${output.title}`.slice(0, 120)
        : output.title;
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
        prompt: genPrompt,
      });
      title = fromChat ? chatTitle(output.title) : output.title;
      md = output.instructions;
      await recordUsage(session.username, "homework", modelId(), usage);
    } catch {
      const { text, usage } = await generateText({
        model: getModel(),
        instructions: `${SHARED}
Reply with ONLY markdown: a "# " title line, one or two intro sentences, then the exercises as a numbered list
("1. ", "2. " …) with exactly one self-contained task per number. No preamble, no JSON, no code fences.`,
        prompt: genPrompt,
      });
      md = text;
      await recordUsage(session.username, "homework", modelId(), usage);
      const parsedTitle = md.match(/^#\s+(.+)$/m)?.[1]?.replace(/\*/g, "").trim();
      title = fromChat
        ? chatTitle(parsedTitle || "a conversa com a Luna")
        : parsedTitle || `TPC: ${topic}`;
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
  const assignees =
    requested.length > 0
      ? requested
      : forEveryone
        ? getValidUsers().map((u) => u.toLowerCase())
        : [session.username];
  const source = requested.length > 0 ? "teacher" : "ai";

  const rows = await db
    .insert(homework)
    .values(
      assignees.map((username) => ({
        username,
        title,
        instructions: introMd,
        items,
        source,
        // Only the learner's OWN copy is tied to a path item — a TPC pushed to
        // the whole family must not tick one person's unit for everyone else.
        unitItemId:
          unitItemId && assignees.length === 1 && username === session.username
            ? unitItemId
            : null,
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
