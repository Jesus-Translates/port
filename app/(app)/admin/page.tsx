import Link from "next/link";
import { DangerTools } from "@/components/admin-tools";
import { AssignHomework } from "@/components/assign-homework";
import { getClassOverview, getHubStats } from "@/lib/actions/admin";
import { getValidUsers, requireStaff } from "@/lib/auth";
import { getDb, ttsAudio } from "@/lib/db";
import { avatarFor, titleCase } from "@/lib/people";
import { formatEur, getSpendByUser } from "@/lib/usage";
import { formatDate } from "@/lib/utils";
import { sql } from "drizzle-orm";

export const metadata = { title: "Painel" };

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "olive" | "terra" | "azul";
}) {
  const colour =
    tone === "terra"
      ? "text-terra"
      : tone === "azul"
        ? "text-azul"
        : "text-olive";
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${colour}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-faint">{sub}</div>
    </div>
  );
}

export default async function AdminPage() {
  const staff = await requireStaff();
  const isAdmin = staff.role === "admin";
  const students = getValidUsers();

  const [stats, turma] = await Promise.all([getHubStats(), getClassOverview()]);

  // Spend and the destructive tools are the admin's business only.
  const [spend, ttsCount] = isAdmin
    ? await Promise.all([
        getSpendByUser().catch(() => []),
        getDb()
          .select({ n: sql<number>`count(*)::int` })
          .from(ttsAudio)
          .then((r) => Number(r[0]?.n ?? 0))
          .catch(() => 0),
      ])
    : [[], 0];
  const monthTotal = spend.reduce((sum, s) => sum + s.monthEur, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          ⚙️ Painel {isAdmin ? "de administração" : "da professora"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isAdmin
            ? "Where the family's learning is run from: the class, the content, and the machine underneath."
            : "Follow the class and set the work, Professora Kelly. 👩‍🏫"}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          tone="olive"
          label="Ativos esta semana"
          value={`${stats.activeThisWeek}`}
          sub={`de ${stats.learners} na família`}
        />
        <Stat
          tone="terra"
          label="TPC por corrigir"
          value={`${stats.awaitingCorrection}`}
          sub={
            stats.awaitingCorrection === 0
              ? "nada à espera"
              : "entregues, à espera de ti"
          }
        />
        <Stat
          tone="azul"
          label="Unidades publicadas"
          value={`${stats.unitsPublished}`}
          sub={
            stats.unitsDraft > 0
              ? `+ ${stats.unitsDraft} em rascunho`
              : "nenhuma em rascunho"
          }
        />
        {isAdmin ? (
          <Stat
            tone="terra"
            label="IA este mês"
            value={formatEur(monthTotal)}
            sub={`${spend.length} ${spend.length === 1 ? "pessoa" : "pessoas"} a gastar`}
          />
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">✍️ Atribuir TPC</h2>
        <AssignHomework students={students} />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">📋 A turma</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Tap a name to see what that person is actually struggling with.
        </p>
        <div className="card divide-y divide-sand/70">
          {turma.map((s) => {
            const money = spend.find((x) => x.username === s.username);
            return (
              <Link
                key={s.username}
                href={`/admin/aluno/${s.username}`}
                className="block px-4 py-3 transition-colors hover:bg-sage-pale/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {avatarFor(s.username)}
                  </span>
                  <span className="font-medium capitalize">
                    {titleCase(s.username)}
                  </span>
                  <span
                    className={
                      s.placed
                        ? "chip bg-azul-pale text-azul"
                        : "chip bg-cream text-ink-soft"
                    }
                  >
                    {s.level}
                    {s.placed ? "" : " por omissão"}
                  </span>
                  <span className="ml-auto flex items-center gap-3 text-xs text-ink-faint">
                    {isAdmin ? (
                      <span className="font-semibold text-terra-dark tabular-nums">
                        {formatEur(money?.monthEur ?? 0)}
                      </span>
                    ) : null}
                    <span aria-hidden>›</span>
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-9">
                  {s.open > 0 ? (
                    <span className="chip bg-terra-pale text-terra-dark">
                      {s.open} por fazer
                    </span>
                  ) : null}
                  {s.submitted > 0 ? (
                    <span className="chip bg-azul-pale text-azul">
                      {s.submitted} por corrigir
                    </span>
                  ) : null}
                  {s.reviewed > 0 ? (
                    <span className="chip">{s.reviewed} corrigidos</span>
                  ) : null}
                  {s.open + s.submitted + s.reviewed === 0 ? (
                    <span className="text-xs text-ink-faint">sem TPC ainda</span>
                  ) : null}
                  <span className="ml-auto text-xs text-ink-faint">
                    {s.lastActiveAt
                      ? `visto a ${formatDate(s.lastActiveAt)}`
                      : "nunca entrou"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🗂️ Gerir</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/conteudo"
            className="card p-5 transition-colors hover:bg-sage-pale/40"
          >
            <div className="font-display text-lg font-semibold">
              📚 Conteúdo
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              Units, listening clips, stories and the phrasebook — publish,
              unpublish, and see what is still a draft.
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              {stats.unitsPublished} publicadas
              {stats.unitsDraft > 0 ? ` · ${stats.unitsDraft} rascunhos` : ""}
            </p>
          </Link>

          {isAdmin ? (
            <Link
              href="/admin/sistema"
              className="card p-5 transition-colors hover:bg-sage-pale/40"
            >
              <div className="font-display text-lg font-semibold">
                🔧 Sistema
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                Speech provider, what the AI spend went on, cached audio and how
                full the database is getting.
              </p>
              <p className="mt-2 text-xs text-ink-faint">
                {formatEur(monthTotal)} este mês
              </p>
            </Link>
          ) : null}
        </div>
      </section>

      {isAdmin ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">🧰 Ferramentas</h2>
          <div className="card p-4">
            <DangerTools ttsClips={ttsCount} students={students} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
