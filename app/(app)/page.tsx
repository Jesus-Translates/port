import Link from "next/link";
import { AzulejoHeader, BandTile } from "@/components/azulejo-header";
import { CalcadaPath } from "@/components/calcada-path";
import { IconFlame } from "@/components/icons";
import { redirect } from "next/navigation";
import { isOperator, requireSession } from "@/lib/auth";
import { currentAccountId, householdUsernames } from "@/lib/tenant";
import {
  getFamilyBoard,
  getHomeworkAll,
  getKudosFor,
  getStats,
  hasBeenPlaced,
} from "@/lib/data";
import { getCaminho, getCourseProgress } from "@/lib/actions/course";
import { getMyToday } from "@/lib/actions/leaderboard";
import { dailyGoal, DEFAULT_PREFS } from "@/lib/learning-path";
import { getMyPrefs } from "@/lib/actions/profile";
import { resolveNextAction } from "@/lib/next-action";
import { avatarFor, titleCase } from "@/lib/people";
import { cn } from "@/lib/utils";
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

  /*
   * A platform operator belongs to no family, so every panel on this screen —
   * the streak, the path, the family strip — reads back empty. Their home is
   * the console. An operator who also runs a family has real data here and is
   * left alone.
   */
  if (
    (await isOperator(session.username)) &&
    (await currentAccountId()) === null
  ) {
    redirect("/admin/operador");
  }
  // Social widgets must never take down the whole dashboard.
  const [
    stats,
    allHomework,
    board,
    myKudos,
    due,
    next,
    course,
    placed,
    prefs,
    caminho,
    today_,
  ] = await Promise.all([
    getStats(session.username),
    getHomeworkAll(),
    householdUsernames().then(getFamilyBoard).catch(() => []),
    getKudosFor(session.username, 5).catch(() => []),
    countDue(session.username).catch(() => 0),
    resolveNextAction(session.username, session.displayName),
    getCourseProgress().catch(() => null),
    hasBeenPlaced(session.username).catch(() => true),
    getMyPrefs().catch(() => null),
    getCaminho().catch(() => []),
    getMyToday().catch(() => ({ xp: 0, done: 0 })),
  ]);
  const prefsAnswered = prefs !== null;
  // Rank and stars used to sit in the old header. The azulejo band carries
  // streak and daily goal instead, and the ranking lives on Família where it
  // has room to mean something.

  const openHomework = allHomework.filter(
    (h) => h.username === session.username && h.status === "open"
  );
  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Lisbon",
  });

  /*
   * The ring counts FINISHED ACTIVITIES, not XP.
   *
   * dailyGoal() returns 1, 3 or 5 — a number of things done, not points. It
   * first shipped fed with today's XP, which rendered "5 / 3": a figure past
   * its own target that still drew as unfinished.
   */
  const goal = dailyGoal(prefs ?? DEFAULT_PREFS);
  const doneToday = today_.done;
  const goalPct = Math.min(100, Math.round((doneToday / Math.max(1, goal)) * 100));

  return (
    <div className="space-y-6">
      <AzulejoHeader
        variant="full"
        eyebrow={today}
        title={`Bom dia, ${session.displayName}`}
        avatar={avatarFor(session.displayName)}
      >
        <div className="flex gap-2.5">
          <BandTile label="Fogo">
            <IconFlame size={15} className="mr-1 text-terra-light" />
            <span className="font-display text-[27px] leading-none font-semibold">
              {stats.streakDays}
            </span>
            {/* paper/85 is the floor on olive: /60 and /70 sat at 3.2:1 and
                3.7:1 against the band. */}
            <span className="text-[13px] text-paper/85">
              {stats.streakDays === 1 ? "dia" : "dias"}
            </span>
          </BandTile>

          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-paper/15 px-3.5 py-3">
            {/* The ring is a conic-gradient with a punched centre — no SVG, no
                library, and it inherits the band's olive for the hole. */}
            <div
              className="grid size-[34px] shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-terra-light) 0 ${goalPct}%, rgba(250,247,240,.18) ${goalPct}% 100%)`,
              }}
              aria-hidden
            >
              <span className="size-[23px] rounded-full bg-olive" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[.09em] text-paper/85 uppercase">
                Meta de hoje
              </p>
              <p className="mt-0.5">
                <span className="font-display text-[21px] leading-none font-semibold">
                  {doneToday}
                </span>
                <span className="text-[12px] text-paper/85">/{goal}</span>
              </p>
            </div>
          </div>
        </div>
      </AzulejoHeader>

      {/* One answer to "what now?", so a session never starts with a decision
          across twenty identical tiles. The banners below suppress themselves
          when this card already points at the same place. */}
      <Link
        href={next.href}
        className="group block overflow-hidden rounded-[20px] border border-sand bg-white shadow-[0_2px_10px_rgba(43,39,31,.05)] transition-all hover:border-sage hover:shadow-md"
      >
        <div className="p-[17px_18px_16px]">
          <div className="flex items-center gap-2">
            <span className="chip bg-terra-pale text-terra-dark">
              {next.emoji} A seguir
            </span>
          </div>
          <p className="mt-2 font-display text-[22px] leading-tight font-semibold tracking-[-.01em]">
            {next.label}
          </p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
            {next.why}
          </p>
        </div>
        <div className="flex items-center justify-between bg-olive px-[18px] py-[13px] text-[14.5px] font-semibold text-paper">
          <span>Começar</span>
          <span className="transition-transform group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </div>
      </Link>

      <CalcadaPath
        stones={caminho}
        unitLabel={course ? `Nível ${course.level}` : null}
      />

      {/* nav.tsx retired the Praticar tab on the promise of a "Tudo" link
          here. Until this card that link never existed, which left Conversa,
          Ditado, Escutar, Histórias, Missões and the rest reachable only from
          a footnote on Palavras — a third of the product behind small print. */}
      <Link
        href="/practice"
        className="card group flex items-center gap-4 p-4 transition-all hover:border-sage hover:shadow-md"
      >
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage-pale text-2xl"
          aria-hidden
        >
          🎯
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold group-hover:text-olive">
            Tudo para praticar
          </span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            Conversa, ditado, escutar, histórias, missões e mais
          </span>
        </span>
        <span
          className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-1"
          aria-hidden
        >
          →
        </span>
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
            {/*
              PROGRESS, not a second front door.
              This card used to carry its own "Começar →" pointing at the same
              unit as the "A seguir" card above it. Two buttons, same
              destination, different words — and no way to tell which one was
              the real start. The card above is the one place to begin; this is
              how far the course has got.
            */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {course.next ? (
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                  <span className="text-ink-faint">A seguir: </span>
                  {course.next.title}
                  {course.next.titlePt ? (
                    <span className="text-ink-faint"> · {course.next.titlePt}</span>
                  ) : null}
                </span>
              ) : (
                <span className="chip bg-sage-pale text-olive">
                  🏆 Nível {course.level} completo
                </span>
              )}
              <Link
                href="/unidades"
                className="text-xs text-ink-faint hover:text-olive"
              >
                ver todas · see all
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


      {/* Who else is at it today. Three tiles, not a leaderboard — the ranking
          lives on Família, and the point here is only "you are not alone". */}
      {board.length > 1 ? (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            {/* "esta semana", not "hoje": getFamilyBoard gives a weekly total,
                and labelling it today's would be a number that quietly lies. */}
            <p className="label mb-0">A família esta semana</p>
            <Link href="/familia" className="text-xs text-azul hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {board.slice(0, 6).map((m) => (
              <Link
                key={m.username}
                href="/familia"
                className={cn(
                  "card flex flex-col items-center gap-1.5 px-2.5 py-3 text-center transition-colors hover:border-sage",
                  m.username === session.username && "border-sage bg-sage-pale/40"
                )}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-cream font-display text-sm font-semibold text-olive">
                  {avatarFor(m.username)}
                </span>
                <span className="w-full truncate text-[12.5px] font-semibold">
                  {titleCase(m.username)}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    m.xpThisWeek > 0 ? "text-terra" : "text-ink-faint"
                  )}
                >
                  {m.xpThisWeek > 0 ? `${m.xpThisWeek} XP` : "Por fazer"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {stats.recent.length > 0 ? (
        <section>
          {/* Not "A família esta semana" — that title already names the XP
              strip above, and two sections with one name read as a bug. */}
          <h2 className="mb-3 text-lg font-semibold">Atividade recente</h2>
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
