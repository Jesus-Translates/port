import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AudioButton } from "@/components/audio-button";
import { StoryReader } from "@/components/story-reader";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { getDb, stories } from "@/lib/db";
import { unitContextFrom } from "@/lib/unit-context";

export default async function StoryPage(props: PageProps<"/stories/[id]">) {
  await requireSession();
  const { id } = await props.params;
  const storyId = Number(id);
  if (!Number.isInteger(storyId)) notFound();
  const [story] = await getDb()
    .select()
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);
  if (!story) notFound();

  const unit = await unitContextFrom(await props.searchParams);

  return (
    <article className="space-y-5">
      <UnitReturn unit={unit} />

      <header>
        <Link href="/stories" className="text-xs text-ink-faint hover:text-olive">
          ← Histórias
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {story.title}
          </h1>
          <span className="chip">Cap. {story.chapter}</span>
          <span className="chip">{story.level}</span>
        </div>
        <p className="mt-0.5 text-sm text-ink-faint">{story.seriesTitle}</p>
        <div className="mt-3">
          <AudioButton text={story.textPt} label="Ouvir a história" />
        </div>
      </header>

      <StoryReader
        story={{
          id: story.id,
          title: story.title,
          textPt: story.textPt,
          textEn: story.textEn,
          glossary: story.glossary as { pt: string; en: string }[],
          questions: story.questions as {
            promptPt: string;
            options: string[];
            answer: string;
          }[],
        }}
        unit={unit}
      />
    </article>
  );
}
