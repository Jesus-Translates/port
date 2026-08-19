import Link from "next/link";
import { notFound } from "next/navigation";
import { and, inArray, asc, eq, gt } from "drizzle-orm";
import { ListeningPlayer } from "@/components/listening-player";
import type { NextLesson } from "@/components/lesson-complete";
import { UnitReturn } from "@/components/unit-return";
import { roleOf, requireSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import { visibleOwners } from "@/lib/tenant";
import { parseTranscript } from "@/lib/listening";
import { unitContextFrom } from "@/lib/unit-context";

/**
 * Where "Continuar →" goes: the next clip at the same level, else the next one
 * at any level, else nothing. Ordered by id so the sequence is stable — the
 * library index sorts by date, which would send you backwards.
 */
async function findNextClip(
  afterId: number,
  cefr: string
): Promise<NextLesson> {
  const db = getDb();
  // Household scope, resolved once and applied to both queries below.
  const owners = await visibleOwners();
  const columns = {
    id: listeningClips.id,
    title: listeningClips.title,
    cefr: listeningClips.cefr,
  };
  const [sameLevel] = await db
    .select(columns)
    .from(listeningClips)
    .where(
      and(
        gt(listeningClips.id, afterId),
        eq(listeningClips.cefr, cefr),
        // "Next clip" walked the whole instance, so it handed a learner a
        // stranger's dialogue as their next lesson.
        inArray(listeningClips.createdBy, owners)
      )
    )
    .orderBy(asc(listeningClips.id))
    .limit(1);
  const row =
    sameLevel ??
    (
      await db
        .select(columns)
        .from(listeningClips)
        .where(
          and(
            gt(listeningClips.id, afterId),
            inArray(listeningClips.createdBy, owners)
          )
        )
        .orderBy(asc(listeningClips.id))
        .limit(1)
    )[0];
  if (!row) return null;
  return { href: `/escutar/${row.id}`, title: row.title, cefr: row.cefr };
}

export default async function ClipPage(props: PageProps<"/escutar/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;
  const clipId = Number(id);
  if (!Number.isInteger(clipId)) notFound();

  const [clip] = await getDb()
    .select()
    .from(listeningClips)
    /*
     * A clip you do not own is NOT FOUND, not forbidden — a 403 would confirm
     * the id exists and leak the shape of other households' libraries.
     */
    .where(
      and(
        eq(listeningClips.id, clipId),
        inArray(listeningClips.createdBy, await visibleOwners())
      )
    )
    .limit(1);
  if (!clip) notFound();

  const transcript = parseTranscript(clip.transcript);
  const next = await findNextClip(clip.id, clip.cefr);
  const unit = await unitContextFrom(await props.searchParams);

  return (
    <article className="space-y-5">
      <UnitReturn unit={unit} />

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
        canReplace={await roleOf(session.username) !== "student"}
        next={next}
        unit={unit}
      />
    </article>
  );
}
