import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getHouseholdReports } from "@/lib/actions/reports";
import { getEmailStatus } from "@/lib/actions/email";
import { formatEur } from "@/lib/usage";
import { TestEmailButton } from "@/components/test-email-button";

export const metadata = { title: "Relatórios" };

export default async function ReportsPage() {
  await requireAdmin();
  const [report, email] = await Promise.all([
    getHouseholdReports(),
    getEmailStatus(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-soft hover:text-olive">
          ← voltar ao painel
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          📊 Relatórios · Households
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          What each household costs to run, what it brings in, and whether the
          two are the right way round.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Custo este mês" value={formatEur(report.totals.costMonth)} />
        <Stat
          label="Receita este mês"
          value={formatEur(report.totals.revenueMonth)}
          hint={report.revenueIsEstimate ? "preço de tabela" : undefined}
        />
        <Stat
          label="Margem"
          value={formatEur(report.totals.marginMonth)}
          tone={report.totals.marginMonth < 0 ? "bad" : "good"}
        />
        <Stat
          label="A pagar"
          value={`${report.totals.payingHouseholds}/${report.households.length}`}
        />
      </section>

      {report.revenueIsEstimate && (
        <p className="rounded-lg bg-terra-pale px-3 py-2 text-xs text-terra-dark">
          Nenhuma subscrição tem ainda um id do Stripe, por isso a “receita” é o
          preço de tabela do plano, não dinheiro recebido. Assim que o Stripe
          estiver ligado, estes números passam a ser reais.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Por agregado</h2>
        {report.households.map((h) => (
          <article key={h.accountId} className="card p-5">
            <header className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-lg font-semibold">{h.name}</span>
              <span className="rounded-full bg-sand/60 px-2 py-0.5 text-xs text-ink-soft">
                {h.plan}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  h.subscription.status === "active" ||
                  h.subscription.status === "trialing"
                    ? "bg-sage-pale text-olive"
                    : "bg-sand/60 text-ink-soft"
                }`}
              >
                {h.subscription.status}
                {h.subscription.periodEnd ? ` · até ${h.subscription.periodEnd}` : ""}
              </span>
              <span
                className={`ml-auto text-xs ${
                  h.members.length > h.seatLimit
                    ? "font-medium text-terra-dark"
                    : "text-ink-faint"
                }`}
              >
                {h.members.length}/{h.seatLimit} lugares
                {h.members.length > h.seatLimit ? " · acima do plano" : ""}
              </span>
            </header>

            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <Mini label="Custo mês" value={formatEur(h.costMonth)} />
              <Mini label="Receita mês" value={formatEur(h.revenueMonth)} />
              <Mini
                label="Margem"
                value={formatEur(h.marginMonth)}
                tone={h.marginMonth < 0 ? "bad" : "good"}
              />
              <Mini label="Atividades" value={String(h.activityMonth)} />
            </div>

            {h.costByKind.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-ink-faint">Onde foi o dinheiro</p>
                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                  {h.costByKind.map((k) => (
                    <li key={k.kind}>
                      {k.kind} · <strong>{formatEur(k.eur)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 text-xs text-ink-faint">
              {h.members
                .map((m) => `${m.displayName}${m.role === "owner" ? " (dono)" : ""}`)
                .join(" · ")}
            </p>
          </article>
        ))}

        {report.unassigned.length > 0 && (
          <p className="text-xs text-ink-faint">
            Sem agregado: {report.unassigned.join(", ")} — corre{" "}
            <code>npm run db:backfill</code> para os adotar.
          </p>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">✉️ Email</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {email.configured
            ? `A enviar como ${email.from}.`
            : "Não configurado — falta RESEND_API_KEY e EMAIL_FROM nas variáveis de ambiente."}
        </p>

        <div className="mt-3">
          <TestEmailButton configured={email.configured} />
        </div>

        {email.recent.length > 0 && (
          <table className="mt-4 w-full text-xs">
            <thead className="text-ink-faint">
              <tr>
                <th className="text-left font-normal">quando</th>
                <th className="text-left font-normal">tipo</th>
                <th className="text-left font-normal">para</th>
                <th className="text-left font-normal">estado</th>
              </tr>
            </thead>
            <tbody>
              {email.recent.map((r, i) => (
                <tr key={i} className="border-t border-sand/70">
                  <td className="py-1 text-ink-faint">{r.at}</td>
                  <td>{r.kind}</td>
                  <td>{r.recipient}</td>
                  <td className={r.ok ? "text-olive" : "text-terra"}>
                    {r.ok ? "enviado" : (r.error ?? "falhou")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p
        className={`mt-1 font-display text-xl font-semibold ${
          tone === "bad" ? "text-terra" : tone === "good" ? "text-olive" : ""
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p
        className={`font-medium ${
          tone === "bad" ? "text-terra" : tone === "good" ? "text-olive" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
