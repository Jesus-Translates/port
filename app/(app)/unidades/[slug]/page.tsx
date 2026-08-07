import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { UnitNote } from "@/components/unit-note";
import { UnitReview } from "@/components/unit-review";
import { getRole, requireSession } from "@/lib/auth";
import { categories, getDb, unitItems, units } from "@/lib/db";

type ItemConfig = { topic?: string; level?: string };

type ItemRow = {
  id: number;
  kind: string;
  titlePt: string;
  config: unknown;
  catSlug: string | null;
  catName: string | null;
  catEmoji: string | null;
};

/** Every unit item resolves to a screen that already exists. */
function resolve(item: ItemRow): {
  href: string;
  emoji: string;
  hint: string;
} | null {
  const config = (item.config ?? {}) as ItemConfig;
  const topic = (config.topic ?? "").trim();
  switch (item.kind) {
    case "quiz":
      return {
        href: topic ? `/practice?topic=${encodeURIComponent(topic)}` : "/practice",
        emoji: "🎯",
        hint: topic ? `Teste sobre ${topic}` : "Teste",
      };
    case "ditado":
      return { href: "/practice/ditado", emoji: "✏️", hint: "Ditado" };
    case "verbos":
      return { href: "/practice/verbos", emoji: "⚡", hint: "Conjugação" };
    case "story":
      return {
        href: "/stories",
        emoji: "📕",
        hint: topic ? `História sobre ${topic}` : "História",
      };
    case "homework":
      return {
        href: topic ? `/homework?topic=${encodeURIComponent(topic)}` : "/homework",
        emoji: "✍️",
        hint: topic ? `TPC sobre ${topic}` : "TPC",
      };
    case "category":
      if (!item.catSlug) return null;
      return {
        href: `/reference/${item.catSlug}`,
        emoji: item.catEmoji || "📖",
        hint: item.catName ? `Livro — ${item.catName}` : "Livro de referência",
      };
    default:
      return null;
  }
}

export default async function UnidadePage(props: PageProps<"/unidades/[slug]">) {
  const session = await requireSession();
  const { slug } = await props.params;
  const isStaff = getRole(session.username) !== "student";

  const db = getDb();
  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.slug, slug))
    .limit(1);
  if (!unit) notFound();

  const items = await db
    .select({
      id: unitItems.id,
      kind: unitItems.kind,
      titlePt: unitItems.titlePt,
      config: unitItems.config,
      catSlug: categories.slug,
      catName: categories.namePt,
      catEmoji: categories.emoji,
    })
    .from(unitItems)
    .leftJoin(categories, eq(categories.id, unitItems.refId))
    .where(eq(unitItems.unitId, unit.id))
    .orderBy(asc(unitItems.sortOrder), asc(unitItems.id));

  const isDraft = unit.status !== "published";

  return (
    <article className="space-y-5">
      <header>
        <Link href="/unidades" className="text-xs text-ink-faint hover:text-olive">
          ← Unidades
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {unit.title}
          </h1>
          <span className="chip">{unit.cefr}</span>
          {unit.category ? (
            <span className="chip bg-cream text-ink-soft">{unit.category}</span>
          ) : null}
          {isDraft ? (
            <span className="chip bg-terra-pale text-terra-dark">rascunho</span>
          ) : null}
        </div>
      </header>

      {isDraft ? (
        <p className="rounded-2xl border-l-4 border-terra bg-terra-pale/60 px-4 py-3 text-sm text-terra-dark">
          Rascunho — à espera da revisão da professora.{" "}
          <span className="text-terra-dark/80">
            Still a draft: Kelly reads it before the class sees it.
          </span>
        </p>
      ) : null}

      {isStaff ? (
        <UnitReview id={unit.id} status={unit.status} noteMd={unit.noteMd} />
      ) : null}

      <UnitNote unitId={unit.id} noteMd={unit.noteMd} />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">
          O caminho{" "}
          <span className="text-sm font-normal text-ink-faint">
            · work through these in order
          </span>
        </h2>
        {items.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Esta unidade ainda não tem atividades.
          </p>
        ) : (
          <ol className="space-y-2">
            {items.map((item, i) => {
              const target = resolve(item);
              if (!target) return null;
              return (
                <li key={item.id}>
                  <Link
                    href={target.href}
                    className="card flex items-center gap-3 p-4 transition-colors hover:border-sage hover:bg-sage-pale/40"
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream text-lg"
                      aria-hidden
                    >
                      {target.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {i + 1}. {item.titlePt}
                      </span>
                      <span className="block truncate text-xs text-ink-faint">
                        {target.hint}
                      </span>
                    </span>
                    <span className="shrink-0 text-ink-faint" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <footer className="card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-medium">Dúvidas sobre esta unidade?</span>
        <Link
          href={`/tutor?q=${encodeURIComponent(`Tenho dúvidas sobre a unidade "${unit.title}".`)}`}
          className="btn-ghost text-sm"
        >
          🌙 Falar com a Luna
        </Link>
      </footer>
    </article>
  );
}
