import Link from "next/link";
import { QuizNewForm } from "@/components/quiz-new-form";
import { requireSession } from "@/lib/auth";
import { getQuizzesFor } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Praticar" };

export default async function PracticePage(props: PageProps<"/practice">) {
  const session = await requireSession();
  const { topic } = await props.searchParams;
  const quizzes = await getQuizzesFor(session.username);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">🎯 Praticar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Luna writes a fresh quiz on any topic — multiple choice + a little
          translating. Instant feedback.
        </p>
      </header>

      <QuizNewForm initialTopic={typeof topic === "string" ? topic : ""} />

      {quizzes.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Os teus testes</h2>
          <div className="card divide-y divide-sand/70">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/practice/${q.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
              >
                <span aria-hidden>
                  {q.status === "completed" ? "✅" : "🎯"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{q.topic}</div>
                  <div className="text-xs text-ink-faint">
                    {q.level} · {formatDate(q.createdAt)}
                  </div>
                </div>
                {q.status === "completed" && q.score != null ? (
                  <span className="chip">
                    {q.score}/{q.total}
                  </span>
                ) : (
                  <span className="text-xs text-terra">por fazer →</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
