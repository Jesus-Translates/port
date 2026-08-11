import { generateText, NoObjectGeneratedError, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel, SANDRA, SPEAKING_COACHING } from "@/lib/ai";
import { currentStyle, referenceContext } from "@/lib/place";
import { getSession, type Session } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { addMistakeCard } from "@/lib/srs";
import {
  azureConfigured,
  azureSynthesizeSsml,
  getTtsAudio,
  sandraVoice,
  ssmlFor,
} from "@/lib/tts";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

/**
 * Conversa: a spoken back-and-forth with Sandra.
 *   mode=start — pick topic (or random) + ONE voice for the whole session,
 *                generate Sandra's opener, return it with inline audio.
 *   mode=turn  — transcribe the learner's recording (or accept typed text),
 *                generate Sandra's next line, return it with inline audio.
 *   mode=end   — grade the whole transcript: summary, corrections (→ mistake
 *                cards), new words worth saving, XP.
 * Audio is synthesized inline and NOT cached — every line is one-off, and a
 * fixed per-session voice matters more than cache hits mid-conversation.
 */

const RANDOM_TOPICS = [
  "a praia",
  "o mercado semanal",
  "o tempo e o vento",
  "os vizinhos",
  "o jantar de hoje",
  "futebol e desporto",
  "as férias de verão",
  "uma ida à vila",
  "os pastéis e o café",
  "a família",
  "o supermercado",
  "um passeio a Lisboa",
  "o surf e o mar",
  "as festas da terra",
  "o jardim e as plantas",
];

const replySchema = z.object({
  replyPt: z
    .string()
    .describe("Sandra's next spoken line: 1-2 short pt-PT sentences plus ONE follow-up question."),
  glossEn: z.string().describe("Natural English translation of replyPt."),
  /*
   * Sandra judges the learner's line as she answers it.
   *
   * One model call rather than two: she has already read the turn in context,
   * and a separate grader would double the cost and the latency of every
   * exchange. The score is what accumulates toward finishing the step, so the
   * rubric is explicit — otherwise a model rewards politeness and the learner
   * who says "sim" ten times completes the course.
   */
  turnXp: z
    .number()
    .int()
    .describe(
      "XP for the LEARNER'S last line, 0-25. 0 if nothing was recognised or they wrote English. " +
        "5 for a bare one-word answer. 10-14 for a short but real sentence. " +
        "15-20 for a full, on-topic sentence in correct European Portuguese. " +
        "21-25 only when they also volunteered something extra or asked a question back. " +
        "Judge effort, correctness and relevance — never politeness. Use 0 for your own opening line."
    ),
  turnWhyEn: z
    .string()
    .describe(
      "One short English clause naming what earned or cost the XP, e.g. 'full sentence, right preposition' or 'one word only'."
    ),
});

const summarySchema = z.object({
  resumoMd: z
    .string()
    .describe("2-4 English markdown sentences: what was discussed and what the learner did well."),
  /*
   * Three kinds of feedback, kept apart on purpose.
   *
   * `strengths` is what they actually did well, QUOTED — praise that names a
   * real sentence is the only praise a learner believes. `wordChoice` is the
   * upgrade path: things that were not wrong but that a Portuguese person
   * would have said differently, which is most of the distance between
   * correct and fluent and is invisible if you only ever list errors.
   * `corrections` stays what it was — actual mistakes.
   *
   * Collapsing these into one list is what makes feedback feel either
   * dishonestly nice or relentlessly negative.
   */
  strengths: z
    .array(
      z.object({
        quotePt: z.string().describe("Something the learner ACTUALLY said, verbatim."),
        whyEn: z.string().describe("Why it worked, in ≤ 18 English words. Be specific — 'you used the personal infinitive correctly', not 'good job'."),
      })
    )
    .max(3)
    .describe("Real strengths, quoted. Empty only if the learner barely spoke."),
  wordChoice: z
    .array(
      z.object({
        saidPt: z.string().describe("What they said — correct, but not what a native would pick."),
        naturalPt: z.string().describe("What a Portuguese person would say instead."),
        whyEn: z.string().describe("The difference, in ≤ 20 English words."),
      })
    )
    .max(4)
    .describe("NOT errors — natural-sounding upgrades. Empty if their word choice was already idiomatic."),
  speech: z.object({
    fluencyEn: z
      .string()
      .describe(
        "2-3 honest English sentences on HOW they spoke: length of turns, whether they built full sentences or single words, " +
          "whether they took initiative or only answered, and range of vocabulary and tenses. Encouraging but truthful — " +
          "if they answered every question with one word, say so kindly and say what to try instead."
      ),
    soundTipEn: z
      .string()
      .describe(
        "One European Portuguese pronunciation pointer tied to a word they actually used: the sound in **bold** and what the mouth does. " +
          "You are reading a TRANSCRIPT and cannot hear them, so teach the sound — never claim to have judged their accent."
      ),
  }),
  corrections: z
    .array(
      z.object({
        saidPt: z.string().describe("What the learner actually said (or close to it)."),
        betterPt: z.string().describe("The natural pt-PT version."),
        tipEn: z.string().describe("Why, in ≤ 20 English words."),
      })
    )
    .max(6),
  newWords: z
    .array(
      z.object({
        pt: z.string().describe("A useful pt-PT word or short phrase from the conversation."),
        en: z.string().describe("Its English meaning."),
      })
    )
    .max(8),
  encouragementPt: z
    .string()
    .describe("One warm closing sentence in very simple European Portuguese."),
});

