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
"o pequeno-almoço" (not café da manhã), "o autocarro", "a casa de banho", "o frigorífico", "o telemóvel".`;
// Where the learner lives is deliberately NOT here — it varies per person and
// is appended by styleFor() in lib/place.ts. See placeLine() for the wording.

/** "Kelly, Jenni and Robert" from a list of names. */
export function familyList(names: string[]): string {
  if (names.length === 0) return "the family";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function tutorInstructions(
  displayName: string,
  family: string[] = [],
  cefr = "A2"
): string {
  return `You are Luna, a warm, encouraging European Portuguese tutor for a family of English-speaking learners (${familyList(family)}). You are talking with ${displayName}, who is at CEFR level ${cefr} — pitch your Portuguese, your examples and your corrections at that level.

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

/** Feedback that teaches: name what was right, what slipped, and a rule to keep. */
export const FEEDBACK_COACHING = `Feedback must TEACH, never just mark. For every answer:
- Start by naming what they actually got right — if the meaning was correct but the spelling/accents slipped, say so explicitly
  ("You had the right structure — only the spelling slipped").
- Diagnose the specific slip and its kind: spelling/accents, gender, verb form or tense, word order, agreement, or wrong word.
  Say WHY it's wrong in one plain sentence ("morangos is masculine, so it takes de, not da").
- Give the corrected European Portuguese in full.
- End with one memorable, portable rule they can carry to the next question — not a restatement of the correction.
Never sarcastic, never a bare "Wrong". A near-miss is "Quase!" and should feel encouraging.`;

/** Spoken work is judged as SPEECH. Bolt this on wherever a transcript is graded. */
export const SPEAKING_COACHING = `This was SPOKEN, so you are reading a speech transcript. Ignore spelling, accents and punctuation
entirely — they are artefacts of the recogniser, not of the learner. Judge only: did it communicate, was the grammar right, and
does it sound European Portuguese?
Always finish with ONE concrete pronunciation pointer tied to what they actually said — name the sound, and say what the mouth
does. The sounds that trip up English speakers in pt-PT, in rough order of damage:
- unstressed vowels reduce almost to silence (telefone ≈ "tlefón"), so English speakers over-pronounce them and sound robotic;
- final and pre-consonant -s is "sh" (as in "wish"): as casas ≈ "ash cazash";
- nasal vowels ão / õe / ãe — the sound stops in the nose, the mouth never closes;
- lh (like the middle of "million") and nh (like "canyon") — the tongue is flat against the palate, not an L or N plus Y;
- the open vs closed vowel pairs (avó / avô) that change meaning outright.
If the pronunciation was genuinely fine, say which sound they nailed instead of inventing a fault.`;

const VERDICT = z
  .string()
  .describe(
    'One of: "certo" (right), "quase" (meaning right, small slips), "errado" (wrong)'
  );

export const gradeSchema = z.object({
  results: z.array(
    z.object({
      index: z.number(),
      correct: z.boolean().describe("True if acceptable — count 'quase' as true"),
      verdict: VERDICT,
      comment: z
        .string()
        .describe(
          "1-3 sentences in English: what was right, then exactly what slipped and why."
        ),
      correctedPt: z
        .string()
        .nullable()
        .describe("The full corrected pt-PT sentence; null if already perfect."),
      tip: z
        .string()
        .nullable()
        .describe(
          "One short memorable rule to get it right next time, e.g. 'meio quilo de + plural noun — de never becomes da here.'"
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

/** Structured assignment: each exercise is answered and graded on its own. */
export const homeworkItemsGenSchema = z.object({
  title: z.string().describe("Short assignment title, in Portuguese"),
  introMd: z
    .string()
    .describe(
      "2-3 sentences of markdown: what this practises and how to approach it. English prose, pt-PT examples. Do NOT list the exercises here."
    ),
  exercises: z
    .array(
      z.object({
        section: z
          .string()
          .nullable()
          // (CIPLE escrita uses 2 tasks; regular homework 4-8 — see prompt)
          .describe(
            'Short grouping label in English, e.g. "Answer in Portuguese" or "Translate". Repeat it for consecutive exercises of the same kind.'
          ),
        prompt: z
          .string()
          .describe(
            "One self-contained task the learner answers in a single box — a question in pt-PT, a sentence to translate, or a short prompt to write about."
          ),
        hint: z
          .string()
          .nullable()
          .describe("Optional one-line nudge, e.g. the verb to use."),
      })
    )
    .min(2)
    .max(8),
});

/** Feedback on ONE answer, delivered immediately so the next answer improves. */
export const itemFeedbackSchema = z.object({
  correct: z
    .boolean()
    .describe("True if acceptable pt-PT for the task — count a near-miss as true"),
  verdict: VERDICT,
  correctedPt: z
    .string()
    .nullable()
    .describe(
      "The corrected/model Portuguese sentence. Null only when the answer was already perfect."
    ),
  feedbackMd: z
    .string()
    .describe(
      "1-3 warm sentences of markdown: what was right, then exactly what slipped and why. English prose, pt-PT in **bold**."
    ),
  tip: z
    .string()
    .nullable()
    .describe("One short memorable rule to carry into the next question."),
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

/** CIPLE-style listening: a short spoken script + questions about it. */
export const listeningGenSchema = z.object({
  title: z.string().describe("Short title in Portuguese"),
  audioScript: z
    .string()
    .describe(
      "The pt-PT script to be read aloud: a short everyday dialogue or announcement, 60-120 words, natural spoken European Portuguese. No stage directions — only the words to be spoken."
    ),
  questions: z
    .array(
      z.object({
        type: z.string().describe('Always "multiple"'),
        promptPt: z.string().nullable(),
        promptEn: z.string().describe("The question about the audio, in English"),
        question: z.string().nullable().describe("Alias — prefer promptEn"),
        options: z.array(z.string()).nullable().describe("Exactly 4 options"),
        answer: z.string(),
        explanation: z.string().nullable(),
      })
    )
    .min(3)
    .max(6),
});

/** A graded-reader chapter set in the family's real life. */
export const storyGenSchema = z.object({
  seriesTitle: z.string().describe("The ongoing series name, in Portuguese"),
  title: z.string().describe("This chapter's title, in Portuguese"),
  textPt: z
    .string()
    .describe("The chapter, 150-220 words of pt-PT prose at the target level, in 3-5 short paragraphs"),
  textEn: z.string().describe("A natural English translation of the chapter"),
  glossary: z
    .array(z.object({ pt: z.string(), en: z.string() }))
    .min(6)
    .max(12)
    .describe("The hardest words/expressions in the chapter"),
  questions: z
    .array(
      z.object({
        promptPt: z.string().describe("Comprehension question in pt-PT"),
        options: z.array(z.string()).min(3).max(4),
        answer: z.string().describe("The correct option verbatim"),
      })
    )
    .min(3)
    .max(4),
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
