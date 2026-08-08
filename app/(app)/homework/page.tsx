import Link from "next/link";
import { HomeworkComposer } from "@/components/homework-composer";
import { requireSession } from "@/lib/auth";
import { getHomeworkAll } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "TPC" };

const STATUS_META: Record<string, { label: string; cls: string }> = {
  open: { label: "por fazer", cls: "bg-terra-pale text-terra-dark" },
  submitted: { label: "entregue", cls: "bg-azul-pale text-azul" },
  reviewed: { label: "corrigido ✓", cls: "bg-sage-pale text-olive" },
};

export default async function HomeworkPage(props: PageProps<"/homework">) {
  const session = await requireSession();
  const { topic, item } = await props.searchParams;
  const unitItemId = Number(Array.isArray(item) ? item[0] : item) || null;
  const all = await getHomeworkAll();
  const mine = all.filter((h) => h.username === session.username);
  const family = all.filter((h) => h.username !== session.username).slice(0, 10);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          ✍️ TPC — trabalhos de casa
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Homework from Luna or from class. Submit your answers and Luna
          corrects them with kind, specific feedback.
        </p>
      </header>

      <HomeworkComposer unitItemId={unitItemId} initialTopic={typeof topic === "string" ? topic : ""} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">O teu TPC</h2>
        {mine.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Nada por aqui — pede TPC à Luna ↑
          </p>
        ) : (
          <div className="card divide-y divide-sand/70">
            {mine.map((h) => {
              const meta = STATUS_META[h.status] ?? STATUS_META.open;
              return (
                <Link
                  key={h.id}
                  href={`/homework/${h.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
                >
                  <span aria-hidden>
                    {h.status === "reviewed"
                      ? "✅"
                      : h.status === "submitted"
                        ? "📨"
                        : "📄"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{h.title}</div>
                    <div className="text-xs text-ink-faint">
                      {h.source === "ai" ? "da Luna" : "da aula"} ·{" "}
                      {formatDate(h.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}
                  >
                    {meta.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {family.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">A família</h2>
          <div className="card divide-y divide-sand/70">
            {family.map((h) => {
              const meta = STATUS_META[h.status] ?? STATUS_META.open;
              return (
                <Link
                  key={h.id}
                  href={`/homework/${h.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-sage-pale/40"
                >
                  <span className="chip capitalize">{h.username}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {h.title}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}
                  >
                    {meta.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
