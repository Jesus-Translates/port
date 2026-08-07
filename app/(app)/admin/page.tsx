import Link from "next/link";
import { desc } from "drizzle-orm";
import { ContentList, DangerTools } from "@/components/admin-tools";
import { AssignHomework } from "@/components/assign-homework";
import { getValidUsers, requireStaff } from "@/lib/auth";
import { getClassOverview } from "@/lib/actions/admin";
import { getFamilyBoard } from "@/lib/data";
import { avatarFor, titleCase } from "@/lib/people";
import { getDb, homework, kudos, notes, quizzes, ttsAudio } from "@/lib/db";
import { formatEur, getSpendByUser } from "@/lib/usage";
import { formatDate } from "@/lib/utils";
import { sql } from "drizzle-orm";

export const metadata = { title: "Painel" };

export default async function AdminPage() {
  const staff = await requireStaff();
  const students = getValidUsers();
  const classOverview = await getClassOverview();

  const isAdmin = staff.role === "admin";
  const db = getDb();

  const [board, spend, recentHw, recentQuizzes, recentNotes, recentKudos, ttsCount] =
    isAdmin
      ? await Promise.all([
          getFamilyBoard(students).catch(() => []),
          getSpendByUser().catch(() => []),
          db.select().from(homework).orderBy(desc(homework.createdAt)).limit(10),
          db.select().from(quizzes).orderBy(desc(quizzes.createdAt)).limit(10),
          db.select().from(notes).orderBy(desc(notes.updatedAt)).limit(10),
          db.select().from(kudos).orderBy(desc(kudos.createdAt)).limit(10),
          db
            .select({ n: sql<number>`count(*)::int` })
            .from(ttsAudio)
            .then((r) => Number(r[0]?.n ?? 0)),
        ])
      : [[], [], [], [], [], [], 0];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          ⚙️ Painel {isAdmin ? "de administração" : "da professora"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isAdmin
            ? "Full control: assign work, inspect everyone, manage content."
            : "Assign homework and follow the class, Professora Kelly. 👩‍🏫"}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">✍️ Atribuir TPC</h2>
        <AssignHomework students={students} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">📋 A turma</h2>
        <div className="card divide-y divide-sand/70">
          {classOverview.map((s) => (
            <div key={s.username} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="text-xl" aria-hidden>
                {avatarFor(s.username)}
              </span>
              <span className="w-20 font-medium capitalize">
                {titleCase(s.username)}
              </span>
              <span className="chip bg-terra-pale text-terra-dark">
                {s.open} por fazer
              </span>
              <span className="chip bg-azul-pale text-azul">
                {s.submitted} entregues
              </span>
              <span className="chip">{s.reviewed} corrigidos</span>
              {s.latestTitle && s.latestId ? (
                <Link
                  href={`/homework/${s.latestId}`}
                  className="min-w-0 flex-1 truncate text-right text-xs text-ink-faint hover:text-olive"
                >
                  último: {s.latestTitle}
                </Link>
              ) : (
                <span className="flex-1 text-right text-xs text-ink-faint">
                  sem TPC ainda
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold">👥 Alunos — atividade e gastos</h2>
            <div className="card divide-y divide-sand/70">
              {board.map((m) => {
                const s = spend.find((x) => x.username === m.username);
                return (
                  <div
                    key={m.username}
                    className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span aria-hidden>{avatarFor(m.username)}</span>
                    <span className="w-20 font-medium capitalize">
                      {titleCase(m.username)}
                    </span>
                    <span className="text-ink-soft">{m.xp} XP</span>
                    <span className="text-ink-soft">🔥 {m.streakDays}d</span>
                    <span className="text-ink-soft">
                      {m.quizzesDone} testes
                      {m.quizAccuracy !== null ? ` · ${m.quizAccuracy}%` : ""}
                    </span>
                    <span className="text-ink-soft">⭐ {m.stars}</span>
                    <span className="ml-auto font-semibold text-terra-dark tabular-nums">
                      {formatEur(s?.monthEur ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">🗂️ Conteúdo recente</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card overflow-hidden">
                <h3 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
                  TPC
                </h3>
                <ContentList
                  kind="homework"
                  items={recentHw.map((h) => ({
                    id: h.id,
                    label: h.title,
                    sub: `${titleCase(h.username)} · ${h.status} · ${formatDate(h.createdAt)}`,
                  }))}
                />
              </div>
              <div className="card overflow-hidden">
                <h3 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
                  Testes
                </h3>
                <ContentList
                  kind="quiz"
                  items={recentQuizzes.map((q) => ({
                    id: q.id,
                    label: q.topic,
                    sub: `${titleCase(q.username)} · ${q.status} · ${formatDate(q.createdAt)}`,
                  }))}
                />
              </div>
              <div className="card overflow-hidden">
                <h3 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
                  Notas
                </h3>
                <ContentList
                  kind="note"
                  items={recentNotes.map((n) => ({
                    id: n.id,
                    label: n.title,
                    sub: `${titleCase(n.username)} · ${formatDate(n.updatedAt)}`,
                  }))}
                />
              </div>
              <div className="card overflow-hidden">
                <h3 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
                  Elogios
                </h3>
                <ContentList
                  kind="kudo"
                  items={recentKudos.map((k) => ({
                    id: k.id,
                    label: k.message || (k.kind === "star" ? "⭐ estrela" : "recado"),
                    sub: `${titleCase(k.fromUser)} → ${titleCase(k.toUser)}`,
                  }))}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">🧰 Ferramentas</h2>
            <div className="card p-4">
              <DangerTools ttsClips={ttsCount} students={students} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
