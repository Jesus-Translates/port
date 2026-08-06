import Link from "next/link";
import { LessonGenerate } from "@/components/lesson-generate";
import { requireSession } from "@/lib/auth";
import { getLessons } from "@/lib/data";

export const metadata = { title: "Lições" };

export default async function WorkbookPage(props: PageProps<"/workbook">) {
  await requireSession();
  const { topic } = await props.searchParams;
  const lessons = await getLessons();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">📚 Lições</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Workbook pages just like class — reading, vocab, prompts and games.
          Ask Luna for a new one on any topic.
        </p>
      </header>

      <LessonGenerate initialTopic={typeof topic === "string" ? topic : ""} />

      <div className="grid gap-3 sm:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/workbook/${l.id}`}
            className="card group p-4 transition-all hover:border-sage hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="chip">{l.level}</span>
              {l.source === "ai" ? (
                <span className="chip bg-terra-pale text-terra-dark">
                  ✨ Luna
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 font-display text-lg leading-snug font-semibold group-hover:text-olive">
              {l.title}
            </h2>
            {l.descriptionEn ? (
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                {l.descriptionEn}
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      {lessons.length === 0 ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          No lessons yet — run the seed script or generate one above.
        </p>
      ) : null}
    </div>
  );
}
