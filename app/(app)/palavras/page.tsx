import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { VerbConjugator } from "@/components/verb-conjugator";
import { requireSession } from "@/lib/auth";
import { getCategoriesWithCounts } from "@/lib/data";
import { countDue, srsByCategory } from "@/lib/srs";
import { cn } from "@/lib/utils";

export const metadata = { title: "Palavras" };

/**
 * Palavras — vocabulary, spaced review, and the verb tables.
 *
 * The O Caminho redesign folded the old Praticar tab away; the parts of it
 * that are about WORDS live here. The review queue is the top of the screen
 * because it is the only thing on this page with a deadline — everything else
 * is reference you browse when you feel like it.
 *
 * `?tab=verbos` rather than client state: it is a real place, so it should
 * survive a reload and be linkable from a unit step.
 */
export default async function PalavrasPage(props: PageProps<"/palavras">) {
  const session = await requireSession();
  const sp = await props.searchParams;
  const tab = (Array.isArray(sp.tab) ? sp.tab[0] : sp.tab) === "verbos"
    ? "verbos"
    : "vocab";

  const [due, categories, srs] = await Promise.all([
    countDue(session.username).catch(() => 0),
    getCategoriesWithCounts().catch(() => []),
    srsByCategory(session.username),
  ]);
  const srsFor = new Map(srs.map((s) => [s.categoryId, s]));

  return (
    <div className="space-y-6">
      <AzulejoHeader title="Palavras" subtitle="O teu vocabulário e os verbos">
        <div className="flex gap-1 rounded-2xl bg-paper/15 p-1">
          {[
            { key: "vocab", label: "Vocabulário", href: "/palavras" },
            { key: "verbos", label: "Verbos", href: "/palavras?tab=verbos" },
          ].map((t) => (
            <Link
              key={t.key}
              href={t.href}
              aria-current={tab === t.key ? "page" : undefined}
              className={cn(
                "flex min-h-10 flex-1 items-center justify-center rounded-xl text-[13.5px] font-semibold transition-colors",
                tab === t.key
                  ? "bg-paper text-olive"
                  : "text-paper/70 hover:text-paper"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </AzulejoHeader>

      {tab === "verbos" ? (
        // Full width, nothing beside it — it is a reference surface, not a card.
        <VerbConjugator initialVerb="ir" initialTense="presente" />
      ) : (
        <>
          {/* The only thing here with a deadline. */}
          <Link
            href="/practice/rever"
            className="flex items-center gap-4 rounded-[18px] bg-terra-pale px-4 py-4 transition-colors hover:bg-terra-pale/70"
          >
            <span className="font-display text-[34px] leading-none font-semibold text-terra-dark">
              {due}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold">
                {due === 1 ? "palavra para rever" : "palavras para rever"}
              </span>
              <span className="block text-[12.5px] text-terra-dark/85">
                Repetição espaçada · {Math.max(1, Math.round(due / 6))} min
              </span>
            </span>
            <span className="text-lg text-terra-dark" aria-hidden>
              →
            </span>
          </Link>

          <section className="space-y-2">
            <p className="label">O livro</p>
            {categories.length === 0 ? (
              <p className="card p-6 text-center text-sm text-ink-soft">
                O livro ainda está vazio.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => {
                  const s = srsFor.get(c.id);
                  return (
                    <Link
                      key={c.id}
                      href={`/reference/${c.slug}`}
                      className="card flex items-center gap-3 p-4 transition-all hover:border-sage hover:shadow-md"
                    >
                      <span className="text-2xl" aria-hidden>
                        {c.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[16.5px] font-medium">
                          {c.namePt}
                        </span>
                        <span className="block text-xs text-ink-faint">
                          {c.nameEn} · {c.entryCount}{" "}
                          {c.entryCount === 1 ? "palavra" : "palavras"}
                        </span>
                      </span>
                      {/* Terra = due, sage = in the deck and settled. Silence
                          when nothing from here has been studied — an empty
                          dot would read as "nothing due" rather than "not
                          started", which are very different things. */}
                      {s && s.known > 0 ? (
                        <span
                          title={
                            s.due > 0
                              ? `${s.due} para rever`
                              : `${s.known} no baralho`
                          }
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            s.due > 0 ? "bg-terra" : "bg-sage-light"
                          )}
                        />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <p className="text-xs text-ink-faint">
            Também podes treinar com{" "}
            <Link href="/practice/ditado" className="underline underline-offset-2 hover:text-olive">
              ditado
            </Link>
            ,{" "}
            <Link href="/practice/ditado?modo=cloze" className="underline underline-offset-2 hover:text-olive">
              frases com lacunas
            </Link>{" "}
            ou o{" "}
            <Link href="/practice" className="underline underline-offset-2 hover:text-olive">
              resto das práticas
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
