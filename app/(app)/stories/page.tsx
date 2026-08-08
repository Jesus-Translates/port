import Link from "next/link";
import { desc } from "drizzle-orm";
import { StoryGenerate } from "@/components/story-generate";
import { UnitReturn } from "@/components/unit-return";
import { UnitStart } from "@/components/unit-start";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { getDb, stories } from "@/lib/db";
import { rankByTopic } from "@/lib/topic-match";
import { unitContextFrom } from "@/lib/unit-context";

export const metadata = { title: "Histórias" };

/** How many "já existe" chapters are worth showing before it reads as noise. */
const MAX_MATCHES = 4;

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

export default async function StoriesPage(props: PageProps<"/stories">) {
  await requireSession();
  const sp = await props.searchParams;
  const unit = await unitContextFrom(sp);
  // The step's own topic, falling back to the unit's Portuguese name — a unit
  // item with no topic configured should still land on something about it.
  const tema = one(sp.tema).slice(0, 200) || unit?.titlePt.trim() || "";
  const level = await getMyCefr();
  const all = await getDb()
    .select({
      id: stories.id,
      seriesTitle: stories.seriesTitle,
      chapter: stories.chapter,
      title: stories.title,
      level: stories.level,
    })
    .from(stories)
    .orderBy(desc(stories.createdAt))
    .limit(60);

  const seriesTitles = [...new Set(all.map((s) => s.seriesTitle))];

  // A step about "o mercado" should open the chapter we already have about o
  // mercado — writing a second series about it is the expensive wrong answer.
  const matches = tema
    ? rankByTopic(all, tema, (s) => `${s.seriesTitle} ${s.title}`).slice(
        0,
        MAX_MATCHES
      )
    : [];
  /** Continuing THIS series, rather than whichever one happens to be newest. */
  const matchedSeries = matches[0]?.seriesTitle ?? null;

  // Reading a chapter from a unit step must keep carrying the unit, or the
  // reader has no idea which item it is fulfilling.
  const carry = unit
    ? `?unidade=${encodeURIComponent(unit.slug)}${unit.itemId ? `&item=${unit.itemId}` : ""}`
    : "";
  const storyHref = (id: number) => `/stories/${id}${carry}`;

  return (
    <div className="space-y-6">
      <UnitReturn unit={unit} />

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          📕 Histórias
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Serialized stories set right here — the beach, the mercado, the
          neighbours — written at your level, with audio and questions.
        </p>
      </header>

      {matches.length > 0 ? (
        <section className="card space-y-3 p-5">
          <div>
            <h2 className="font-semibold">✅ Já existe sobre «{tema}»</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Lê um destes — não é preciso escrever nada de novo.{" "}
              <span className="text-ink-faint">
                We already have these; read one instead of generating.
              </span>
            </p>
          </div>
          <div className="divide-y divide-sand/70 overflow-hidden rounded-xl border border-sand bg-white/70">
            {matches.map((s) => (
              <Link
                key={s.id}
                href={storyHref(s.id)}
                className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
              >
                <span className="chip shrink-0">Cap. {s.chapter}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{s.title}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {s.seriesTitle}
                  </span>
                </span>
                <span className="chip shrink-0">{s.level}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {unit ? (
        <>
          {/* One tap, already about the right thing, and it carries the unit
              onto the chapter it opens — which the library form cannot do. */}
          <UnitStart
            kind="story"
            topic={tema}
            level={level}
            unit={unit}
            seriesTitle={matchedSeries}
            tone={matches.length > 0 ? "quiet" : "primary"}
          />
          <details>
            <summary className="flex min-h-11 cursor-pointer items-center text-sm text-ink-soft">
              Preferes outra série ou outro tema?{" "}
              <span className="ml-1 text-ink-faint">…the full library form</span>
            </summary>
            <div className="mt-2">
              <StoryGenerate seriesTitles={seriesTitles} initialLevel={level} />
            </div>
          </details>
        </>
      ) : (
        <StoryGenerate seriesTitles={seriesTitles} initialLevel={level} />
      )}

      {seriesTitles.length === 0 ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          Ainda não há histórias — pede o primeiro capítulo à Luna ↑
        </p>
      ) : (
        seriesTitles.map((series) => {
          const chapters = all
            .filter((s) => s.seriesTitle === series)
            .sort((a, b) => a.chapter - b.chapter);
          return (
            <section key={series}>
              <h2 className="mb-2 font-display text-lg font-semibold">
                {series}
              </h2>
              <div className="card divide-y divide-sand/70">
                {chapters.map((c) => (
                  <Link
                    key={c.id}
                    href={storyHref(c.id)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
                  >
                    <span className="chip shrink-0">Cap. {c.chapter}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {c.title}
                    </span>
                    <span className="chip shrink-0">{c.level}</span>
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
