import Link from "next/link";
import { SuggestPanel } from "@/components/suggest-panel";
import { getValidUsers, requireSession } from "@/lib/auth";
import {
  getCategoriesWithCounts,
  getFamilyBoard,
  getHomeworkAll,
  getKudosFor,
  getStats,
} from "@/lib/data";
import { avatarFor, titleCase } from "@/lib/people";
import { countDue } from "@/lib/srs";

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
  // Social widgets must never take down the whole dashboard.
  const [stats, allHomework, cats, board, myKudos, due] = await Promise.all([
    getStats(session.username),
    getHomeworkAll(),
    getCategoriesWithCounts(),
    getFamilyBoard(getValidUsers()).catch(() => []),
    getKudosFor(session.username, 5).catch(() => []),
    countDue(session.username).catch(() => 0),
  ]);
  const myRank = board.findIndex((m) => m.username === session.username) + 1;
  const leader = board[0];
  const myStars = board.find((m) => m.username === session.username)?.stars ?? 0;

  const openHomework = allHomework.filter(
    (h) => h.username === session.username && h.status === "open"
  );
  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Lisbon",
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
          <Link
            href="/familia"
            className="card px-4 py-2.5 text-center transition-colors hover:border-sage"
          >
            <div className="text-lg leading-tight font-bold text-azul">
              {myRank > 0 ? `${myRank}º` : "—"}
            </div>
            <div className="text-[11px] text-ink-soft">
              {myStars > 0 ? `⭐ ${myStars}` : "na família"}
            </div>
          </Link>
        </div>
      </header>

      {due > 0 ? (
        <Link
          href="/practice/rever"
          className="block rounded-2xl border border-olive/30 bg-sage-pale/60 p-4 transition-colors hover:border-olive"
        >
          <span className="font-semibold text-olive">
            🔁 {due} {due === 1 ? "cartão" : "cartões"} para rever hoje
          </span>
          <span className="ml-2 text-sm text-ink-soft">
            — five minutes now beats an hour later.
          </span>
        </Link>
      ) : null}

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

      {myKudos.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Para ti 💛</h2>
          <div className="space-y-2">
            {myKudos.slice(0, 3).map((k) => (
              <div
                key={k.id}
                className={`card flex items-start gap-3 p-3 ${
                  k.kind === "star" ? "border-terra/40 bg-terra-pale/30" : ""
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {k.kind === "star" ? "⭐" : "💬"}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold">
                    {titleCase(k.fromUser)} {avatarFor(k.fromUser)}
                  </span>{" "}
                  {k.kind === "star"
                    ? "deu-te uma estrela!"
                    : "deixou-te um recado:"}
                  {k.message ? (
                    <p className="mt-0.5 text-ink-soft italic">
                      “{k.message}”
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {myRank > 1 && leader ? (
        <Link
          href="/familia"
          className="block rounded-2xl border border-azul/25 bg-azul-pale p-4 transition-colors hover:border-azul"
        >
          <span className="font-semibold text-azul">
            🏆 {titleCase(leader.username)} lidera esta semana
          </span>
          <span className="ml-2 text-sm text-ink-soft">
            — estás a{" "}
            {leader.xpThisWeek - (board[myRank - 1]?.xpThisWeek ?? 0)} XP.
            Consegues apanhá-lo?
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
            {
              href: "/practice/rever",
              emoji: "🔁",
              title: "Rever",
              sub: due > 0 ? `${due} cartões à espera` : "Spaced repetition",
            },
            {
              href: "/stories",
              emoji: "📕",
              title: "Histórias",
              sub: "Stories set in Santa Cruz",
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
