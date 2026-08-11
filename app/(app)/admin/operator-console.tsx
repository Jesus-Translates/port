import Link from "next/link";
import { Stat } from "@/components/stat-card";
import { getHouseholdReports } from "@/lib/actions/reports";
import { orphanUsernames } from "@/lib/tenant";
import { formatEur } from "@/lib/usage";
import { cn } from "@/lib/utils";

/**
 * What the person who RUNS the deployment sees at /admin.
 *
 * The panel at /admin was written for a family: a class list, homework to
 * assign, a review deck to reset. All of it reads through householdUsernames(),
 * and a platform operator belongs to no family — so householdUsernames() falls
 * back to "a household of one" and every one of those sections came back
 * empty. The operator got an admin panel with zero stats, nobody in the class,
 * and a homework picker containing only themselves. Correct data, useless
 * screen.
 *
 * An operator's subject is the INSTANCE, so this shows the instance: how many
 * families there are, what they cost, what they pay, and the way in to each
 * management surface. The family panel still renders unchanged for anyone who
 * actually has a family.
 */
export async function OperatorConsole() {
  const [report, orphans] = await Promise.all([
    getHouseholdReports(),
    orphanUsernames(),
  ]);

  const people = report.households.reduce((n, h) => n + h.members.length, 0);
  const seats = report.households.reduce((n, h) => n + h.seatLimit, 0);
  const active = report.households.filter((h) => h.activityMonth > 0).length;
  const { costMonth, revenueMonth, marginMonth, payingHouseholds } =
    report.totals;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          🛠️ Consola do operador
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          You run this deployment. Everything here is instance-wide — every
          family on the platform, what they cost and what they pay.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          tone="olive"
          label="Famílias"
          value={`${report.households.length}`}
          sub={
            active === report.households.length
              ? "todas ativas este mês"
              : `${active} ativas este mês`
          }
        />
        <Stat
          tone="azul"
          label="Pessoas"
          value={`${people}`}
          sub={`de ${seats} lugares pagos`}
        />
        <Stat
          tone="olive"
          label="A pagar"
          value={`${payingHouseholds}`}
          sub={
            payingHouseholds === report.households.length
              ? "toda a gente"
              : `${report.households.length - payingHouseholds} por converter`
          }
        />
        <Stat
          tone={marginMonth >= 0 ? "olive" : "terra"}
          label="Margem este mês"
          value={formatEur(marginMonth)}
          sub={`${formatEur(revenueMonth)} − ${formatEur(costMonth)} de IA`}
        />
      </section>

      {report.revenueIsEstimate ? (
        <p className="text-xs text-ink-faint">
          A receita é o preço de tabela do plano — ainda não há dados de
          pagamento reais ligados.
        </p>
      ) : null}

      <section>
        <h2 className="mb-1 text-lg font-semibold">🏠 As famílias</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Tap a family to manage its plan, seats and people.
        </p>
        {report.households.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Ainda não há famílias. Cria a primeira em{" "}
            <Link href="/admin/familias" className="underline underline-offset-2">
              Famílias
            </Link>{" "}
            — ou deixa-as registarem-se sozinhas em <code>/registar</code>.
          </p>
        ) : (
          <div className="card divide-y divide-sand/70">
            {report.households.map((h) => {
              const full = h.members.length >= h.seatLimit;
              return (
                <Link
                  key={h.accountId}
                  href="/admin/familias"
                  className="block px-4 py-3 transition-colors hover:bg-sage-pale/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{h.name}</span>
                    <span className="chip bg-cream text-ink-soft">{h.plan}</span>
                    <span
                      className={cn(
                        "chip",
                        full
                          ? "bg-terra-pale text-terra-dark"
                          : "bg-azul-pale text-azul"
                      )}
                    >
                      {h.members.length}/{h.seatLimit} lugares
                    </span>
                    <span className="ml-auto flex items-center gap-3 text-xs">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          h.marginMonth >= 0 ? "text-olive" : "text-terra-dark"
                        )}
                      >
                        {formatEur(h.marginMonth)}
                      </span>
                      <span className="text-ink-faint" aria-hidden>
                        ›
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                    <span>
                      {formatEur(h.revenueMonth)} receita ·{" "}
                      {formatEur(h.costMonth)} IA
                    </span>
                    <span className="ml-auto">
                      {h.activityMonth > 0
                        ? `${h.activityMonth} atividades este mês`
                        : "sem atividade este mês"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {orphans.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">⚠️ Contas sem família</h2>
          <div className="card p-4">
            <p className="text-sm text-ink-soft">
              {orphans.length}{" "}
              {orphans.length === 1 ? "conta não pertence" : "contas não pertencem"}{" "}
              a nenhuma família, por isso {orphans.length === 1 ? "não aparece" : "não aparecem"}{" "}
              em nenhum quadro nem contam para lugares:{" "}
              <span className="font-medium">{orphans.join(", ")}</span>.
            </p>
            <Link
              href="/admin/utilizadores"
              className="btn-ghost mt-3 inline-block"
            >
              Resolver em Contas →
            </Link>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">🗂️ Gerir</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Tile
            href="/admin/familias"
            title="🏠 Famílias"
            body="Create a family, set its plan and seats, move someone between families, or delete one outright."
          />
          <Tile
            href="/admin/utilizadores"
            title="👥 Contas"
            body="Every account on the instance: add and remove people, set passwords, change usernames and emails."
          />
          <Tile
            href="/admin/conteudo"
            title="📚 Conteúdo"
            body="Units, listening clips, stories and the phrasebook — publish, unpublish, and see what is still a draft."
          />
          <Tile
            href="/admin/relatorios"
            title="📊 Relatórios"
            body="Cost, revenue and margin per household — plus whether email is actually being delivered."
          />
          <Tile
            href="/admin/sistema"
            title="🔧 Sistema"
            body="Speech provider, what the AI spend went on, cached audio and how full the database is getting."
          />
          <Tile
            href="/gastos"
            title="💶 Gastos"
            body="The running AI bill, per person across every family."
            note={`${formatEur(costMonth)} este mês`}
          />
        </div>
      </section>
    </div>
  );
}

function Tile({
  href,
  title,
  body,
  note,
}: {
  href: string;
  title: string;
  body: string;
  note?: string;
}) {
  return (
    <Link href={href} className="card p-5 transition-colors hover:bg-sage-pale/40">
      <div className="font-display text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
      {note ? <p className="mt-2 text-xs text-ink-faint">{note}</p> : null}
    </Link>
  );
}
