import Link from "next/link";
import { sql } from "drizzle-orm";
import { ClozePlayer } from "@/components/cloze-player";
import { DitadoPlayer } from "@/components/ditado-player";
import { requireSession } from "@/lib/auth";
import { getDb, refEntries } from "@/lib/db";
import { normalizeWord } from "@/lib/ditado";
import { cn } from "@/lib/utils";

export const metadata = { title: "Ditado" };

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

export default async function DitadoPage(props: PageProps<"/practice/ditado">) {
  await requireSession();
  const { modo } = await props.searchParams;
  const isCloze = modo === "cloze";

  // Five random spoken-size phrases. In full dictation ONLY ids and glosses go
  // to the client; in cloze the client also gets the sentence minus one word —
  // that missing word is what stays server-side until it is graded.
  const picks = await getDb()
    .select({ id: refEntries.id, en: refEntries.en, pt: refEntries.pt })
    .from(refEntries)
    .where(sql`${refEntries.kind} = 'phrase' and length(${refEntries.pt}) between 15 and 90`)
    .orderBy(sql`random()`)
    .limit(5);

  const clozes = isCloze
    ? picks.flatMap((p) => {
        const c = makeCloze(p.pt);
        return c ? [{ id: p.id, en: p.en, ...c }] : [];
      })
    : [];

  const tabs = [
    { href: "/practice/ditado", label: "📝 Ditado completo", on: !isCloze },
    { href: "/practice/ditado?modo=cloze", label: "🔍 Palavra escondida", on: isCloze },
  ];

  return (
    <div className="space-y-6">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">✏️ Ditado</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isCloze
            ? "Listen and fill the one missing word. The little words — de, que, à, já — are exactly the ones that disappear in fast pt-PT."
            : "The classic Portuguese school exercise: listen, write what you hear. Trains the ear for real pt-PT — swallowed vowels and all. Accents are forgiven."}
        </p>
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
          <ClozePlayer sentences={clozes} />
        )
      ) : picks.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          O livro ainda não tem frases suficientes.
        </p>
      ) : (
        <DitadoPlayer sentences={picks.map((p) => ({ id: p.id, en: p.en }))} />
      )}
    </div>
  );
}
