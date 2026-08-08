import Link from "next/link";
import { eq, sql, type SQL } from "drizzle-orm";
import { ClozePlayer } from "@/components/cloze-player";
import { DitadoPlayer } from "@/components/ditado-player";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { categories, getDb, refEntries } from "@/lib/db";
import { normalizeWord } from "@/lib/ditado";
import { unitContextFrom } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

export const metadata = { title: "Ditado" };

/** Read one value out of async searchParams. */
function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

/**
 * Words that would match half the phrasebook, so they carry no topic signal:
 * the ordinary glue of Portuguese, plus the instruction verbs every unit topic
 * is written with ("Ouvir e completar frases sobre…"). Those describe the
 * exercise, not the vocabulary.
 */
const TOPIC_STOP = new Set([
  "que", "dos", "das", "com", "por", "para", "mais", "muito", "também",
  "como", "quando", "antes", "depois", "sobre", "entre", "numa", "sem",
  "pelo", "pela", "uma", "uns", "umas", "este", "esta", "isso",
  "the", "and", "with", "for", "your", "you", "about",
  "ouvir", "escutar", "completar", "completando", "praticar", "praticando",
  "treinar", "usar", "usando", "escrever", "dizer", "frase", "frases",
  "palavra", "palavras", "expressão", "expressões", "curta", "curtas",
  "curto", "curtos", "incluindo", "exemplo", "exemplos", "tema", "nível",
  "contraste", "forma", "formas", "habitual",
  // modals and fillers: they are in half the phrasebook, so a hit on one says
  // nothing about the topic
  "pode", "podes", "posso", "podia", "dava", "será", "quero", "queres",
  "preciso", "precisas", "algum", "alguma", "alguns", "algumas", "coisa",
  "coisas", "outro", "outra", "outros", "outras", "tudo", "nada", "aqui",
  "onde",
]);

/**
 * The handful of words in a unit topic worth searching the book for. Longest
 * first: in Portuguese the content words (*eletrodomésticos*, *frigorífico*)
 * are the long ones — the glue that survived the stop list is short.
 */
function topicTerms(tema: string): string[] {
  const words = tema
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 4 && !TOPIC_STOP.has(w));
  return [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 12);
}

/** How many topic words a row hits, across its text, its section and its
 *  category — 0 for a row that has nothing to do with the topic. */
function topicScore(terms: string[]): SQL {
  return sql.join(
    terms.map((t) => {
      const like = `%${t}%`;
      return sql`(case when ${refEntries.pt} ilike ${like} or ${refEntries.en} ilike ${like} or ${refEntries.section} ilike ${like} or ${categories.namePt} ilike ${like} or ${categories.nameEn} ilike ${like} then 1 else 0 end)`;
    }),
    sql` + `
  );
}

/** The little words that vanish in fast pt-PT — the ones worth hiding. */
const FUNCTION_WORDS = new Set(
  [
    "que", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "para", "por", "pelo", "pela", "com", "ao", "aos", "à", "às", "o", "a",
    "os", "as", "um", "uma", "se", "te", "me", "lhe", "é", "está", "são",
    "foi", "tem", "há", "mais", "muito", "também", "já", "não",
  ].map(normalizeWord)
);

/** Choose one word to hide: a reduced function word if the sentence has one
 *  (never the first word), otherwise any word from the middle. */
function makeCloze(
  pt: string
): { masked: string; blankIndex: number } | null {
  const tokens = pt.split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return null;

  const indices = tokens.map((_, i) => i);
  const functionIdxs = indices.filter(
    (i) => i > 0 && FUNCTION_WORDS.has(normalizeWord(tokens[i]))
  );
  const middleIdxs = indices.filter((i) => i > 0 && i < tokens.length - 1);
  const pool =
    functionIdxs.length > 0
      ? functionIdxs
      : middleIdxs.length > 0
        ? middleIdxs
        : [1];

  const blankIndex = pool[Math.floor(Math.random() * pool.length)];
  if (!normalizeWord(tokens[blankIndex])) return null;

  const masked = tokens
    .map((w, i) => (i === blankIndex ? "____" : w))
    .join(" ");
  return { masked, blankIndex };
}

