import Link from "next/link";
import { QuizNewForm } from "@/components/quiz-new-form";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { getQuizzesAll } from "@/lib/data";
import { countDue } from "@/lib/srs";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Praticar" };

export default async function PracticePage(props: PageProps<"/practice">) {
  const session = await requireSession();
  const { topic } = await props.searchParams;
  const [quizzes, due, level] = await Promise.all([
    getQuizzesAll(),
    countDue(session.username).catch(() => 0),
    getMyCefr(),
  ]);

  const MODES = [
    {
      href: "/practice/rever",
      emoji: "🔁",
      title: "Rever",
      sub: due > 0 ? `${due} cartões à espera` : "spaced repetition",
      hot: due > 0,
    },
    { href: "/practice/falar", emoji: "🎙️", title: "Falar", sub: "a Luna ouve-te" },
    { href: "/practice/ditado", emoji: "✏️", title: "Ditado", sub: "ouve e escreve" },
    { href: "/practice/verbos", emoji: "⚡", title: "Verbos", sub: "conjugação sprint" },
    { href: "/escutar", emoji: "👂", title: "Escutar", sub: "diálogos com transcrição" },
    { href: "/practice/audio", emoji: "📻", title: "Áudio", sub: "sessões para o carro" },
    { href: "/ouvir", emoji: "🎧", title: "Ouvir", sub: "rádio, podcasts, vídeo" },
    { href: "/stories", emoji: "📕", title: "Histórias", sub: "ler ao teu nível" },
    { href: "/missoes", emoji: "🗺️", title: "Missões", sub: "sai à rua e fala" },
    { href: "/practice/ciple", emoji: "🎓", title: "CIPLE", sub: "preparação do exame" },
    { href: "/placement", emoji: "🧭", title: "Nível", sub: "descobre o teu CEFR" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">🎯 Praticar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Twelve ways to train — reviews, live conversation, dictation, verbs,
          listening, real-world missions, exam prep and more — plus fresh
          quizzes below.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`card group p-4 transition-all hover:border-sage hover:shadow-md ${
              m.hot ? "border-terra/40 bg-terra-pale/30" : ""
            }`}
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

      <QuizNewForm
        initialTopic={typeof topic === "string" ? topic : ""}
        initialLevel={level}
      />

      {quizzes.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Testes da família</h2>
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
      ) : null}
    </div>
  );
}
