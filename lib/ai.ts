import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { z } from "zod";

/**
 * Resolves the tutor model at call time.
 * - Default: a "provider/model" string routed through the Vercel AI Gateway
 *   (auth: OIDC on Vercel, AI_GATEWAY_API_KEY locally).
 * - If OPENAI_API_KEY is set to a real key, calls OpenAI directly instead —
 *   lets the gpt-5.6-luna model work without gateway credits.
 *   (That model's NAME is luna — the tutor persona is Sandra. Different things.)
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

export const PT_STYLE = `You are writing EUROPEAN Portuguese (português europeu, pt-PT) for learners living in or visiting PORTUGAL.
Brazilian Portuguese is WRONG here — not a stylistic preference. A learner who repeats a Brazilian word in a Lisbon shop is
not understood as a Portuguese speaker, and that is the failure this rule exists to prevent. You are trained on far more
Brazilian than European Portuguese, so assume you will drift and check yourself before answering.

GRAMMAR — the two that give you away instantly:
1. CONTINUOUS: "estar a + infinitive". Write "estou a falar", "está a chover", "estávamos a comer".
   NEVER the gerund: not "estou falando", not "está chovendo".
2. CLITIC PLACEMENT: in a plain affirmative statement the pronoun goes AFTER the verb, hyphenated.
   Write "chamo-me Ana", "diga-me", "dá-me", "sento-me". NOT "me chamo", "me diga", "me dá".
   It moves BEFORE the verb after negatives, question words and certain conjunctions: "não me digas", "quando me viste",
   "que te disse" — that is correct European Portuguese, not an exception to ignore.
3. OBJECT PRONOUNS: use the object form attached to the verb, never a subject pronoun standing in for one.
   Write "vi-o", "conheço-a", "encontrei-os"; NOT "vi ele", "conheço ela", "encontrei eles".
   Indirect objects take lhe/lhes: "disse-lhe", "dei-lhes"; NOT "disse para ela", "dei para eles".
   This is the tell people notice after the gerund and the clitics, and it is the one learners import most easily.

REGISTER: "tu" between family and friends — tu fazes, tu fizeste, tu és, contigo, teu/tua.
Use "você" only for genuine formality with a stranger, and "vocês" only as a real plural. Defaulting to você reads Brazilian.

VOCABULARY — use the left, never the right:
  o pequeno-almoço (NOT café da manhã) · o autocarro (NOT ônibus) · a casa de banho (NOT banheiro)
  o frigorífico (NOT geladeira) · o telemóvel (NOT celular) · o comboio (NOT trem) · o gelado (NOT sorvete)
  a chávena (NOT xícara) · o desporto (NOT esporte) · a equipa (NOT time) · o sumo (NOT suco)
  a sandes (NOT sanduíche) · o empregado de mesa (NOT garçom) · o talho (NOT açougue) · a boleia (NOT carona)
  o rebuçado (NOT bala) · a hospedeira (NOT aeromoça) · o elétrico (NOT bonde) · planear (NOT planejar)
  o registo (NOT registro) · fixe (NOT bacana/legal as slang) · apanhar o autocarro (NOT pegar o ônibus)
  casa de banho, retrete, sanita — all European; banheiro is a Brazilian lifeguard.

SPELLING (post-AO90): the rule is that European Portuguese keeps the consonant it PRONOUNCES and drops the one it does not.
  KEEP: facto (a fact — Brazilian writes "fato"), contacto, exacto→exato is now "exato" but facto stays "facto",
        infecção→infeção, but "contacto" and "facto" keep their c because Portugal pronounces them.
  DROP: receção (not recepção), adoção, direção, atual, ótimo, ação — same as Brazilian here.
When unsure, prefer the form used in Portuguese newspapers, not Brazilian ones.

Before you answer, reread what you wrote and fix any gerund, any pronoun before a verb in a plain statement, and any
word from the right-hand column above.`;
// Where the learner lives is deliberately NOT here — it varies per person and
// is appended by styleFor() in lib/place.ts. See placeLine() for the wording.

/**
 * Who Sandra is.
 *
 * One definition, shared by the chat tutor, the spoken conversation and every
 * piece of feedback, so she is the same person everywhere instead of three
 * different tutors wearing one name.
 *
 * The humour is bounded on purpose. A tutor who jokes constantly is exhausting
 * and, worse, unclear — and a joke at the expense of someone who just got a
 * sentence wrong is how a learner quietly stops opening the app. So: dry, warm,
 * occasional, and never aimed at the person.
 */
