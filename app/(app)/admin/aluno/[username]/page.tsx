import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorPatterns } from "@/components/admin-learner";
import { getLearnerDetail } from "@/lib/actions/admin";
import { requireStaff } from "@/lib/auth";
import { avatarFor, titleCase } from "@/lib/people";
import { formatEur, getSpend } from "@/lib/usage";
import { formatDate } from "@/lib/utils";

const HW_LABEL: Record<string, string> = {
  open: "por fazer",
  submitted: "por corrigir",
  reviewed: "corrigido",
};

const HW_CHIP: Record<string, string> = {
  open: "chip bg-terra-pale text-terra-dark",
  submitted: "chip bg-azul-pale text-azul",
  reviewed: "chip bg-sage-pale text-olive",
};

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-olive">
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-faint">{sub}</div>
    </div>
  );
}

export default async function LearnerPage(
  props: PageProps<"/admin/aluno/[username]">
) {
  const staff = await requireStaff();
  const { username } = await props.params;

  // getLearnerDetail re-checks requireStaff itself and validates the username
  // against the roster — anything else is a 404, so this route cannot be used
  // to probe for accounts.
  const learner = await getLearnerDetail(username);
  if (!learner) notFound();

  const isAdmin = staff.role === "admin";
  const spend = isAdmin ? await getSpend(learner.username).catch(() => null) : null;
  const name = titleCase(learner.username);

  const open = learner.homework.filter((h) => h.status === "open");
  const submitted = learner.homework.filter((h) => h.status === "submitted");
  const reviewed = learner.homework.filter((h) => h.status === "reviewed");
  const hwShown = [...submitted, ...open, ...reviewed.slice(0, 5)];
  const doneQuizzes = learner.quizzes.filter((q) => q.status === "completed");

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-faint hover:text-olive">
          ← Painel
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-2xl" aria-hidden>
            {avatarFor(learner.username)}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <span className="chip bg-azul-pale text-azul">{learner.level}</span>
          {learner.placed ? (
            <span className="chip bg-sage-pale text-olive">teste de nível feito</span>
          ) : (
            <span className="chip bg-terra-pale text-terra-dark">
              nunca fez o teste de nível
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {learner.placed
            ? "Everything this person has done, and what they keep getting wrong."
            : `${learner.level} is only the default — nobody has placed ${name} yet, so the level everything is pitched at is a guess.`}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Curso"
          value={
            learner.course.withItems > 0
              ? `${learner.course.done}/${learner.course.withItems}`
              : "—"
          }
          sub={
            learner.course.withItems > 0
              ? `unidades ${learner.level} com percurso`
              : `nenhuma unidade ${learner.level} tem percurso`
          }
        />
        <Stat
          label="Cartões a rever"
          value={`${learner.deck.due}`}
          sub={`de ${learner.deck.total} no baralho`}
        />
        <Stat
          label="Erros por rever"
          value={`${learner.deck.mistakeUnseen}`}
          sub="cartões de erro ainda por ver"
        />
        <Stat
          label="Acertos nas revisões"
          value={
            learner.deck.passRate === null ? "—" : `${learner.deck.passRate}%`
          }
          sub={
            learner.deck.reviews === 0
              ? "ainda não reviu nada"
              : `${learner.deck.reviews} revisões`
          }
        />
      </section>

      {isAdmin && spend ? (
        <p className="text-sm text-ink-soft">
          💶 Gasto de IA: <strong>{formatEur(spend.monthEur)}</strong> este mês ·{" "}
          {formatEur(spend.allTimeEur)} de sempre · {spend.calls} pedidos.
        </p>
      ) : null}

      <section>
        <h2 className="mb-1 text-lg font-semibold">🔁 O que continua a falhar</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Grouped from every correction in {name}&rsquo;s graded homework and
          quizzes — not a guess, the actual corrections.
        </p>
        <ErrorPatterns username={learner.username} patterns={learner.patterns} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          ✍️ TPC{" "}
          <span className="text-sm font-normal text-ink-faint">
            · {submitted.length} por corrigir
          </span>
        </h2>
        <div className="card divide-y divide-sand/70">
          {hwShown.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-faint">
              Ainda não tem TPC.
            </p>
          ) : (
            hwShown.map((h) => (
              <Link
                key={h.id}
                href={`/homework/${h.id}`}
                className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-sage-pale/40"
              >
                <span className="min-w-0 flex-1 basis-full truncate text-sm font-medium sm:basis-auto">
                  {h.title}
                </span>
                <span className={HW_CHIP[h.status] ?? "chip"}>
                  {HW_LABEL[h.status] ?? h.status}
                </span>
                <span className="text-xs text-ink-faint">
                  {formatDate(h.createdAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🎯 Testes recentes</h2>
        <div className="card divide-y divide-sand/70">
          {doneQuizzes.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-faint">
              Ainda não completou nenhum teste.
            </p>
          ) : (
            doneQuizzes.slice(0, 10).map((q) => {
              const pct =
                q.score !== null && q.total ? Math.round((q.score / q.total) * 100) : null;
              return (
                <Link
                  key={q.id}
                  href={`/practice/${q.id}`}
                  className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-sage-pale/40"
                >
                  <span className="min-w-0 flex-1 basis-full truncate text-sm font-medium sm:basis-auto">
                    {q.topic}
                  </span>
                  <span
                    className={
                      pct !== null && pct >= 70
                        ? "chip bg-sage-pale text-olive"
                        : "chip bg-terra-pale text-terra-dark"
                    }
                  >
                    {q.score}/{q.total}
                    {pct !== null ? ` · ${pct}%` : ""}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {formatDate(q.createdAt)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🕒 Atividade recente</h2>
        <div className="card divide-y divide-sand/70">
          {learner.activity.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-faint">
              {name} ainda não fez nada na app.
            </p>
          ) : (
            learner.activity.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm"
              >
                <span className="chip shrink-0 bg-cream text-ink-soft">
                  {a.kind}
                </span>
                <span className="min-w-0 flex-1">{a.summary}</span>
                <span className="shrink-0 text-xs text-ink-faint">
                  +{a.xp} XP · {formatDate(a.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
