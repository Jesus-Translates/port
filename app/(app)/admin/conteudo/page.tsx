import Link from "next/link";
import { UnitRows } from "@/components/admin-content";
import { ContentList } from "@/components/admin-tools";
import { getContentOverview } from "@/lib/actions/admin";
import { requireStaff } from "@/lib/auth";
import { getDb, homework, kudos, notes, quizzes } from "@/lib/db";
import { titleCase } from "@/lib/people";
import { formatDate } from "@/lib/utils";
import { desc } from "drizzle-orm";

export const metadata = { title: "Conteúdo" };

const CEFR_ORDER = ["A1", "A2", "B1", "B2"];

export default async function ContentPage() {
  const staff = await requireStaff();
  const isAdmin = staff.role === "admin";
  const content = await getContentOverview();

  const db = getDb();
  // Moderation of what the family produced is a destructive action, so it is
  // admin-only — adminDeleteContent refuses a teacher anyway.
  const [recentHw, recentQuizzes, recentNotes, recentKudos] = isAdmin
    ? await Promise.all([
        db.select().from(homework).orderBy(desc(homework.createdAt)).limit(10),
        db.select().from(quizzes).orderBy(desc(quizzes.createdAt)).limit(10),
        db.select().from(notes).orderBy(desc(notes.updatedAt)).limit(10),
        db.select().from(kudos).orderBy(desc(kudos.createdAt)).limit(10),
      ])
    : [[], [], [], []];

  const drafts = content.units.filter((u) => u.status !== "published");
  const noPath = content.units.filter((u) => u.items === 0);
  const levels = [
    ...CEFR_ORDER.filter((l) => content.units.some((u) => u.cefr === l)),
    ...[...new Set(content.units.map((u) => u.cefr))].filter(
      (l) => !CEFR_ORDER.includes(l)
    ),
  ];

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-faint hover:text-olive">
          ← Painel
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          📚 Conteúdo
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything the family can open. A unit in{" "}
          <strong>rascunho</strong> is invisible to students — only staff can
          see it.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-ink-soft">Unidades</div>
          <div className="mt-1 font-display text-2xl font-bold text-olive">
            {content.units.length}
          </div>
          <div className="mt-1 text-xs text-ink-faint">
            {content.units.length - drafts.length} publicadas
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-soft">Rascunhos</div>
          <div
            className={
              drafts.length > 0
                ? "mt-1 font-display text-2xl font-bold text-terra"
                : "mt-1 font-display text-2xl font-bold text-olive"
            }
          >
            {drafts.length}
          </div>
          <div className="mt-1 text-xs text-ink-faint">
            {drafts.length === 0
              ? "os alunos veem tudo"
              : "escondidas dos alunos"}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-soft">Sem percurso</div>
          <div
            className={
              noPath.length > 0
                ? "mt-1 font-display text-2xl font-bold text-terra"
                : "mt-1 font-display text-2xl font-bold text-olive"
            }
          >
            {noPath.length}
          </div>
          <div className="mt-1 text-xs text-ink-faint">
            unidades sem atividades
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-soft">Livro de frases</div>
          <div className="mt-1 font-display text-2xl font-bold text-azul">
            {content.categories.reduce((s, c) => s + c.entries, 0)}
          </div>
          <div className="mt-1 text-xs text-ink-faint">
            em {content.categories.length} categorias
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">📘 Unidades por nível</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Tap the status badge to publish or unpublish. A unit with no
          activities and no note is an empty shell.
        </p>
        <div className="space-y-3">
          {levels.map((level) => {
            const mine = content.units.filter((u) => u.cefr === level);
            const pub = mine.filter((u) => u.status === "published").length;
            return (
              <details key={level} className="card overflow-hidden">
                <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-2 px-4 py-3 hover:bg-sage-pale/40">
                  <span className="chip bg-azul-pale text-azul">{level}</span>
                  <span className="font-medium">
                    {mine.length} {mine.length === 1 ? "unidade" : "unidades"}
                  </span>
                  <span className="ml-auto text-xs text-ink-faint">
                    {pub} publicadas · {mine.length - pub} rascunhos
                  </span>
                </summary>
                <div className="border-t border-sand/70">
                  <UnitRows units={mine} />
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <h2 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
            🎧 Escutar · {content.clips.length}
          </h2>
          {content.clips.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-faint">
              Ainda não há gravações.
            </p>
          ) : (
            <ul className="divide-y divide-sand/70">
              {content.clips.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/escutar/${c.id}`}
                    className="flex min-h-12 flex-wrap items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-sage-pale/40"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {c.title}
                    </span>
                    <span className="chip shrink-0">{c.cefr}</span>
                    <span className="chip shrink-0 bg-cream text-ink-soft">
                      {c.source === "human" ? "gravado" : "IA"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <h2 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
            📖 Histórias · {content.stories.length}
          </h2>
          {content.stories.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-faint">
              Ainda não há histórias.
            </p>
          ) : (
            <ul className="divide-y divide-sand/70">
              {content.stories.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/stories/${s.id}`}
                    className="flex min-h-12 flex-wrap items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-sage-pale/40"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {s.title}
                    </span>
                    <span className="chip shrink-0">{s.level}</span>
                    <span className="shrink-0 text-xs text-ink-faint">
                      cap. {s.chapter}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          🗂️ Livro de frases{" "}
          <span className="text-sm font-normal text-ink-faint">
            · {content.categories.length} categorias
          </span>
        </h2>
        <div className="card divide-y divide-sand/70">
          {content.categories.map((c) => (
            <Link
              key={c.id}
              href={`/reference/${c.slug}`}
              className="flex min-h-12 items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-sage-pale/40"
            >
              <span className="min-w-0 flex-1 truncate font-medium">
                {c.namePt}
              </span>
              <span
                className={
                  c.entries === 0
                    ? "chip shrink-0 bg-terra-pale text-terra-dark"
                    : "chip shrink-0"
                }
              >
                {c.entries} {c.entries === 1 ? "entrada" : "entradas"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <section>
          <h2 className="mb-1 text-lg font-semibold">🧹 O que a família criou</h2>
          <p className="mb-3 text-sm text-ink-soft">
            The most recent rows, with a delete for anything that should not be
            there.
          </p>
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
      ) : null}
    </div>
  );
}
