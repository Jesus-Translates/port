import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeworkFromTopic } from "@/components/homework-from-topic";
import { Markdown } from "@/components/markdown";
import { requireSession } from "@/lib/auth";
import { getLesson } from "@/lib/data";

type Item = { user?: string; pt: string; en?: string };
type Block = {
  type: string;
  md?: string;
  titlePt?: string;
  titleEn?: string;
  items?: Item[];
  textPt?: string;
  questions?: { pt: string; en?: string }[];
  promptPt?: string;
  promptEn?: string;
};

export default async function LessonPage(props: PageProps<"/workbook/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId)) notFound();
  const lesson = await getLesson(lessonId);
  if (!lesson) notFound();

  const blocks = lesson.blocks as Block[];

  return (
    <article className="space-y-5">
      <header>
        <Link href="/workbook" className="text-xs text-ink-faint hover:text-olive">
          ← Lições
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {lesson.title}
          </h1>
          <span className="chip">{lesson.level}</span>
        </div>
        {lesson.descriptionEn ? (
          <p className="mt-1 text-sm text-ink-soft">{lesson.descriptionEn}</p>
        ) : null}
      </header>

      {blocks.map((b, i) => (
        <LessonBlock key={i} block={b} displayName={session.displayName} />
      ))}

      <footer className="card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-medium">Continuar a estudar isto:</span>
        <Link
          href={`/practice?topic=${encodeURIComponent(lesson.title)}`}
          className="btn-ghost text-sm"
        >
          🎯 Fazer um teste
        </Link>
        <HomeworkFromTopic topic={lesson.title} label="✍️ Pedir TPC sobre isto" />
        <Link
          href={`/tutor?q=${encodeURIComponent(`Tenho dúvidas sobre a lição "${lesson.title}".`)}`}
          className="btn-ghost text-sm"
        >
          🌙 Falar com a Luna
        </Link>
      </footer>
    </article>
  );
}

function BlockShell({
  emoji,
  titlePt,
  titleEn,
  children,
}: {
  emoji: string;
  titlePt?: string;
  titleEn?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      {titlePt ? (
        <h2 className="mb-3 flex items-baseline gap-2">
          <span aria-hidden>{emoji}</span>
          <span className="text-lg font-semibold">{titlePt}</span>
          {titleEn ? (
            <span className="text-sm text-ink-faint">· {titleEn}</span>
          ) : null}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

function LessonBlock({
  block,
  displayName,
}: {
  block: Block;
  displayName: string;
}) {
  switch (block.type) {
    case "intro":
      return (
        <div className="rounded-2xl border-l-4 border-sage bg-sage-pale/50 px-5 py-4">
          <Markdown>{block.md ?? ""}</Markdown>
        </div>
      );
    case "prompts":
      return (
        <BlockShell emoji="🗣️" titlePt={block.titlePt} titleEn={block.titleEn}>
          <ul className="space-y-2">
            {block.items?.map((item, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-[17px]">{item.pt}</span>
                {item.en ? (
                  <span className="text-sm text-ink-faint">{item.en}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </BlockShell>
      );
    case "vocab":
      return (
        <BlockShell emoji="📖" titlePt={block.titlePt ?? "Vocabulário"} titleEn={block.titleEn}>
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {block.items?.map((item, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 border-b border-dotted border-sand pb-1">
                <span className="font-medium">{item.pt}</span>
                <span className="text-right text-sm text-ink-soft">
                  {item.en}
                </span>
              </li>
            ))}
          </ul>
        </BlockShell>
      );
    case "reading":
      return (
        <BlockShell emoji="📜" titlePt={block.titlePt} titleEn={block.titleEn}>
          <p className="font-display text-[17px] leading-relaxed whitespace-pre-wrap">
            {block.textPt}
          </p>
          {block.questions && block.questions.length > 0 ? (
            <ol className="mt-4 list-decimal space-y-1.5 border-t border-sand pt-3 pl-5">
              {block.questions.map((question, i) => (
                <li key={i}>
                  <span>{question.pt}</span>
                  {question.en ? (
                    <span className="ml-2 text-sm text-ink-faint">
                      {question.en}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </BlockShell>
      );
    case "writing":
      return (
        <BlockShell emoji="✍️" titlePt={block.titlePt ?? "Escreve"} titleEn={block.titleEn}>
          <p className="font-display text-[17px]">{block.promptPt}</p>
          {block.promptEn ? (
            <p className="mt-1 text-sm text-ink-faint">{block.promptEn}</p>
          ) : null}
          <p className="mt-3 text-xs text-ink-faint">
            💡 Tip: write it as a note and ask Luna to correct it.
          </p>
        </BlockShell>
      );
    case "speaking":
      return (
        <BlockShell emoji="💬" titlePt={block.titlePt ?? "Fala"} titleEn={block.titleEn}>
          <ul className="space-y-2.5">
            {block.items?.map((item, i) => (
              <li
                key={i}
                className={
                  item.user === displayName
                    ? "rounded-xl border border-terra/40 bg-terra-pale/60 px-3 py-2"
                    : ""
                }
              >
                {item.user ? (
                  <span className="chip mr-2 capitalize">{item.user}</span>
                ) : null}
                <span className="font-display text-[17px]">{item.pt}</span>
                {item.en ? (
                  <div className="mt-0.5 text-sm text-ink-faint">{item.en}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </BlockShell>
      );
    case "game":
      return (
        <BlockShell emoji="🎲" titlePt={block.titlePt ?? "Jogo"} titleEn={block.titleEn}>
          <Markdown>{block.md ?? ""}</Markdown>
        </BlockShell>
      );
    default:
      return block.md ? (
        <BlockShell emoji="✨" titlePt={block.titlePt} titleEn={block.titleEn}>
          <Markdown>{block.md}</Markdown>
        </BlockShell>
      ) : null;
  }
}