/** Sentences per round, and how many we fetch to get there (cloze throws away
 *  anything too short to hide a word in). */
const ROUND = 5;
const POOL = 8;

export default async function DitadoPage(props: PageProps<"/practice/ditado">) {
  await requireSession();
  const sp = await props.searchParams;
  const isCloze = one(sp.modo) === "cloze";
  const tema = one(sp.tema).slice(0, 300);
  const unit = await unitContextFrom(sp);

  // Spoken-size phrases, the ones about the topic first. In full dictation ONLY
  // ids and glosses go to the client; in cloze the client also gets the
  // sentence minus one word — that missing word stays server-side until it is
  // graded.
  //
  // The topic only RANKS, it never filters: a grammar step ("o artigo definido
  // antes do possessivo") matches nothing in the phrasebook, and a round of
  // five ordinary phrases is infinitely better than an empty screen.
  const terms = topicTerms(tema);
  const rows = await getDb()
    .select({ id: refEntries.id, en: refEntries.en, pt: refEntries.pt })
    .from(refEntries)
    .innerJoin(categories, eq(categories.id, refEntries.categoryId))
    .where(sql`${refEntries.kind} = 'phrase' and length(${refEntries.pt}) between 15 and 90`)
    .orderBy(
      ...(terms.length > 0 ? [sql`(${topicScore(terms)}) desc`] : []),
      sql`random()`
    )
    .limit(POOL);

  // Dedupe by the sentence itself, not the row id. The book genuinely holds
  // the same phrase twice in places, and topic ranking scores identical text
  // identically — so duplicates now sort ADJACENTLY where random ordering used
  // to scatter them. Frase 1 and frase 2 came out the same sentence.
  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    const key = r.pt.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const picks = unique.slice(0, ROUND);
  const clozes = isCloze
    ? unique
        .flatMap((p) => {
          const c = makeCloze(p.pt);
          return c ? [{ id: p.id, en: p.en, ...c }] : [];
        })
        .slice(0, ROUND)
    : [];

  // Switching mode must not drop the topic or the unit that sent you here.
  const carry = new URLSearchParams();
  if (tema) carry.set("tema", tema);
  if (unit) {
    carry.set("unidade", unit.slug);
    if (unit.itemId) carry.set("item", String(unit.itemId));
  }
  const extra = carry.toString();
  const tabs = [
    {
      href: `/practice/ditado${extra ? `?${extra}` : ""}`,
      label: "📝 Ditado completo",
      on: !isCloze,
    },
    {
      href: `/practice/ditado?modo=cloze${extra ? `&${extra}` : ""}`,
      label: "🔍 Palavra escondida",
      on: isCloze,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        {unit ? (
          <UnitReturn unit={unit} />
        ) : (
          <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
            ← Praticar
          </Link>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">✏️ Ditado</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isCloze
            ? "Listen and fill the one missing word. The little words — de, que, à, já — are exactly the ones that disappear in fast pt-PT."
            : "The classic Portuguese school exercise: listen, write what you hear. Trains the ear for real pt-PT — swallowed vowels and all. Accents are forgiven."}
        </p>
        {tema ? (
          <p className="mt-2">
            {/* Unit topics are written as whole sentences — show enough to
                recognise the step, not enough to swallow the screen. */}
            <span className="chip bg-cream text-ink-soft">
              🎯 {tema.length > 80 ? `${tema.slice(0, 80).trimEnd()}…` : tema}
            </span>
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              t.on
                ? "border-olive bg-olive text-paper"
                : "border-sand bg-white/70 hover:border-sage"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {isCloze ? (
        clozes.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            O livro ainda não tem frases suficientes.
          </p>
        ) : (
          <ClozePlayer sentences={clozes} unit={unit} />
        )
      ) : picks.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          O livro ainda não tem frases suficientes.
        </p>
      ) : (
        <DitadoPlayer
          sentences={picks.map((p) => ({ id: p.id, en: p.en }))}
          unit={unit}
        />
      )}
    </div>
  );
}
