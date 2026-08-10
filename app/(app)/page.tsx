import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { householdUsernames } from "@/lib/tenant";
import {
  getFamilyBoard,
  getHomeworkAll,
  getKudosFor,
  getStats,
  hasBeenPlaced,
} from "@/lib/data";
import { getCourseProgress } from "@/lib/actions/course";
import { getMyPrefs } from "@/lib/actions/profile";
import { resolveNextAction } from "@/lib/next-action";
import { avatarFor, titleCase } from "@/lib/people";
import { countDue } from "@/lib/srs";

const KIND_EMOJI: Record<string, string> = {
  quiz: "🎯",
  note: "📝",
  homework: "✍️",
  reference: "📖",
  tutor: "👩‍🏫",
  lesson: "📚",
  review: "🔁",
  ditado: "✏️",
  verbos: "⚡",
  falar: "🎙️",
  conversa: "💬",
  escutar: "👂",
  story: "📕",
  missao: "🗺️",
  kudos: "⭐",
};

export default async function Dashboard() {
  const session = await requireSession();
  // Social widgets must never take down the whole dashboard.
  const [stats, allHomework, board, myKudos, due, next, course, placed, prefs] =
    await Promise.all([
      getStats(session.username),
      getHomeworkAll(),
      householdUsernames().then(getFamilyBoard).catch(() => []),
      getKudosFor(session.username, 5).catch(() => []),
      countDue(session.username).catch(() => 0),
      resolveNextAction(session.username, session.displayName),
      getCourseProgress().catch(() => null),
      hasBeenPlaced(session.username).catch(() => true),
      getMyPrefs().catch(() => null),
    ]);
  const prefsAnswered = prefs !== null;
  const myRank = board.findIndex((m) => m.username === session.username) + 1;
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
            <div className="text-2xs text-ink-soft">day streak</div>
          </div>
          <div className="card px-4 py-2.5 text-center">
            <div className="text-lg leading-tight font-bold text-olive">
              {stats.xp}
            </div>
            <div className="text-2xs text-ink-soft">XP total</div>
          </div>
          <Link
            href="/familia"
            className="card px-4 py-2.5 text-center transition-colors hover:border-sage"
          >
            <div className="text-lg leading-tight font-bold text-azul">
              {myRank > 0 ? `${myRank}º` : "—"}
            </div>
            <div className="text-2xs text-ink-soft">
              {myStars > 0 ? `⭐ ${myStars}` : "na família"}
            </div>
          </Link>
        </div>
      </header>

      {/* One answer to "what now?", so a session never starts with a decision
          across twenty identical tiles. The banners below suppress themselves
          when this card already points at the same place. */}
      <Link
        href={next.href}
        className="group block rounded-2xl border border-olive/30 bg-sage-pale/70 p-5 transition-all hover:border-olive hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl" aria-hidden>
            {next.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-2xs font-semibold tracking-widest text-olive/70 uppercase">
              A seguir
            </div>
            <div className="font-display text-xl font-semibold text-olive group-hover:underline">
              {next.label}
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">{next.why}</p>
          </div>
          <span
            className="shrink-0 text-2xl text-olive transition-transform group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>

      {course && course.unitsTotal > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            🎓 O teu curso{" "}
            <span className="text-sm font-normal text-ink-faint">
              {placed
                ? `· nível ${course.level}`
                : `· ${course.level} por omissão — faz o teste de nível`}
            </span>
          </h2>
          <div className="card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-ink-soft">
                {course.unitsDone} de {course.unitsTotal} unidades
                {course.unitsStarted > 0
                  ? ` · ${course.unitsStarted} a meio`
                  : ""}
              </span>
              <span className="font-display text-xl font-semibold text-olive tabular-nums">
                {course.pct}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-olive transition-all"
                style={{ width: `${course.pct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {course.next ? (
                <Link
                  href={`/unidades/${course.next.slug}`}
                  className="btn-primary"
                >
                  {course.unitsDone === 0 && course.unitsStarted === 0
                    ? "Começar →"
                    : "Continuar →"}
                </Link>
              ) : (
                <span className="chip bg-sage-pale text-olive">
                  🏆 Nível {course.level} completo
                </span>
              )}
              {course.next ? (
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                  {course.next.title}
                  {course.next.titlePt ? (
                    <span className="text-ink-faint"> · {course.next.titlePt}</span>
                  ) : null}
                </span>
              ) : null}
              <Link
                href="/unidades"
                className="text-xs text-ink-faint hover:text-olive"
              >
                ver todas
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/*
        * Nobody in the family has ever answered the learning questionnaire —
        * they were all backfilled past onboarding, so the step that offers it
        * never fired for them. Paths, the daily goal and immersion have been
        * sitting dormant as a result.
        *
        * A quiet invitation rather than a blocking step: it is genuinely
        * optional, and someone with cards due should not be stopped to answer
        * a preference question.
        */}
      {!prefsAnswered ? (
        <Link
          href="/bem-vindo"
          className="block rounded-2xl border border-azul/30 bg-azul-pale/50 p-4 transition-colors hover:border-azul"
        >
          <span className="font-semibold text-azul">
            🧩 Como gostas de aprender?
          </span>
          <span className="ml-2 text-sm text-ink-soft">
            — cinco toques, e o curso reorganiza-se à tua volta.
          </span>
        </Link>
      ) : null}

      {due > 0 && next.href !== "/practice/rever" ? (
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

      {openHomework.length > 0 && !next.href.startsWith("/homework/") ? (
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
