import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { UnitNote } from "@/components/unit-note";
import { UnitPath, UnitPathBuild, type PathItem } from "@/components/unit-path";
import { UnitReview } from "@/components/unit-review";
import { getCompletedItemIds } from "@/lib/actions/course";
import { getRole, requireSession } from "@/lib/auth";
import { isItemKind, KIND_META, type ItemKind } from "@/lib/course";
import { categories, getDb, unitItems, units } from "@/lib/db";

type ItemConfig = { topic?: string; level?: string };

type ItemRow = {
  id: number;
  kind: string;
  titlePt: string;
  config: unknown;
  catSlug: string | null;
  catName: string | null;
};

/** Rows written before the path generator used lib/course's vocabulary. */
function normalizeKind(raw: string): ItemKind | null {
  const k = raw.trim().toLowerCase();
  if (isItemKind(k)) return k;
  if (k === "category" || k === "reference") return "vocab";
  if (k === "listening") return "escutar";
  return null;
}

/**
 * Every item resolves to a screen that ALREADY EXISTS, and carries its topic
 * with it — the learner lands on something ready to run, never on an empty
 * form they have to fill in themselves.
 */
function resolve(
  item: ItemRow,
  unitSlug: string
): { kind: ItemKind; href: string; hint: string } | null {
  const kind = normalizeKind(item.kind);
  if (!kind) return null;

  const config = (item.config ?? {}) as ItemConfig;
  const topic = (config.topic ?? "").trim();
  const q = encodeURIComponent(topic);
  const about = topic ? topic : KIND_META[kind].trains;

  switch (kind) {
    // Every destination gets the topic AND the unit it came from, so nothing
    // lands on an empty form and everything knows the way back.
    case "vocab":
      if (!item.catSlug) return null; // a phrasebook link with no category is a dead end
      return {
        kind,
        href: `/reference/${item.catSlug}`,
        hint: item.catName ?? "livro de referência",
      };
    case "quiz":
      return { kind, href: topic ? `/practice?topic=${q}` : "/practice", hint: about };
    case "jogo-pares":
      return {
        kind,
        href: `/jogos/pares?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "jogo-frase":
      return {
        kind,
        href: `/jogos/frase?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "ditado":
      return {
        kind,
        href: `/practice/ditado?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "cloze":
      return {
        kind,
        href: `/practice/ditado?modo=cloze&${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "verbos":
      return {
        kind,
        href: `/practice/verbos?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "escutar":
      return {
        kind,
        href: `/escutar?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "story":
      return {
        kind,
        href: `/stories?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "falar":
      return {
        kind,
        href: `/practice/falar?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "conversa":
      return {
        kind,
        href: `/practice/conversa?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
    case "homework":
      return {
        kind,
        href: `/homework?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}`,
        hint: about,
      };
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
    })
    .from(unitItems)
    .leftJoin(categories, eq(categories.id, unitItems.refId))
    .where(eq(unitItems.unitId, unit.id))
    .orderBy(asc(unitItems.sortOrder), asc(unitItems.id));

  const doneIds = new Set(
    items.length > 0 ? await getCompletedItemIds(unit.id) : []
  );

  const path: PathItem[] = items.flatMap((item) => {
    const target = resolve(item, unit.slug);
    if (!target) return [];
    return [
      {
        id: item.id,
        kind: target.kind,
        titlePt: item.titlePt || KIND_META[target.kind].label,
        href: target.href,
        hint: target.hint,
        done: doneIds.has(item.id),
      },
    ];
  });

  const isDraft = unit.status !== "published";
  // The banner promises "Kelly reads it before the class sees it" — so honour
  // that. A student with a guessed slug could otherwise read a draft AND make
  // it spend AI calls building itself.
  if (isDraft && !isStaff) notFound();

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

      {path.length > 0 ? (
        <UnitPath items={path} />
      ) : items.length === 0 ? (
        <UnitPathBuild unitId={unit.id} />
      ) : (
        // Items exist but none resolves to a screen — never re-trigger the
        // generator here, or the page would spin on "a montar…" forever.
        <p className="card p-6 text-center text-sm text-ink-soft">
          As atividades desta unidade já não abrem em lado nenhum.{" "}
          <span className="text-ink-faint">
            Ask Kelly to rebuild this unit&apos;s path.
          </span>
        </p>
      )}

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
