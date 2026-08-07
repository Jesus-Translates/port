import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { getDb, missionAttempts, missions } from "@/lib/db";
import { MISSIONS_SEED } from "@/lib/missions-seed";

export const metadata = { title: "Missões" };

/** First visit fills the board with the hand-written local missions. */
async function ensureSeeded() {
  const db = getDb();
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(missions);
  if (Number(row?.n ?? 0) > 0) return;
  await db.insert(missions).values(
    MISSIONS_SEED.map((m) => ({
      title: m.title,
      promptPt: m.promptPt,
      promptEn: m.promptEn,
      location: m.location,
      cefr: m.cefr,
      sortOrder: m.sortOrder,
      active: 1,
      createdBy: "seed",
    }))
  );
}

export default async function MissoesPage() {
  const session = await requireSession();
  await ensureSeeded();

  const db = getDb();
  const [rows, mine] = await Promise.all([
    db
      .select()
      .from(missions)
      .where(eq(missions.active, 1))
      .orderBy(asc(missions.sortOrder), asc(missions.id)),
    db
      .select({
        missionId: missionAttempts.missionId,
        tries: sql<number>`count(*)::int`,
        best: sql<number | null>`max(${missionAttempts.score})`,
      })
      .from(missionAttempts)
      .where(eq(missionAttempts.username, session.username))
      .groupBy(missionAttempts.missionId),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          🗺️ Missões — o teu português na rua
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Real errands around Santa Cruz, Silveira and Torres Vedras. Rehearse
          at the kitchen table, then go and actually do it — real errands are
          where the Portuguese sticks.
        </p>
      </header>

      <div className="space-y-3">
        {rows.map((m) => {
          const state = mine.find((x) => x.missionId === m.id);
          const best = state?.best === null ? null : Number(state?.best);
          const done = Number(state?.tries ?? 0) > 0;
          return (
            <Link
              key={m.id}
              href={`/missoes/${m.id}`}
              className="card block space-y-2 p-4 transition-colors hover:border-sage hover:bg-sage-pale/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-semibold">
                  {m.title}
                </span>
                <span className="chip bg-azul-pale text-azul">
                  📍 {m.location}
                </span>
                <span className="chip">{m.cefr}</span>
                <span
                  className={
                    done
                      ? "chip ml-auto bg-sage-pale text-olive"
                      : "chip ml-auto bg-cream text-ink-faint"
                  }
                >
                  {done
                    ? `feita ✓${best !== null && Number.isFinite(best) ? ` ${best}/10` : ""}`
                    : "por fazer"}
                </span>
              </div>
              <p className="font-display text-[17px] leading-relaxed">
                {m.promptPt}
              </p>
              <p className="text-sm text-ink-faint">{m.promptEn}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