type HistoryTurn = { role: "sandra" | "eu"; text: string };

function cleanHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is { role: unknown; text: unknown } =>
        typeof t === "object" && t !== null
    )
    .map((t) => ({
      role: t.role === "eu" ? ("eu" as const) : ("sandra" as const),
      text: String(t.text ?? "").slice(0, 500),
    }))
    .filter((t) => t.text.length > 0)
    .slice(-16);
}

function transcriptOf(history: HistoryTurn[]): string {
  return history
    .map((t) => `${t.role === "eu" ? "Aluno" : "Sandra"}: ${t.text}`)
    .join("\n")
    .slice(0, 6000);
}

async function conversationInstructions(
  displayName: string,
  cefr: string
): Promise<string> {
  return `${SANDRA}

You are having a SPOKEN conversation in European Portuguese with ${displayName}, a learner at CEFR level ${cefr}. Being talked to out loud is the most exposing thing in this app — warmth beats wit here, and a joke only ever lands once they are relaxed. ${await currentStyle()}${await referenceContext()}

Rules of the conversation:
- Reply in 1-2 SHORT sentences, then ask exactly ONE simple follow-up question. Never a monologue.
- Match level ${cefr}: A1/A2 → present tense, high-frequency words, one idea at a time; B1/B2 → richer vocabulary, past tenses and conjuntivo welcome.
- The learner SPOKE their message and you see only a transcript — ignore spelling and missing accents entirely.
- When the learner makes an error, do NOT point it out and do NOT lecture. RECAST it: naturally reuse the corrected form inside your own reply, the way a native speaker would.
- If their line is empty or unintelligible, gently ask them to say it again ("Não percebi bem — podes repetir?").
- Stay warm, curious and encouraging. Follow the learner's lead if they drift off topic.`;
}

/** Inline TTS: session voice via Azure, cached fallback via OpenAI, null on failure. */
async function speak(
  text: string,
  voice: string,
  username: string
): Promise<string | null> {
  try {
    if (azureConfigured() && voice) {
      // Billing happens inside azureSynthesizeSsml, on the exact SSML sent.
      const buf = await azureSynthesizeSsml(
        ssmlFor(text, voice, "0.92"),
        username
      );
      if (buf) return buf.toString("base64");
    }
    // Still Sandra on the fallback path — pin her voice rather than letting
    // the cache hash the text into whoever it lands on.
    const buf = await getTtsAudio(text, username, {
      voice: voice || sandraVoice(),
    });
    return buf ? buf.toString("base64") : null;
  } catch {
    return null;
  }
}

/** Some gateway models return near-miss JSON ({"text": …}) instead of the
 *  strict shape. Salvage the raw text rather than failing the whole turn. */
