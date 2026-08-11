import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { ClozePlayer } from "@/components/cloze-player";
import { DitadoPlayer } from "@/components/ditado-player";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { categories, getDb, refEntries } from "@/lib/db";
import { normalizeWord } from "@/lib/ditado";
import { sortByTopic } from "@/lib/topic-match";
import { unitContextFrom } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

export const metadata = { title: "Ditado" };

/** Read one value out of async searchParams. */
function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
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
  pt: string,
  /** Stable picker input, so the same sentence hides the same word all round. */
  pick: number
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

  // Deterministic, not random: with Math.random the hidden word changed on
  // every reload, so the answer you just got wrong became a different question.
  const blankIndex = pool[pick % pool.length];
  if (!normalizeWord(tokens[blankIndex])) return null;

  const masked = tokens
    .map((w, i) => (i === blankIndex ? "____" : w))
    .join(" ");
  return { masked, blankIndex };
}

/** Sentences per round. */
const ROUND = 5;

/**
 * How much of the phrasebook to rank in memory. Spoken-size phrases number ~130
 * today, so this takes the whole eligible set — which is the point: the topic
 * ranking sees every candidate, so a step whose only two matching phrases sit
 * anywhere in the book still finds them. If the book ever outgrows this the
 * ranking degrades to "the best of a random 500", not to nothing.
 */
const CANDIDATES = 500;

export default async function DitadoPage(props: PageProps<"/practice/ditado">) {
  await requireSession();
  const sp = await props.searchParams;
  const isCloze = one(sp.modo) === "cloze";
  const tema = one(sp.tema).slice(0, 300);
  /*
   * A stable seed for this run.
   *
   * The sentences used to come back ORDER BY random(), so switching between
   * "Ditado completo" and "Palavra escondida" — or coming back at all — dealt
   * a brand new set and threw away everything already answered. The seed rides
   * in the URL and both mode links carry it, so the two modes are two views of
   * ONE round rather than two unrelated ones.
   */
  const seed = one(sp.s) || Math.random().toString(36).slice(2, 10);
  const unit = await unitContextFrom(sp);

  // Spoken-size phrases in random order. In full dictation ONLY ids and glosses
  // go to the client; in cloze the client also gets the sentence minus one word
  // — that missing word stays server-side until it is graded.
  const rows = await getDb()
    .select({
      id: refEntries.id,
      en: refEntries.en,
      pt: refEntries.pt,
      section: refEntries.section,
      categoryPt: categories.namePt,
      categoryEn: categories.nameEn,
    })
    .from(refEntries)
    .innerJoin(categories, eq(categories.id, refEntries.categoryId))
    .where(sql`${refEntries.kind} = 'phrase' and length(${refEntries.pt}) between 15 and 90`)
    // Deterministic per seed: same round on a reload or a mode switch.
    .orderBy(sql`md5(${refEntries.id}::text || ${seed})`)
    .limit(CANDIDATES);

  // Now the ones about the topic first. `sortByTopic` keeps every row and is a
  // stable sort, so the random order above survives as the tiebreak — the topic
  // only RANKS, it never filters. A grammar step ("o artigo definido antes do
  // possessivo") matches nothing in the phrasebook, and a round of five ordinary
  // phrases is infinitely better than an empty screen.
  //
  // The category name is matched alongside the sentence because it turned out to
  // be the strongest signal in the book: the phrases filed under "Cozinha" are
  // about the kitchen whether or not any one of them says so.
  const ranked = sortByTopic(
    rows,
    tema,
    (r) => `${r.pt} ${r.en} ${r.section} ${r.categoryPt} ${r.categoryEn}`
  );

  // Dedupe by the sentence itself, not the row id. The book genuinely holds
  // the same phrase twice in places, and topic ranking scores identical text
  // identically — so duplicates sort ADJACENTLY where random ordering used
  // to scatter them. Frase 1 and frase 2 came out the same sentence.
  const seen = new Set<string>();
  const unique = ranked.filter((r) => {
    const key = r.pt.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const picks = unique.slice(0, ROUND);
  const clozes = isCloze
    ? unique
        .flatMap((p) => {
          const c = makeCloze(p.pt, p.id);
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
  carry.set("s", seed);
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
          // Keyed on the sentence ids: "Outras frases" refreshes this server
          // component, and without a key React keeps the player mounted with
          // its finished/score state intact, so the completion card just
          // re-renders and the button appears to do nothing.
          <ClozePlayer
            key={clozes.map((c) => c.id).join(",")}
            sentences={clozes}
            unit={unit}
          />
        )
      ) : picks.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          O livro ainda não tem frases suficientes.
        </p>
      ) : (
        <DitadoPlayer
          key={picks.map((p) => p.id).join(",")}
          sentences={picks.map((p) => ({ id: p.id, en: p.en }))}
          unit={unit}
        />
      )}
    </div>
  );
}
