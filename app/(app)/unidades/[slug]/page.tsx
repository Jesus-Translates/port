import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { UnitNote } from "@/components/unit-note";
import { UnitPath, UnitPathBuild, type PathItem } from "@/components/unit-path";
import { UnitReview } from "@/components/unit-review";
import { getCompletedItemIds, getCourseProgress } from "@/lib/actions/course";
import { roleOf, requireSession } from "@/lib/auth";
import { KIND_META, type ItemKind } from "@/lib/course";
import { resolve, type ItemRow } from "@/lib/unit-href";
import { sortByPath } from "@/lib/learning-path";
import { getMyPrefs } from "@/lib/actions/profile";
import { categories, getDb, unitItems, units } from "@/lib/db";

export default async function UnidadePage(props: PageProps<"/unidades/[slug]">) {
  const session = await requireSession();
  const { slug } = await props.params;
  const isStaff = await roleOf(session.username) !== "student";

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

  // The unit after this one, for the 100% hand-off.
  const course = await getCourseProgress().catch(() => null);
  const nextUnit =
    course?.next && course.next.slug !== unit.slug
      ? { slug: course.next.slug, title: course.next.title }
      : null;

  // Same ordering the dashboard used to pick "next", so the two agree.
  const ordered = sortByPath(items, await getMyPrefs().catch(() => null));
  const path: PathItem[] = ordered.flatMap((item) => {
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
  // The banner promises a draft is reviewed before learners see it — so honour
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
            Still a draft — it is reviewed before learners see it.
          </span>
        </p>
      ) : null}

      {isStaff ? (
        <UnitReview id={unit.id} status={unit.status} noteMd={unit.noteMd} />
      ) : null}

      <UnitNote unitId={unit.id} noteMd={unit.noteMd} />

      {path.length > 0 ? (
        <UnitPath items={path} nextUnit={nextUnit} />
      ) : items.length === 0 ? (
        <UnitPathBuild unitId={unit.id} />
      ) : (
        // Items exist but none resolves to a screen — never re-trigger the
        // generator here, or the page would spin on "a montar…" forever.
        <p className="card p-6 text-center text-sm text-ink-soft">
          As atividades desta unidade já não abrem em lado nenhum.{" "}
          <span className="text-ink-faint">
            Ask an admin to rebuild this unit&apos;s path.
          </span>
        </p>
      )}

      <footer className="card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-medium">Dúvidas sobre esta unidade?</span>
        <Link
          href={`/tutor?q=${encodeURIComponent(`Tenho dúvidas sobre a unidade "${unit.title}".`)}`}
          className="btn-ghost text-sm"
        >
          👩‍🏫 Falar com a Sandra
        </Link>
      </footer>
    </article>
  );
}