function salvage(err: unknown): Record<string, unknown> | null {
  if (!NoObjectGeneratedError.isInstance(err) || !err.text) return null;
  try {
    const parsed = JSON.parse(err.text) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

async function generateReply(
  session: Session,
  cefr: string,
  topic: string,
  history: HistoryTurn[],
  learnerLine: string | null
): Promise<{
  replyPt: string;
  glossEn: string;
  turnXp: number;
  turnWhyEn: string;
}> {
  const args = {
    model: getModel(),
    instructions: await conversationInstructions(session.displayName, cefr),
    prompt:
      history.length === 0 && learnerLine === null
        ? `Open a conversation about "${topic}". Greet ${session.displayName} by name, say one short thing about the topic, and ask one easy question to get them talking.`
        : `TOPIC: ${topic}

CONVERSATION SO FAR:
${transcriptOf(history)}

THE LEARNER JUST SAID (speech transcript): ${learnerLine || "(nothing recognised)"}

Continue the conversation.`,
  };
  try {
    const { output, usage } = await generateText({
      ...args,
      output: Output.object({ schema: replySchema }),
    });
    await recordUsage(session.username, "tutor", modelId(), usage);
    // The opener is Sandra's own line; there is nothing of the learner's to
    // score, and a stray number there would hand out free XP for arriving.
    return {
      ...output,
      turnXp: learnerLine ? clampXp(output.turnXp) : 0,
    };
  } catch (err) {
    const raw = salvage(err);
    const replyPt =
      str(raw?.replyPt) || str(raw?.text) || str(raw?.reply);
    if (!replyPt) throw err;
    await recordUsage(session.username, "tutor", modelId(), {
      inputTokens: 0,
      outputTokens: Math.ceil(replyPt.length / 4),
    });
    // Salvaged from a malformed response: keep the conversation alive, but
    // award nothing rather than guess a score off a broken payload.
    return {
      replyPt,
      glossEn: str(raw?.glossEn),
      turnXp: 0,
      turnWhyEn: "",
    };
  }
}

/** The model is not trusted with the range: this number gates course progress. */
function clampXp(v: unknown): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(25, n)) : 0;
}

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

  const contentType = request.headers.get("content-type") ?? "";

  // ── mode=turn with a recording (multipart) ────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || !key.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Voz indisponível (OPENAI_API_KEY em falta) — escreve a tua resposta." },
        { status: 503 }
      );
    }
    const form = await request.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json({ error: "Sem áudio." }, { status: 400 });
    }
    if (audio.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Gravação demasiado longa." }, { status: 413 });
    }
    const topic = String(form.get("topic") ?? "").slice(0, 200);
    const voice = String(form.get("voice") ?? "").slice(0, 60);
    const cefr = String(form.get("cefr") ?? "A2").slice(0, 8);
    let history: HistoryTurn[] = [];
    try {
      history = cleanHistory(JSON.parse(String(form.get("history") ?? "[]").slice(0, 20000)));
    } catch {
      history = [];
    }

    // iOS Safari records audio/mp4; Chrome records webm — name the file to
    // match its real container or the transcriber rejects it.
    const type = audio.type || "audio/webm";
    const ext = type.includes("mp4")
      ? "mp4"
      : type.includes("mpeg") || type.includes("mp3")
        ? "mp3"
        : type.includes("ogg")
          ? "ogg"
          : type.includes("wav")
            ? "wav"
            : "webm";
    const upstream = new FormData();
    upstream.append("file", audio, `audio.${ext}`);
    upstream.append("model", process.env.STT_MODEL ?? "gpt-4o-mini-transcribe");
    upstream.append("language", "pt");
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "A transcrição falhou. Tenta outra vez." },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { text?: string };
    const heard = (data.text ?? "").trim().slice(0, 500);

    const seconds = audio.size / 8000;
    await recordUsage(session.username, "stt", "openai/gpt-4o-mini-transcribe", {
      inputTokens: Math.ceil(seconds * 10),
      outputTokens: Math.ceil(heard.length / 4),
    });

    try {
      const output = await generateReply(session, cefr, topic, history, heard);
      const audioB64 = await speak(output.replyPt, voice, session.username);
      return NextResponse.json({
        heard,
        replyPt: output.replyPt,
        glossEn: output.glossEn,
        audioB64,
        turnXp: output.turnXp,
        turnWhyEn: output.turnWhyEn,
      });
    } catch (err) {
      console.error("conversa audio turn failed:", err);
      return NextResponse.json(
        { error: "A Sandra não conseguiu responder. Tenta outra vez." },
        { status: 502 }
      );
    }
  }

  // ── JSON modes: start / turn (typed) / end ────────────────────────────────
  let body: {
    mode?: string;
    topic?: string;
    cefr?: string;
    voice?: string;
    typedText?: string;
    history?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const mode = String(body.mode ?? "");
  const cefr = String(body.cefr ?? "A2").slice(0, 8);
  const history = cleanHistory(body.history);

  if (mode === "start") {
    let topic = String(body.topic ?? "").trim().slice(0, 200);
    if (!topic || topic === "random") {
      // Stable enough randomness without Math.random-in-render concerns: this
      // is a route handler, so plain randomness is fine.
      topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    }
    /*
     * Sandra's own voice — not a draw from the pool.
     *
     * This used to be voices[hash(topic|username) % pool.length]. The pool is
     * half male, so Sandra was a man about half the time, and a different
     * person for every learner and every topic. Fixing it per session only
     * stopped her changing mid-chat; it never made her anyone in particular.
     */
    const voice = azureConfigured() ? sandraVoice() : "";

    try {
      const output = await generateReply(session, cefr, topic, [], null);
      const audioB64 = await speak(output.replyPt, voice, session.username);
      return NextResponse.json({
        topic,
        voice,
        openerPt: output.replyPt,
        glossEn: output.glossEn,
        audioB64,
      });
    } catch (err) {
      console.error("conversa start failed:", err);
      return NextResponse.json(
        { error: "A Sandra não conseguiu começar. Tenta outra vez." },
        { status: 502 }
      );
    }
  }

  if (mode === "turn") {
    const topic = String(body.topic ?? "").slice(0, 200);
    const voice = String(body.voice ?? "").slice(0, 60);
    const typed = String(body.typedText ?? "").trim().slice(0, 500);
    if (!typed) {
      return NextResponse.json({ error: "Escreve alguma coisa." }, { status: 400 });
    }
    try {
      const output = await generateReply(session, cefr, topic, history, typed);
      const audioB64 = await speak(output.replyPt, voice, session.username);
      return NextResponse.json({
        heard: typed,
        replyPt: output.replyPt,
        glossEn: output.glossEn,
        audioB64,
        turnXp: output.turnXp,
        turnWhyEn: output.turnWhyEn,
      });
    } catch (err) {
      console.error("conversa typed turn failed:", err);
      return NextResponse.json(
        { error: "A Sandra não conseguiu responder. Tenta outra vez." },
        { status: 502 }
      );
    }
  }

  if (mode === "end") {
    const topic = String(body.topic ?? "").slice(0, 200);
    if (history.length < 2) {
      return NextResponse.json({ error: "Conversa demasiado curta." }, { status: 400 });
    }
    try {
      const args = {
        model: getModel(),
        instructions: `${SANDRA}

You are reviewing a finished spoken conversation with ${session.displayName} (CEFR ${cefr}). ${await currentStyle()}${await referenceContext()}

${SPEAKING_COACHING}

This is the moment the learner finds out whether speaking was worth the nerve it took. Be warm AND be useful — praise
with nothing specific in it reads as politeness, and a list of faults reads as a verdict. Give them both, plainly.

- strengths: quote what they ACTUALLY said and name why it worked. Never invent a quote. If they genuinely said very
  little, say something true and small rather than something generous and hollow.
- wordChoice: things that were CORRECT but not what a Portuguese person would say. This is most of the distance between
  understandable and fluent, and it is invisible to a learner who only ever sees their errors. Leave it empty if their
  Portuguese was already idiomatic — do not manufacture upgrades.
- corrections: only real word-choice, verb-form or phrasing ERRORS, quoting things the learner actually said.
- speech.fluencyEn: how they held up the conversation — turn length, full sentences vs single words, whether they asked
  anything back, range of vocabulary and tenses. Be honest here. If every answer was one word, say so kindly and say
  exactly what to try next time; a learner who is told "great job" after ten one-word answers learns nothing.
- speech.soundTipEn: you are reading a TRANSCRIPT of speech-to-text. You did not hear them and you cannot judge their
  accent — never imply otherwise. Teach one European Portuguese sound instead, tied to a word they actually used.
- newWords: useful pt-PT words or short phrases that came up (from either speaker) and are worth reviewing later.

resumoMd stays a short 2-4 sentence English recap of what was discussed. The pointer now lives in speech.soundTipEn, so
do NOT repeat it there.`,
        prompt: `TOPIC: ${topic}\n\nTRANSCRIPT:\n${transcriptOf(history)}`,
      };
      let output: z.infer<typeof summarySchema>;
      try {
        const res = await generateText({
          ...args,
          output: Output.object({ schema: summarySchema }),
        });
        await recordUsage(session.username, "grade", modelId(), res.usage);
        output = res.output;
      } catch (err) {
        const raw = salvage(err);
        const loose = raw ? summarySchema.partial().safeParse(raw) : null;
        if (!loose?.success || !loose.data.resumoMd) throw err;
        output = {
          resumoMd: loose.data.resumoMd,
          strengths: loose.data.strengths ?? [],
          wordChoice: loose.data.wordChoice ?? [],
          // A salvaged response may have lost the nested object entirely.
          // Empty strings render as nothing rather than as a broken panel.
          speech: loose.data.speech ?? { fluencyEn: "", soundTipEn: "" },
          corrections: loose.data.corrections ?? [],
          newWords: loose.data.newWords ?? [],
          encouragementPt: loose.data.encouragementPt ?? "Continua assim! 💪",
        };
        await recordUsage(session.username, "grade", modelId(), {
          inputTokens: 0,
          outputTokens: Math.ceil(JSON.stringify(output).length / 4),
        });
      }

      for (const c of output.corrections.slice(0, 6)) {
        await addMistakeCard(
          session.username,
          `Diz melhor: “${c.saidPt.slice(0, 200)}”`,
          c.betterPt.slice(0, 300),
          c.tipEn.slice(0, 300)
        );
      }
      const userTurns = history.filter((t) => t.role === "eu").length;
      await logActivity(
        session.username,
        "conversa",
        `Conversa sobre ${topic || "um tema à escolha"} — ${userTurns} respostas 💬`,
        Math.min(25, 10 + userTurns * 2)
      );
      return NextResponse.json(output);
    } catch (err) {
      console.error("conversa end failed:", err);
      return NextResponse.json(
        { error: "O resumo falhou. Tenta outra vez." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "Modo desconhecido." }, { status: 400 });
}
