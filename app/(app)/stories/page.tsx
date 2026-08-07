import Link from "next/link";
import { desc } from "drizzle-orm";
import { StoryGenerate } from "@/components/story-generate";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { getDb, stories } from "@/lib/db";

export const metadata = { title: "Histórias" };

export default async function StoriesPage() {
  await requireSession();
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          📕 Histórias
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Serialized stories set right here — the beach, the mercado, the
          neighbours — written at your level, with audio and questions.
        </p>
      </header>

      <StoryGenerate seriesTitles={seriesTitles} initialLevel={level} />

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
                    href={`/stories/${c.id}`}
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
