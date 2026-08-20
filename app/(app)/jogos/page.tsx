import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { Bi } from "@/components/bilingual";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { KIND_META, type ItemKind } from "@/lib/course";

export const metadata = { title: "Jogos" };

const LEVELS = ["A1", "A2", "B1", "B2"];

/** Everyday things worth playing with, in their own streets. */
const SUGGESTIONS = [
  "o mercado",
  "a praia",
  "o pequeno-almoço",
  "no talho",
  "o multibanco",
  "a casa de banho",
  "os vizinhos",
  "apanhar o autocarro",
  "a farmácia",
  "o tempo e o vento",
];

const GAMES = [
  {
    kind: "jogo-pares" as const,
    action: "/jogos/pares",
    pt: "Liga cada palavra portuguesa ao seu par em inglês, contra o relógio.",
    en: "Recognition and speed — 8 pairs, one timer, every wrong tap costs you.",
  },
  {
    kind: "jogo-frase" as const,
    action: "/jogos/frase",
    pt: "Monta a frase palavra a palavra — com duas palavras a mais só para te enganar.",
    en: "Word order — the decoy tiles are what make you read, not just unscramble.",
  },
];

const QUICK_GAMES = [
  {
    kind: "jogo-genero" as const,
    href: "/jogos/genero",
    pt: "O ou A? Vinte substantivos, seis segundos cada.",
    en: "Gender — the mistake nobody corrects out loud, so it sticks for years.",
  },
  {
    kind: "jogo-verbo" as const,
    href: "/jogos/verbo",
    pt: "“tu fazes” ou “tu fazem”? Diz se está certo antes de pensar demais.",
    en: "Judge a form fast — the skill you use listening, not writing.",
  },
  {
    // Not a unit-path item kind — it deals from the verb tables rather than
    // from a syllabus step — so it carries its own label instead of going
    // through KIND_META.
    kind: "cartoes" as const,
    href: "/jogos/cartoes",
    emoji: "🎴",
    label: "Cartões de verbos",
    pt: "Vira o cartão, diz a resposta de cabeça, confirma. Escolhe o tempo.",
    en: "Flashcards — the fastest way through a paradigm, in any tense you pick.",
  },
  {
    kind: "jogo-responde" as const,
    href: "/jogos/responde",
    pt: "Alguém fala contigo. O que respondes?",
    en: "Adjacency pairs — knowing what comes back, not just what words mean.",
  },
  {
    kind: "jogo-intruso" as const,
    href: "/jogos/intruso",
    pt: "Quatro palavras, três da mesma família. Qual é a intrusa?",
    en: "No English on screen — group the words in Portuguese.",
  },
];

export default async function JogosPage(props: PageProps<"/jogos">) {
  await requireSession();
  const sp = await props.searchParams;
  const raw = sp.topic;
  const topic = (Array.isArray(raw) ? raw[0] : (raw ?? "")).slice(0, 200);
  const level = await getMyCefr();

  return (
    <div className="space-y-6">
      <AzulejoHeader
        title="Jogos"
        subtitle="Dois jogos rápidos sobre o tema que quiseres — as palavras que falhares vão parar ao teu baralho de revisão. Pick a topic, play a round, and your misses become flashcards."
      />

      {/* A plain GET form: type the topic once, then tap the game you want.
          Each card is the form's submit button, so it works with one thumb. */}
      <form method="get" className="space-y-4">
        <div className="card flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-48 flex-1">
            <label className="label" htmlFor="jogo-topic">
              Sobre o quê?
            </label>
            <input
              id="jogo-topic"
              name="topic"
              defaultValue={topic}
              list="jogo-topicos"
              maxLength={200}
              className="input"
              placeholder="ex.: comprar peixe no mercado"
              autoCapitalize="off"
              autoComplete="off"
            />
            <datalist id="jogo-topicos">
              {SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="jogo-level">
              Nível
            </label>
            <select
              id="jogo-level"
              name="level"
              defaultValue={level}
              className="input"
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => {
            const meta = KIND_META[g.kind];
            return (
              <button
                key={g.kind}
                type="submit"
                formAction={g.action}
                className="card group cursor-pointer p-5 text-left transition-all hover:border-sage hover:shadow-md active:scale-[0.99]"
              >
                <div className="text-3xl" aria-hidden>
                  {meta.emoji}
                </div>
                <div className="mt-2 font-display text-lg font-semibold group-hover:text-olive">
                  {meta.label}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{g.pt}</p>
                <p className="mt-1 text-xs text-ink-faint">{g.en}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-terra">
                  <Bi pt="Jogar →" en="Play" inline />
                </span>
              </button>
            );
          })}
        </div>
      </form>

      <p className="text-center text-xs text-ink-faint">
        Sem tema? Deixa em branco — a Sandra escolhe coisas do dia a dia.
      </p>

      {/* These three deal from the phrasebook and the verb tables instead of
          asking a model, so they start instantly and cost nothing to replay —
          which is what you want from the part of the app meant to be fun. */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Começar já</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Sem tema, sem espera.{" "}
          <span className="text-ink-faint">
            No setup — these run straight from your phrasebook and verb tables.
          </span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_GAMES.map((g) => {
            const known = g.kind in KIND_META ? KIND_META[g.kind as ItemKind] : null;
            const meta = {
              emoji: ("emoji" in g ? g.emoji : known?.emoji) ?? "🎲",
              label: ("label" in g ? g.label : known?.label) ?? g.kind,
            };
            return (
              <Link
                key={g.kind}
                href={g.href}
                className="card group p-5 transition-all hover:border-sage hover:shadow-md active:scale-[0.99]"
              >
                <div className="text-3xl" aria-hidden>
                  {meta.emoji}
                </div>
                <div className="mt-2 font-display text-lg font-semibold group-hover:text-olive">
                  {meta.label}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{g.pt}</p>
                <p className="mt-1 text-xs text-ink-faint">{g.en}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-terra">
                  <Bi pt="Jogar →" en="Play" inline />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
