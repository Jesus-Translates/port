import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { UnitGenerate } from "@/components/unit-generate";
import { getRole, requireSession } from "@/lib/auth";
import { getDb, unitItems, units } from "@/lib/db";

export const metadata = { title: "Unidades" };

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export default async function UnidadesPage() {
  const session = await requireSession();
  const isStaff = getRole(session.username) !== "student";

  const rows = await getDb()
    .select({
      id: units.id,
      slug: units.slug,
      title: units.title,
      cefr: units.cefr,
      status: units.status,
      itemCount: sql<number>`(select count(*)::int from ${unitItems} where ${unitItems.unitId} = ${units.id})`,
    })
    .from(units)
    // Students only ever see what the teacher has published.
    .where(isStaff ? undefined : eq(units.status, "published"))
    .orderBy(asc(units.sortOrder), asc(units.id));

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

      <UnitGenerate />

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
                {inLevel.map((u) => (
                  <Link
                    key={u.id}
                    href={`/unidades/${u.slug}`}
                    className="card flex flex-col gap-2 p-4 transition-colors hover:border-sage hover:bg-sage-pale/40"
                  >
                    <span className="font-display text-lg leading-snug font-semibold">
                      {u.title}
                    </span>
                    <span className="mt-auto flex flex-wrap items-center gap-2">
                      <span className="chip">{u.cefr}</span>
                      <span className="chip bg-cream text-ink-soft">
                        {u.itemCount}{" "}
                        {u.itemCount === 1 ? "atividade" : "atividades"}
                      </span>
                      {u.status !== "published" ? (
                        <span className="chip bg-terra-pale text-terra-dark">
                          rascunho
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
