import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { z } from "zod";

/**
 * Resolves the tutor model at call time.
 * - Default: a "provider/model" string routed through the Vercel AI Gateway
 *   (auth: OIDC on Vercel, AI_GATEWAY_API_KEY locally).
 * - If OPENAI_API_KEY is set to a real key, calls OpenAI directly instead —
 *   lets GPT 5.6 Luna work without gateway credits.
 */
export function getModel(): LanguageModel {
  const id = process.env.AI_MODEL ?? "openai/gpt-5.6-luna";
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.startsWith("sk-") && id.startsWith("openai/")) {
    const openai = createOpenAI({ apiKey: openaiKey });
    return openai(id.slice("openai/".length));
  }
  return id;
}

export const PT_STYLE = `You are working with EUROPEAN Portuguese (português europeu, pt-PT), never Brazilian Portuguese.
Non-negotiable conventions: "tu" register between family/friends (tu fazes, fizeste), "estar a + infinitive" (not gerund),
"o pequeno-almoço" (not café da manhã), "o autocarro", "a casa de banho", "o frigorífico", "o telemóvel".
The learners live near Santa Cruz / Silveira, Torres Vedras, on the Portuguese Atlantic coast — use that local, everyday context
(o mercado, a praia, o vento, o multibanco, a farmácia de serviço) when inventing examples.`;

/** "Kelly, Jenni and Robert" from a list of names. */
export function familyList(names: string[]): string {
  if (names.length === 0) return "the family";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function tutorInstructions(
  displayName: string,
  family: string[] = []
): string {
  return `You are Luna, a warm, encouraging European Portuguese tutor for a family of English-speaking learners (${familyList(family)} — mostly around level A2, though some are younger or newer than others, so match the level of whoever you're talking to). You are talking with ${displayName}.

${PT_STYLE}

How you work:
- Answer questions about Portuguese clearly, in English, with pt-PT examples. Keep answers compact and scannable.
- When ${displayName} writes in Portuguese, gently correct mistakes: show the corrected sentence, then a one-line why. Always praise what was right first.
- Offer a natural follow-up: a related word, a mini-exercise, or a "try saying this" prompt — one, not a list.
- If asked for vocabulary lists or drills, keep them practical for daily life in Portugal.
- Portuguese words in **bold**; keep any English translation right next to it in parentheses.
- If a message includes CONTEXT (a note, homework, or reference category), ground your answer in it.
- Never switch to Brazilian Portuguese forms; if the learner uses one, point out the pt-PT equivalent kindly.`;
}

// Lenient on purpose: smaller models drift from exact field names/enums, so we
// accept aliases here and normalize with normalizeQuiz() before storing.
// Absent-able fields are .nullable() (not .optional()) — OpenAI strict
// structured outputs require every key present, with null for "no value".
export const quizGenSchema = z.object({
  title: z.string().nullable().describe("Short quiz title in English"),
  questions: z
    .array(
      z.object({
        type: z
          .string()
          .describe(`"multiple" (multiple choice) or "translate"`),
        promptPt: z
          .string()
          .nullable()
          .describe("Portuguese text the question is about, when relevant"),
        promptEn: z.string().nullable().describe("The question, in English"),
        question: z
          .string()
          .nullable()
          .describe("Alias for promptEn — prefer promptEn, else null"),
        options: z
          .array(z.string())
          .nullable()
          .describe("Exactly 4 options for type=multiple, else null"),
        answer: z
          .string()
          .describe(
            "For multiple: the correct option verbatim. For translate: the best pt-PT answer."
          ),
        explanation: z
          .string()
          .nullable()
          .describe("One-line English explanation of the answer"),
      })
    )
    .min(3)
    .max(14),
});

export type QuizQuestion = {
  type: "multiple" | "translate";
  promptPt?: string;
  promptEn: string;
  options?: string[];
  answer: string;
  explanation: string;
};
/** Shape stored in quizzes.questions */
export type QuizQuestions = { title?: string; questions: QuizQuestion[] };

export function normalizeQuiz(
  raw: z.infer<typeof quizGenSchema>
): QuizQuestions {
  const questions: QuizQuestion[] = [];
  for (const q of raw.questions) {
    const promptEn = (q.promptEn ?? q.question ?? q.promptPt ?? "").trim();
    const answer = (q.answer ?? "").trim();
    if (!promptEn || !answer) continue;
    const isMultiple =
      q.type.toLowerCase().includes("mult") &&
      Array.isArray(q.options) &&
      q.options.length >= 2;
    if (isMultiple) {
      const options = q.options!.slice(0, 5);
      // Keep the answer answerable even if the model didn't repeat it verbatim.
      if (!options.includes(answer)) options[options.length - 1] = answer;
      questions.push({
        type: "multiple",
        promptPt: q.promptPt ?? undefined,
        promptEn,
        options,
        answer,
        explanation: q.explanation ?? "",
      });
    } else {
      questions.push({
        type: "translate",
        promptPt: q.promptPt ?? undefined,
        promptEn,
        answer,
        explanation: q.explanation ?? "",
      });
    }
  }
  return { title: raw.title ?? undefined, questions };
}

export const gradeSchema = z.object({
  results: z.array(
    z.object({
      index: z.number(),
      correct: z.boolean(),
      comment: z
        .string()
        .describe(
          "Short, kind English comment; if wrong, show the corrected pt-PT"
        ),
    })
  ),
});

export const homeworkGenSchema = z.object({
  title: z.string().describe("Short assignment title, in Portuguese"),
  instructions: z
    .string()
    .describe(
      "The full assignment as markdown: a short intro, then 3-5 numbered exercises mixing writing, translation and vocabulary. English instructions, pt-PT content."
    ),
});

export const lessonBlockSchema = z.object({
  type: z
    .string()
    .describe(
      "One of: intro, prompts, vocab, reading, writing, speaking, game"
    ),
  md: z.string().nullable(),
  titlePt: z.string().nullable(),
  titleEn: z.string().nullable(),
  items: z
    .array(
      z.object({
        user: z.string().nullable(),
        pt: z.string(),
        en: z.string().nullable(),
      })
    )
    .nullable(),
  textPt: z.string().nullable(),
  questions: z
    .array(z.object({ pt: z.string(), en: z.string().nullable() }))
    .nullable(),
  promptPt: z.string().nullable(),
  promptEn: z.string().nullable(),
});

export const lessonGenSchema = z.object({
  title: z.string(),
  level: z.string().describe("CEFR level like A2"),
  descriptionEn: z.string(),
  blocks: z.array(lessonBlockSchema).min(3).max(8),
});

export const refSuggestSchema = z.object({
  entries: z
    .array(
      z.object({
        kind: z.string().describe("One of: term, verb, phrase, task"),
        section: z.string(),
        pt: z.string(),
        en: z.string(),
        replyPt: z.string().nullable(),
        replyEn: z.string().nullable(),
        note: z.string().nullable(),
      })
    )
    .min(5)
    .max(14),
});

export const suggestSchema = z.object({
  greetingPt: z
    .string()
    .describe("One friendly pt-PT greeting line for the learner, with English gloss in parentheses"),
  suggestions: z
    .array(
      z.object({
        title: z.string().describe("Short action title in English"),
        reason: z.string().describe("One line on why this, based on their activity"),
        kind: z
          .string()
          .describe("One of: quiz, lesson, reference, tutor, homework"),
        param: z
          .string()
          .describe(
            "For quiz/lesson: a topic. For reference: a category slug if given in context, else a topic. For tutor: an opening question to ask Luna. For homework: a topic."
          ),
      })
    )
    .min(2)
    .max(4),
});
