import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeworkWork } from "@/components/homework-work";
import { Markdown } from "@/components/markdown";
import { requireSession } from "@/lib/auth";
import { getHomeworkItem } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function HomeworkDetail(
  props: PageProps<"/homework/[id]">
) {
  const session = await requireSession();
  const { id } = await props.params;
  const hw = await getHomeworkItem(Number(id));
  if (!hw) notFound();

  const isOwner = hw.username === session.username;

  return (
    <div className="space-y-5">
      <header>
        <Link href="/homework" className="text-xs text-ink-faint hover:text-olive">
          ← TPC
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {hw.title}
          </h1>
          <span className="chip capitalize">{hw.username}</span>
          <span className="chip">
            {hw.source === "ai" ? "✨ da Luna" : "📎 da aula"}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          {formatDate(hw.createdAt)}
        </p>
      </header>

      <section className="card p-5">
        <Markdown>{hw.instructions}</Markdown>
      </section>

      <HomeworkWork
        homework={{
          id: hw.id,
          status: hw.status,
          response: hw.response,
          feedback: hw.feedback,
        }}
        isOwner={isOwner}
        ownerName={hw.username}
      />
    </div>
  );
}
