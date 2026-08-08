import { generateText, Output } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

const LEVELS = ["A1", "A2", "B1", "B2"];
const DEFAULT_LEVEL = "A2";

/** Ranges, not exact counts: a hard `.length(8)` turns one stubborn generation
 *  into a dead game. We over-ask and trim to the round size below. */
const paresSchema = z.object({
  pairs: z
    .array(
      z.object({
        pt: z
          .string()
          .describe(
            "One European Portuguese word or short phrase (max 4 words). Nouns MUST carry their definite article: a praia, o frigorífico."
          ),
        en: z
          .string()
          .describe("Natural British English for that item, no article games"),
      })
    )
    .min(6)
    .max(10),
});

const fraseSchema = z.object({
  items: z
    .array(
      z.object({
        pt: z
          .string()
          .describe(
            "ONE natural European Portuguese sentence of 5-10 words, in its normal word order, ending with . ? or !"
          ),
        en: z.string().describe("Natural British English translation"),
        hint: z
          .string()
          .nullable()
          .describe(
            "Max 8 words of English about the STRUCTURE, e.g. 'estar a + infinitive' or 'article before the noun'. Never translate the sentence here."
          ),
      })
    )
    .min(4)
    .max(8),
});

const GAME_RULES = `You build short, fast vocabulary GAMES for a family of English speakers learning EUROPEAN Portuguese.

${await currentStyle()}

Non-negotiable rules for every single item:
- STRICT European Portuguese. Never a Brazilian form: o autocarro (never ônibus), a casa de banho (never banheiro),
  o telemóvel (never celular), o pequeno-almoço (never café da manhã), o frigorífico (never geladeira), o comboio
  (never trem), a paragem (never ponto), o talho (never açougue), a sandes (never sanduíche), o sumo (never suco),
  a chávena (never xícara), o rés-do-chão (never térreo).
- The "tu" register with real pt-PT endings (tu fazes, tu fizeste, tu vais, tu tens) — never "você" as the everyday you.
- Continuous action is ALWAYS "estar a + infinitive" (estou a comer, ela está a trabalhar) — NEVER the gerund (estou comendo).
- Every noun is written WITH its definite article, exactly as a phrasebook would list it: a praia, o frigorífico,
  os vizinhos, a casa de banho, o multibanco.
- Ground everything in the learner's own real life: o mercado, a praia,
  os vizinhos, o multibanco, a farmácia, o talho, o autocarro, a escola.
- Respect the CEFR level: A1 concrete everyday things and set phrases; A2 simple everyday sentences in present and
  perfeito; B1 opinions, plans and past narration; B2 nuance, connectors and idiom.
- The English is natural British English, not a word-for-word gloss.`;

type Pair = { pt: string; en: string };
type Item = { pt: string; en: string; hint: string | null };

function clean(s: string, max: number): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function key(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

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

  let body: { game?: string; topic?: string; level?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const game = body.game === "frase" ? "frase" : body.game === "pares" ? "pares" : null;
  if (!game) {
    return NextResponse.json({ error: "Jogo desconhecido." }, { status: 400 });
  }
  const topic = clean(String(body.topic ?? ""), 200) || "o dia a dia em casa";
  const rawLevel = String(body.level ?? "").toUpperCase().slice(0, 8);
  const level = LEVELS.includes(rawLevel) ? rawLevel : DEFAULT_LEVEL;

  try {
    if (game === "pares") {
      const { output, usage } = await generateText({
        model: getModel(),
        output: Output.object({ schema: paresSchema }),
        instructions: `${GAME_RULES}

THIS GAME — "Jogo dos pares": the learner sees the Portuguese and the English shuffled on a board and taps one of each
to match them against the clock. So each pair must be UNAMBIGUOUS: no two pairs may share an English meaning, and no
two Portuguese items may be near-synonyms — the board has to have exactly one right answer for every tile.
Keep every Portuguese item short enough to read at a glance on a phone: one word, or a phrase of at most four words.`,
        prompt: `Write 8 Portuguese ↔ English pairs about "${topic}" at CEFR level ${level}.
Mix the kinds of item: mostly nouns with their article, plus two or three useful verbs or short everyday phrases about the same topic.`,
      });
      await recordUsage(session.username, "jogo-pares", modelId(), usage);

      const seen = new Set<string>();
      const pairs: Pair[] = [];
      for (const p of output.pairs) {
        const pt = clean(p.pt ?? "", 60);
        const en = clean(p.en ?? "", 60);
        if (!pt || !en) continue;
        if (seen.has(key(pt)) || seen.has(key(en))) continue;
        seen.add(key(pt));
        seen.add(key(en));
        pairs.push({ pt, en });
        if (pairs.length === 8) break;
      }
      if (pairs.length < 6) {
        return NextResponse.json(
          { error: "A Luna baralhou-se nas palavras. Tenta outra vez." },
          { status: 502 }
        );
      }
      return NextResponse.json({ pairs, topic, level });
    }

    const { output, usage } = await generateText({
      model: getModel(),
      output: Output.object({ schema: fraseSchema }),
      instructions: `${GAME_RULES}

THIS GAME — "Constrói a frase": the sentence is cut into word tiles, shuffled, and the learner taps them back into order,
with two decoy words mixed in. So every sentence must have ONE natural order that a Portuguese person would actually use.
Avoid sentences that would still sound right scrambled (no bare lists, no "A e B e C"), avoid repeating the same word twice
in one sentence, and keep them between 5 and 10 words. Punctuation only at the very end.`,
      prompt: `Write 6 sentences about "${topic}" at CEFR level ${level}.
Vary them: a statement, a question, a negative, one about the past, one about what someone is doing right now
(estar a + infinitive), one about a plan. Each one must be something the learner would really say where they live.`,
    });
    await recordUsage(session.username, "jogo-frase", modelId(), usage);

    const seen = new Set<string>();
    const items: Item[] = [];
    for (const it of output.items) {
      const pt = clean(it.pt ?? "", 160);
      const en = clean(it.en ?? "", 200);
      if (!pt || !en) continue;
      const words = pt.split(" ").filter(Boolean).length;
      if (words < 4 || words > 12) continue;
      if (seen.has(key(pt))) continue;
      seen.add(key(pt));
      items.push({ pt, en, hint: it.hint ? clean(it.hint, 90) : null });
      if (items.length === 6) break;
    }
    if (items.length < 4) {
      return NextResponse.json(
        { error: "A Luna baralhou-se nas frases. Tenta outra vez." },
        { status: 502 }
      );
    }
    return NextResponse.json({ items, topic, level });
  } catch {
    return NextResponse.json(
      { error: "A Luna não conseguiu preparar o jogo. Tenta outra vez." },
      { status: 502 }
    );
  }
}
