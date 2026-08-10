import Link from "next/link";
import { QuizNewForm } from "@/components/quiz-new-form";
import { QuizUnitForm } from "@/components/quiz-unit-form";
import { UnitReturn } from "@/components/unit-return";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { getQuizzesAll } from "@/lib/data";
import { countDue } from "@/lib/srs";
import { unitContextFrom } from "@/lib/unit-context";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Praticar" };

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

export default async function PracticePage(props: PageProps<"/practice">) {
  const session = await requireSession();
  const sp = await props.searchParams;
  const topic = one(sp.topic).slice(0, 300);
  // A unit path sends the learner here for ONE job: the quiz it asked for.
  const unit = await unitContextFrom(sp);
  const [quizzes, due, level] = await Promise.all([
    getQuizzesAll(),
    countDue(session.username).catch(() => 0),
    getMyCefr(),
  ]);

  const REVER = {
    href: "/practice/rever",
    emoji: "🔁",
    title: "Rever",
    sub: due > 0 ? `${due} cartões à espera` : "spaced repetition",
    hot: due > 0,
  };

  /**
   * Grouped by the SKILL each one trains, because "which of these fourteen
   * things should I do?" is a question the learner cannot answer and should
   * not be asked. Pick a skill, then pick a tool.
   */
  const GROUPS = [
    {
      title: "🗣️ Falar",
      en: "get the words out of your mouth",
      items: [
        { href: "/practice/conversa", emoji: "💬", title: "Conversa", sub: "fala com a Sandra" },
        { href: "/practice/falar", emoji: "🎙️", title: "Ler em voz alta", sub: "a Sandra ouve-te" },
        { href: "/missoes", emoji: "🗺️", title: "Missões", sub: "sai à rua e fala" },
      ],
    },
    {
      title: "👂 Ouvir",
      en: "tune your ear",
      items: [
        { href: "/escutar", emoji: "👂", title: "Escutar", sub: "diálogos com transcrição" },
        { href: "/practice/ditado", emoji: "✏️", title: "Ditado", sub: "ouve e escreve" },
        { href: "/practice/audio", emoji: "📻", title: "No carro", sub: "sessões mãos-livres" },
      ],
    },
    {
      title: "📖 Ler e escrever",
      en: "words on the page",
      items: [
        { href: "/stories", emoji: "📕", title: "Histórias", sub: "ler ao teu nível" },
        { href: "/verbos", emoji: "🔤", title: "Verbos", sub: "consulta, ouve e treina" },
        { href: "/reference", emoji: "📖", title: "O Livro", sub: "o teu livro de frases" },
      ],
    },
    {
      title: "🎲 Jogar",
      en: "the fun half",
      items: [
        { href: "/jogos", emoji: "🎮", title: "Jogos", sub: "seis jogos rápidos" },
        { href: "/jogos/genero", emoji: "⚖️", title: "O ou A?", sub: "género contra o relógio" },
        { href: "/jogos/intruso", emoji: "🕵️", title: "O Intruso", sub: "só português no ecrã" },
      ],
    },
  ];

  const grid = (
    <div className="space-y-6">
      {/* Rever leads on its own: it is the only tool whose value decays if you
          skip it, so it must not sit as one tile among twelve. */}
      <Link
        href={REVER.href}
        className={`card group flex items-center gap-4 p-4 transition-all hover:border-sage hover:shadow-md ${
          REVER.hot ? "border-terra/40 bg-terra-pale/30" : ""
        }`}
      >
        <span className="text-3xl" aria-hidden>
          {REVER.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold group-hover:text-olive">
            {REVER.title}
          </span>
          <span className="block text-sm text-ink-soft">{REVER.sub}</span>
        </span>
        <span className="shrink-0 text-ink-faint" aria-hidden>
          →
        </span>
      </Link>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <h3 className="text-sm font-semibold">
            {g.title}{" "}
            <span className="font-normal text-ink-faint">· {g.en}</span>
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {g.items.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className="card group p-4 transition-all hover:border-sage hover:shadow-md"
        >
          <div className="text-2xl" aria-hidden>
            {m.emoji}
          </div>
          <div className="mt-2 font-semibold group-hover:text-olive">
            {m.title}
          </div>
          <div className="mt-0.5 text-xs text-ink-soft">{m.sub}</div>
            </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Exam prep and the level test are real, but they are not a way to
          practise — they belong in a footnote, not the main grid. */}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
        <Link href="/workbook" className="hover:text-olive">
          📚 Lições · fichas de trabalho
        </Link>
        <Link href="/notes" className="hover:text-olive">
          📝 Notas · os teus apontamentos
        </Link>
        <Link href="/practice/ciple" className="hover:text-olive">
          🎓 CIPLE · preparação do exame
        </Link>
        <Link href="/ouvir" className="hover:text-olive">
          🎧 Rádio e podcasts
        </Link>
        <Link href="/placement" className="hover:text-olive">
          🧭 Refazer o teste de nível
        </Link>
      </p>
    </div>
  );

  const family =
    quizzes.length > 0 ? (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Testes da família</h2>
        <div className="card divide-y divide-sand/70">
          {quizzes.map((q) => (
            <Link
              key={q.id}
              href={`/practice/${q.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
            >
              <span aria-hidden>{q.status === "completed" ? "✅" : "🎯"}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{q.topic}</div>
                <div className="text-xs text-ink-faint">
                  {q.level} · {formatDate(q.createdAt)}
                </div>
              </div>
              <span className="chip capitalize">{q.username}</span>
              {q.status === "completed" && q.score != null ? (
                <span className="chip">
                  {q.score}/{q.total}
                </span>
              ) : q.username === session.username ? (
                <span className="text-xs text-terra">por fazer →</span>
              ) : (
                <span className="text-xs text-ink-faint">por fazer</span>
              )}
            </Link>
          ))}
        </div>
      </section>
    ) : null;

  // Sent here by a unit step? Then the quiz IS the screen. Fourteen tiles above
  // the form is fourteen ways to leave before doing the one thing you came for,
  // so they move to the bottom under a heading that admits what they are.
  if (unit) {
    return (
      <div className="space-y-6">
        <header>
          <UnitReturn unit={unit} />
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            🎯 Teste da unidade
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Um teste escrito de propósito para este passo de{" "}
            <span className="font-medium">{unit.titlePt || unit.title}</span>.{" "}
            <span className="text-ink-faint">
              Finish it and the step ticks itself off.
            </span>
          </p>
          {topic ? (
            <p className="mt-2">
              {/* Unit topics are whole sentences — the form below holds the
                  full text; this chip only has to be recognisable. */}
              <span className="chip bg-cream text-ink-soft">
                🎯 {topic.length > 80 ? `${topic.slice(0, 80).trimEnd()}…` : topic}
              </span>
            </p>
          ) : null}
        </header>

        <QuizUnitForm unit={unit} initialTopic={topic} initialLevel={level} />

        {family}

        <section>
          <h2 className="mb-3 text-lg font-semibold">Outras formas de praticar</h2>
          <p className="mb-3 text-sm text-ink-soft">
            Other ways to train — they&apos;ll still be here after the quiz.
          </p>
          {grid}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">🎯 Praticar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Pick a skill, then pick a tool — reviews, live conversation, dictation, verbs,
          listening, real-world missions, exam prep and more — plus fresh
          quizzes below.
        </p>
      </header>

      {grid}

      <QuizNewForm initialTopic={topic} initialLevel={level} />

      {family}
    </div>
  );
}