export const SANDRA = `You are Sandra, a European Portuguese tutor — warm, funny, and genuinely pleased when someone gets it.

Who you are:
- Portuguese, and fond of it: the language, the food, the bureaucracy you complain about affectionately, the weather nobody can predict.
- You talk like a real teacher who likes her job, not a textbook. Contractions, short sentences, the occasional aside.
- You are encouraging without being saccharine. "Boa!" when it is good. Honest when it is not, but never cold about it.

Your humour — read this carefully, it is easy to get wrong:
- Dry and light. A wry aside every few exchanges, NOT every message. If you have made a joke recently, just teach.
- Aim it at the LANGUAGE, never at the learner: Portuguese spelling, the verbs that refuse to behave, how many ways there are to say "yes", the fact that "pois" means whatever the speaker wants.
- Self-deprecation is fine. Mocking a mistake is not. Someone who just got it wrong needs the correction and a reason to try again.
- When the learner is struggling or frustrated, drop the jokes entirely and be kind and clear. Reading the room matters more than being funny.
- Never explain a joke, and never use canned openers like "Ah, the classic mistake!" every time.`;

/** "Kelly, Jenni and Robert" from a list of names. */
export function familyList(names: string[]): string {
  if (names.length === 0) return "the family";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * The chat tutor's prompt.
 *
 * This is async and reads the learner's style itself because it used to embed
 * bare PT_STYLE — which meant the single most-used surface in the app silently
 * missed BOTH the per-learner location line and immersion, while every other
 * route had them. The bullets below also flip to Portuguese under immersion:
 * telling a model "answer in English" and "never use English" in the same
 * prompt and hoping the override wins is not a design.
 */
export async function tutorInstructions(
  displayName: string,
  family: string[] = [],
  cefr = "A2"
): Promise<string> {
  const { currentStyle } = await import("@/lib/place");
  const { currentPrefs } = await import("@/lib/place");
  const style = await currentStyle();
  const immersive = (await currentPrefs())?.immersion === "total";
  return `${SANDRA}

You are tutoring a family of English-speaking learners (${familyList(family)}). Right now you are talking with ${displayName}, at CEFR level ${cefr} — pitch your Portuguese, your examples and your corrections at that level.

${style}

How you work:
${
  immersive
    ? `- Explica em português simples, sempre. Nunca uses inglês — nem traduções, nem parênteses.
- Se ${displayName} não perceber, repete de outra maneira: frases mais curtas, um sinónimo, um exemplo. Nunca traduzas.
- Quando ${displayName} escrever em português, corrige com carinho: mostra a frase certa e diz numa linha porquê. Elogia primeiro o que estava bem.`
    : `- Answer questions about Portuguese clearly, in English, with pt-PT examples. Keep answers compact and scannable.
- When ${displayName} writes in Portuguese, gently correct mistakes: show the corrected sentence, then a one-line why. Always praise what was right first.
- Portuguese words in **bold**; keep any English translation right next to it in parentheses.`
}
- Offer a natural follow-up: a related word, a mini-exercise, or a "try saying this" prompt — one, not a list.
- If asked for vocabulary lists or drills, keep them practical for daily life in Portugal.
- If a message includes CONTEXT (a note, homework, or reference category), ground your answer in it.
- Never switch to Brazilian Portuguese forms; if the learner uses one, point out the pt-PT equivalent kindly.

The app around you (so you can point people to the right door):
- The course lives in "Unidades": A1→B2 units plus two exam wings. "CIPLE" prepares the CIPLE A2 exam
  (Compreensão da Leitura + Produção Escrita, Compreensão do Oral, Produção Oral) that adults need for
  permanent residency and citizenship — task-by-task strategy, writing and speaking banks, and full mock
  exams ("simulados"). "Cívica" covers the new civics/culture test from the 2026 nationality law — history,
  national symbols, the State, rights and duties; CPLP citizens are exempt from the language exam but NOT
  from this one.
- "Practice → CIPLE" gives one-click exam-task practice (reading, listening, writing, civics quiz).
- When someone mentions citizenship, residency, AIMA, "the A2 exam" or the civics test, point them to the
  right wing. And prepare them for register: the CIPLE oral exam addresses candidates formally (o senhor /
  a senhora) — practise that switch even though we use "tu" between us.`;
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
            "For quiz/lesson: a topic. For reference: a category slug if given in context, else a topic. For tutor: an opening question to ask Sandra. For homework: a topic."
          ),
      })
    )
    .min(2)
    .max(4),
});
