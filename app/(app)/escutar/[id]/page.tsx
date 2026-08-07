import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ListeningPlayer } from "@/components/listening-player";
import { requireSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import { parseTranscript } from "@/lib/listening";

export default async function ClipPage(props: PageProps<"/escutar/[id]">) {
  await requireSession();
  const { id } = await props.params;
  const clipId = Number(id);
  if (!Number.isInteger(clipId)) notFound();

  const [clip] = await getDb()
    .select()
    .from(listeningClips)
    .where(eq(listeningClips.id, clipId))
    .limit(1);
  if (!clip) notFound();

  const transcript = parseTranscript(clip.transcript);

  return (
    <article className="space-y-5">
      <header>
        <Link href="/escutar" className="text-xs text-ink-faint hover:text-olive">
          ← Escutar
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {clip.title}
          </h1>
          <span className="chip">{clip.cefr}</span>
          {clip.source === "human" ? (
            <span className="chip bg-terra-pale text-terra-dark">
              🎙️ voz real · {clip.createdBy}
            </span>
          ) : null}
        </div>
        {clip.topic ? (
          <p className="mt-0.5 text-sm text-ink-faint">{clip.topic}</p>
        ) : null}
      </header>

      <ListeningPlayer
        clipId={clip.id}
        bytes={clip.bytes}
        source={clip.source}
        lines={transcript.lines}
      />
    </article>
  );
}
