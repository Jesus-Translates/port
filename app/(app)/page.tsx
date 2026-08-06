import Link from "next/link";
import { SuggestPanel } from "@/components/suggest-panel";
import { requireSession } from "@/lib/auth";
import {
  getCategoriesWithCounts,
  getHomeworkAll,
  getStats,
} from "@/lib/data";

const KIND_EMOJI: Record<string, string> = {
  quiz: "🎯",
  note: "📝",
  homework: "✍️",
  reference: "📖",
  tutor: "🌙",
  lesson: "📚",
};

export default async function Dashboard() {
  const session = await requireSession();
  const [stats, allHomework, cats] = await Promise.all([
    getStats(session.username),
    getHomeworkAll(),
    getCategoriesWithCounts(),
  ]);

  const openHomework = allHomework.filter(
    (h) => h.username === session.username && h.status === "open"
  );
  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-faint capitalize">{today}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Olá, {session.displayName}! 👋
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="card px-4 py-2.5 text-center">
            <div className="text-lg leading-tight font-bold text-terra">
              {stats.streakDays > 0 ? `🔥 ${stats.streakDays}` : "🌱 0"}
            </div>
            <div className="text-[11px] text-ink-soft">day streak</div>
          </div>
          <div className="card px-4 py-2.5 text-center">
            <div className="text-lg leading-tight font-bold text-olive">
              {stats.xp}
            </div>
            <div className="text-[11px] text-ink-soft">XP total</div>
          </div>
          <div className="card px-4 py-2.5 text-center">
            <div className="text-lg leading-tight font-bold text-azul">
              {stats.activeThisWeek}/7
            </div>
            <div className="text-[11px] text-ink-soft">days this week</div>
          </div>
        </div>
      </header>

      {openHomework.length > 0 ? (
        <Link
          href={`/homework/${openHomework[0].id}`}
          className="block rounded-2xl border border-terra/30 bg-terra-pale p-4 transition-colors hover:border-terra"
        >
          <span className="font-semibold text-terra-dark">
            ✍️ Tens {openHomework.length}{" "}
            {openHomework.length === 1 ? "TPC por fazer" : "TPCs por fazer"}
          </span>
          <span className="ml-2 text-sm text-ink-soft">
            — “{openHomework[0].title}” is waiting for you
          </span>
        </Link>
      ) : null}

      <SuggestPanel />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Ir para…</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            {
              href: "/tutor",
              emoji: "🌙",
              title: "Falar com a Luna",
              sub: "Ask anything, get corrections",
            },
            {
              href: "/reference",
              emoji: "📖",
              title: "O Livro",
              sub: `${cats.length} categories · quick reference`,
            },
            {
              href: "/workbook",
              emoji: "📚",
              title: "Lições",
              sub: "Workbook pages like class",
            },
            {
              href: "/practice",
              emoji: "🎯",
              title: "Praticar",
              sub: "Quizzes made for you",
            },
            {
              href: "/homework",
              emoji: "✍️",
              title: "TPC",
              sub: "Homework + Luna's feedback",
            },
            {
              href: "/notes",
              emoji: "📝",
              title: "Notas",
              sub: "Your own study notes",
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="card group p-4 transition-all hover:border-sage hover:shadow-md"
            >
              <div className="text-2xl" aria-hidden>
                {c.emoji}
              </div>
              <div className="mt-2 font-semibold group-hover:text-olive">
                {c.title}
              </div>
              <div className="mt-0.5 text-xs text-ink-soft">{c.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      {stats.recent.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">A família esta semana</h2>
          <div className="card divide-y divide-sand/70">
            {stats.recent.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span aria-hidden>{KIND_EMOJI[a.kind] ?? "✨"}</span>
                <span className="chip capitalize">{a.username}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                  {a.summary}
                </span>
                <span className="shrink-0 text-xs text-ink-faint">
                  {a.createdAt.toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
