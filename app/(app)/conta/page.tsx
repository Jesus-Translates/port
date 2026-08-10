import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { getBilling } from "@/lib/actions/billing";
import { formatPlanPrice, plans, STATUS_PT } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const metadata = { title: "Plano" };

/**
 * The family's plan — what they pay for and what it includes.
 *
 * Deliberately contains NO AI cost figures. Those are an operator's numbers,
 * and showing a customer that a chat with Sandra cost four cents invites one
 * thought — "am I being metered?" — when the answer is a flat monthly price.
 * /gastos keeps the running costs and is operator-only.
 */
export default async function ContaPage() {
  const billing = await getBilling();

  if (!billing) {
    return (
      <div className="space-y-6">
        <AzulejoHeader title="Plano" subtitle="A tua subscrição" />
        <p className="card p-6 text-center text-sm text-ink-soft">
          A tua conta ainda não pertence a uma família.
        </p>
      </div>
    );
  }

  const status = STATUS_PT[billing.status] ?? STATUS_PT.none;
  const full = billing.seatsUsed >= billing.seatLimit;

  return (
    <div className="space-y-6">
      <AzulejoHeader
        eyebrow={billing.householdName}
        title="O vosso plano"
        subtitle={`${billing.plan.namePt} · ${formatPlanPrice(billing.plan.eur)}${
          billing.plan.eur > 0 ? " por mês" : ""
        }`}
      />

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-2xl font-semibold">
            {billing.plan.namePt}
          </span>
          <span
            className={cn(
              "chip",
              status.tone === "ok"
                ? "bg-sage-pale text-olive"
                : status.tone === "warn"
                  ? "bg-terra-pale text-terra-dark"
                  : "bg-cream text-ink-soft"
            )}
          >
            {status.label}
          </span>
        </div>
        <p className="text-sm text-ink-soft">{billing.plan.blurbPt}</p>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink-soft">Pessoas</span>
            <span className={cn("font-medium", full && "text-terra-dark")}>
              {billing.seatsUsed} de {billing.seatLimit}
              {full ? " · sem lugares livres" : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream">
            <div
              className={cn(
                "h-2 rounded-full transition-[width]",
                full ? "bg-terra" : "bg-olive"
              )}
              style={{
                width: `${Math.min(100, (billing.seatsUsed / Math.max(1, billing.seatLimit)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {billing.cancelsOn ? (
          <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
            Termina a {billing.cancelsOn}. Até lá está tudo a funcionar.
          </p>
        ) : billing.renewsOn ? (
          <p className="text-sm text-ink-soft">
            Renova a <strong>{billing.renewsOn}</strong>.
          </p>
        ) : null}
      </section>

      {/* Every plan, so the family can see what changing would mean. No
          checkout yet — the honest thing is to say so rather than render a
          button that does nothing. */}
      <section className="space-y-2">
        <p className="label">Os planos</p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {plans().map((p) => {
            const current = p.id === billing.plan.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "card p-4",
                  current && "border-olive bg-sage-pale/40"
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-[17px] font-semibold">
                    {p.namePt}
                  </span>
                  {current ? (
                    <span className="chip bg-olive text-paper">atual</span>
                  ) : null}
                </div>
                <p className="mt-1 font-display text-xl font-semibold text-olive">
                  {formatPlanPrice(p.eur)}
                  {p.eur > 0 ? (
                    <span className="text-xs font-normal text-ink-faint">
                      {" "}
                      /mês
                    </span>
                  ) : null}
                </p>
                <p className="mt-1.5 text-xs text-ink-soft">{p.blurbPt}</p>
                <p className="mt-1 text-2xs text-ink-faint">
                  {p.seats === 1 ? "1 pessoa" : `até ${p.seats} pessoas`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-ink-faint">
        {billing.canManage
          ? "Para mudar de plano ou cancelar, fala connosco — o pagamento automático ainda está a ser ligado."
          : "Só um adulto da família pode mudar o plano."}{" "}
        <Link href="/familia" className="underline underline-offset-2 hover:text-olive">
          Ver a família
        </Link>
      </p>
    </div>
  );
}
