import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import {
  getModel,
  listeningGenSchema,
  normalizeQuiz,
  quizGenSchema,
  type QuizQuestions,
} from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";
import { logActivity } from "@/lib/data";
import { getDb, quizzes, examQuestions } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

export const maxDuration = 120;

/** Sections a civica topic can name; anything else samples the whole bank. */
const CIVICA_SECTIONS: [RegExp, string][] = [
  [/hist[óo]ria/i, "historia"],
  [/estado|[óo]rg[ãa]o|constitui/i, "estado"],
  [/s[íi]mbolo|bandeira|hino/i, "simbolos"],
  [/direito|dever/i, "direitos"],
  [/cultura|literatura|fado|gastronomia/i, "cultura"],
  [/geografia|rio|ilha|regi[ãa]o/i, "geografia"],
];

export async function POST(request: NextRequest) {
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

  let body: {
    topic?: string;
    level?: string;
    count?: number;
    mode?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { topic: topicRaw = "everyday life at home", level = "A2", count = 8 } = body;
  const topic = String(topicRaw).slice(0, 300);
  const mode = String(body.mode ?? "normal");

  const FIELDS = `Use EXACTLY these fields per question: type ("multiple" or "translate"), promptEn (the question, in English),
promptPt (optional pt-PT snippet), options (exactly 4, only for multiple), answer, explanation.`;

  let quiz: ReturnType<typeof normalizeQuiz> & { audioScript?: string };
  let usage;
  let storedTopic = topic;
  let storedLevel = level;

  if (mode === "civica") {
    // The civics test is a fixed body of facts, so questions come from the
    // curated, fact-checked bank (content/civica/banco-*.md → exam_questions)
    // whenever it has published rows — deterministic, free, and immune to the
    // model inventing history. Generation below remains only as the fallback
    // for an empty bank.
    const db = getDb();
    const section = CIVICA_SECTIONS.find(([re]) => re.test(topic))?.[1];
    const where = section
      ? and(
          eq(examQuestions.bank, "civica"),
          eq(examQuestions.status, "published"),
          eq(examQuestions.section, section)
        )
      : and(
          eq(examQuestions.bank, "civica"),
          eq(examQuestions.status, "published")
        );
    const n = Math.min(Math.max(Number(count) || 8, 4), 12);
    const rows = await db
      .select()
      .from(examQuestions)
      .where(where)
      .orderBy(sql`random()`)
      .limit(n);
    if (rows.length >= 4) {
      // Built directly in the stored shape — the question is already pt-PT and
      // exam-authentic, so it takes the headline (promptEn) slot as-is.
      const bankQuiz: QuizQuestions = {
        title: `Cultura e História: ${topic}`,
        questions: rows.map((r) => ({
          type: "multiple" as const,
          promptEn: r.promptPt,
          options: r.options as string[],
          answer: (r.options as string[])[r.correctIndex],
          explanation: r.explanation,
        })),
      };
      const [row] = await db
        .insert(quizzes)
        .values({
          username: session.username,
          topic: `Cultura e História: ${topic}`.slice(0, 120),
          level: "Cívica",
          questions: bankQuiz,
          status: "ready",
        })
        .returning({ id: quizzes.id });
      await logActivity(
        session.username,
        "quiz",
        `Started a civics quiz on “${topic}”`,
        5
      );
      return NextResponse.json({ id: row.id });
    }
    // Bank empty or unpublished — fall through to generation.
  }

  if (mode === "ciple-listening") {
    // Compreensão do Oral: audio script + questions about it.
    const res = await generateText({
      model: getModel(),
      output: Output.object({ schema: listeningGenSchema }),
      instructions: `You write CIPLE A2 listening-comprehension practice for adult learners of EUROPEAN Portuguese. ${await currentStyle()}
Write a natural everyday spoken script (dialogue at the market/café/pharmacy, or a short announcement), then
multiple-choice questions ABOUT the script that can only be answered by listening. All type "multiple", 4 plausible
options each, the correct one repeated verbatim in "answer". The learner will hear the audio, not read the script.`,
      prompt: `Create one listening exercise${topic !== "everyday life at home" ? ` about "${topic}"` : ""} at CIPLE A2 level.`,
    });
    usage = res.usage;
    const normalized = normalizeQuiz({
      title: res.output.title,
      questions: res.output.questions,
    });
    quiz = { ...normalized, audioScript: res.output.audioScript };
    storedTopic = `CIPLE Oral: ${res.output.title}`.slice(0, 120);
    storedLevel = "CIPLE";
  } else {
    const instructionsByMode: Record<string, string> = {
      "ciple-leitura": `You write CIPLE A2 reading-comprehension practice for adult learners of EUROPEAN Portuguese. ${await currentStyle()}
Imitate real CIPLE task shapes: put a SHORT everyday pt-PT text (an aviso, anúncio, email, menu or notice, 40-90 words)
in promptPt of the FIRST question, then ask multiple-choice questions about that text (reuse the text in later questions'
promptPt only if needed). All type "multiple", 4 plausible options, correct one verbatim in "answer". ${FIELDS}`,
      civica: `You write practice questions about Portuguese culture, history, geography and national symbols — the kind of
knowledge the Portuguese nationality process expects. ${await currentStyle()}
Stick to uncontroversial, stable facts (capital, rivers, 1143 and D. Afonso Henriques, the 1910 Republic, 25 de Abril 1974,
the flag and anthem, Camões and Pessoa, fado, the Descobrimentos, the Autonomous Regions, EU membership 1986, national
holidays). Questions in Portuguese in promptPt with the English in promptEn. All type "multiple". ${FIELDS}`,
      normal: `You create short European Portuguese quizzes for adult learners. ${await currentStyle()}
Mix roughly 2/3 multiple-choice with 1/3 translate (English → pt-PT) questions. Multiple-choice options must be plausible,
with exactly one correct option repeated verbatim in "answer". Keep questions practical and slightly playful.
Draw from at least three sub-topics and mix verb tenses across the set — interleaving beats blocking. ${FIELDS}`,
    };
    const res = await generateText({
      model: getModel(),
      output: Output.object({ schema: quizGenSchema }),
      instructions: instructionsByMode[mode] ?? instructionsByMode.normal,
      prompt: `Create a quiz with ${Math.min(Math.max(Number(count) || 8, 4), 12)} questions on the topic "${topic}" at ${mode === "ciple-leitura" ? "CIPLE A2 level" : `CEFR level ${level}`}.`,
    });
    usage = res.usage;
    quiz = normalizeQuiz(res.output);
    if (mode === "ciple-leitura") {
      storedTopic = `CIPLE Leitura: ${topic}`.slice(0, 120);
      storedLevel = "CIPLE";
    } else if (mode === "civica") {
      storedTopic = `Cultura e História: ${topic}`.slice(0, 120);
    }
  }
  if (quiz.questions.length < 3) {
    return NextResponse.json(
      { error: "A Sandra não conseguiu montar o teste. Tenta outra vez." },
      { status: 502 }
    );
  }

  await recordUsage(session.username, "quiz", modelId(), usage);

  const db = getDb();
  const [row] = await db
    .insert(quizzes)
    .values({
      username: session.username,
      topic: storedTopic,
      level: storedLevel,
      questions: quiz,
      status: "ready",
    })
    .returning({ id: quizzes.id });

  await logActivity(
    session.username,
    "quiz",
    `Generated a quiz on “${storedTopic}”`,
    5
  );
  return NextResponse.json({ id: row.id });
}
