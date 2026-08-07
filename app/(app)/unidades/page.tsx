import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { UnitGenerate } from "@/components/unit-generate";
import { getUnitProgress } from "@/lib/actions/course";
import { getMyCefr } from "@/lib/actions/profile";
import { getRole, requireSession } from "@/lib/auth";
import { getDb, unitItems, units } from "@/lib/db";

export const metadata = { title: "Unidades" };

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

/** The interleaving is the whole point of the syllabus — make it legible. */
const CATEGORY_LABEL: Record<string, string> = {
  communication: "comunicação",
  grammar: "gramática",
  "grammar-practice": "prática",
  vocabulary: "vocabulário",
};
const CATEGORY_CHIP: Record<string, string> = {
  communication: "chip bg-azul-pale text-azul",
  grammar: "chip bg-terra-pale text-terra-dark",
  "grammar-practice": "chip bg-sand text-ink-soft",
  vocabulary: "chip bg-sage-pale text-olive",
};

export default async function UnidadesPage() {
  const session = await requireSession();
  const isStaff = getRole(session.username) !== "student";
  // Named myLevel: `level` is already the loop variable over CEFR buckets below.
  const myLevel = await getMyCefr();

  const db = getDb();
  // NOT a correlated subquery — drizzle unqualifies `${units.id}` inside the
  // sub-select scope, so it binds to unit_items.id and counts come back wrong.
  const [rows, counts] = await Promise.all([
    db
      .select({
        id: units.id,
        slug: units.slug,
        title: units.title,
        titlePt: units.titlePt,
        category: units.category,
        blurbEn: units.blurbEn,
        cefr: units.cefr,
        status: units.status,
        hasNote: sql<boolean>`length(${units.noteMd}) > 0`,
      })
      .from(units)
      // Students only ever see what the teacher has published.
      .where(isStaff ? undefined : eq(units.status, "published"))
      .orderBy(asc(units.sortOrder), asc(units.id)),
    db
      .select({ unitId: unitItems.unitId, n: sql<number>`count(*)::int` })
      .from(unitItems)
      .groupBy(unitItems.unitId),
  ]);
  const itemCountFor = new Map(counts.map((c) => [c.unitId, c.n]));

  // How far THIS learner has walked each unit (grouped queries + a Map — see
  // the warning in lib/actions/course.ts about correlated sub-selects).
  const progress = await getUnitProgress(
    session.username,
    rows.map((r) => r.id)
  );
  const pctFor = new Map(progress.map((p) => [p.unitId, p]));

  // Exactly one "A seguir" across the page: the first unit at the learner's
  // own level, in syllabus order, that they have not finished.
  const nextUnitId =
    rows.find((r) => r.cefr === myLevel && (pctFor.get(r.id)?.pct ?? 0) < 100)
      ?.id ?? null;

  // Known levels first, in order; anything odd keeps its own bucket at the end.
  const buckets = [
    ...LEVELS,
    ...[...new Set(rows.map((r) => r.cefr))].filter(
      (c) => !LEVELS.includes(c as (typeof LEVELS)[number])
    ),
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">📚 Unidades</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The spine of the course: one teaching point, explained properly, then
          a short path through the practice that makes it stick.
        </p>
      </header>

      <UnitGenerate level={myLevel} />

      {rows.length === 0 ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          Ainda não há unidades — pede a primeira à Luna ↑
        </p>
      ) : (
        buckets.map((level) => {
          const inLevel = rows.filter((r) => r.cefr === level);
          if (inLevel.length === 0) return null;
          return (
            <section key={level}>
              <h2 className="mb-2 font-display text-lg font-semibold">
                {level}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {inLevel.map((u) => {
                  const p = pctFor.get(u.id);
                  const walked = p && p.total > 0;
                  return (
                    <Link
                      key={u.id}
                      href={`/unidades/${u.slug}`}
                      className={`card flex flex-col gap-2 p-4 transition-colors hover:border-sage hover:bg-sage-pale/40 ${
                        u.id === nextUnitId ? "border-sage ring-1 ring-sage-light" : ""
                      }`}
                    >
                      <span>
                        {u.id === nextUnitId ? (
                          <span className="chip mb-1 bg-olive text-paper">
                            A seguir
                          </span>
                        ) : null}
                        <span className="block font-display text-lg leading-snug font-semibold">
                          {u.title}
                        </span>
                        {u.titlePt ? (
                          <span className="block text-sm text-ink-faint">
                            {u.titlePt}
                          </span>
                        ) : null}
                      </span>
                      {u.blurbEn ? (
                        <span className="text-xs leading-snug text-ink-soft">
                          {u.blurbEn}
                        </span>
                      ) : null}
                      <span className="mt-auto block space-y-2">
                        {walked ? (
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                              <span
                                className={`block h-full rounded-full ${
                                  p.pct === 100 ? "bg-terra" : "bg-olive"
                                }`}
                                style={{ width: `${p.pct}%` }}
                              />
                            </span>
                            <span className="shrink-0 text-[11px] font-medium text-ink-soft tabular-nums">
                              {p.pct}%
                            </span>
                          </span>
                        ) : null}
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={CATEGORY_CHIP[u.category] ?? "chip"}>
                            {CATEGORY_LABEL[u.category] ?? u.category}
                          </span>
                          {itemCountFor.get(u.id) ? (
                            <span className="chip bg-cream text-ink-soft">
                              {walked && p.done > 0
                                ? `${p.done}/${p.total} feitos`
                                : `${itemCountFor.get(u.id)} atividades`}
                            </span>
                          ) : null}
                          {u.hasNote ? null : (
                            <span className="chip bg-cream text-ink-faint">
                              nota por escrever
                            </span>
                          )}
                          {u.status !== "published" ? (
                            <span className="chip bg-terra-pale text-terra-dark">
                              rascunho
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
