import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeworkWork } from "@/components/homework-work";
import { Markdown } from "@/components/markdown";
import { requireSession } from "@/lib/auth";
import { unitContextFrom } from "@/lib/unit-context";
import { UnitReturn } from "@/components/unit-return";
import { getHomeworkItem } from "@/lib/data";
import {
  type HomeworkItem,
  parseItemsFromMarkdown,
} from "@/lib/homework-items";
import { formatDate } from "@/lib/utils";

export default async function HomeworkDetail(
  props: PageProps<"/homework/[id]">
) {
  const session = await requireSession();
  const { id } = await props.params;
  const unit = await unitContextFrom(await props.searchParams);
  const hwId = Number(id);
  if (!Number.isInteger(hwId)) notFound();
  const hw = await getHomeworkItem(hwId);
  if (!hw) notFound();

  const isOwner = hw.username === session.username;

  return (
    <div className="space-y-5">
      <header>
        {unit ? <UnitReturn unit={unit} /> : null}
        <Link href="/homework" className="text-xs text-ink-faint hover:text-olive">
          ← TPC
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {hw.title}
          </h1>
          <span className="chip capitalize">{hw.username}</span>
          <span className="chip">
            {hw.source === "ai" ? "✨ da Sandra" : "📎 da aula"}
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
        unit={unit}
        homework={{
          id: hw.id,
          status: hw.status,
          response: hw.response,
          feedback: hw.feedback,
          items: hw.items as HomeworkItem[] | null,
          canSplit:
            !hw.items && parseItemsFromMarkdown(hw.instructions).length > 0,
        }}
        isOwner={isOwner}
        ownerName={hw.username}
      />
    </div>
  );
}
