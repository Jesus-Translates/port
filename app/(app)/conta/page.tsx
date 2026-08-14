import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { GuaranteeCard } from "@/components/guarantee-card";
import { SeatPicker } from "@/components/seat-picker";
import { UsageMeter } from "@/components/usage-meter";
import { SeatAddons } from "@/components/seat-addons";
import { listSeatAddons } from "@/lib/actions/billing";
import { isOperator, requireSession } from "@/lib/auth";
import { getBilling } from "@/lib/actions/billing";
import {
  annualEur,
  annualMonths,
  annualSavingEur,
  extraSeatEur,
  formatPlanPrice,
  MAX_SEATS,
  plans,
  proTiers,
  STATUS_PT,
} from "@/lib/plans";
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

  return (
    <div className="space-y-6">
      <AzulejoHeader
        eyebrow={billing.householdName}
        title="O vosso plano"
        // The real invoice, not the list price: a family of seven paying 35 €
        // should not read "25 € por mês" at the top of their own billing page.
        subtitle={`${billing.plan.namePt} · ${formatPlanPrice(billing.monthlyEur)} por mês`}
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

        <SeatPicker
          seatLimit={billing.seatLimit}
          seatsUsed={billing.seatsUsed}
          includedSeats={billing.plan.seats}
          planEur={billing.plan.eur}
          extraSeatEur={extraSeatEur()}
          maxSeats={MAX_SEATS}
          canManage={billing.canManage}
        />

        {/* Their real invoice annualised, not the list price — a family of
            seven should see what THEIR year costs. Stated, not sold: there is
            no checkout yet, so this is a number to weigh, not a button. */}
        {annualMonths() < 12 && billing.monthlyEur > 0 ? (
          <p className="rounded-xl bg-sage-pale/40 px-3 py-2 text-sm text-ink-soft">
            A pagar por ano:{" "}
            <strong>{formatPlanPrice(annualEur(billing.monthlyEur))}</strong> —
            poupam {formatPlanPrice(annualSavingEur(billing.monthlyEur))}, que
            é um mês grátis.
          </p>
        ) : null}

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

      {billing.guarantee ? (
        <GuaranteeCard
          daysLeft={billing.guarantee.daysLeft}
          endsOn={billing.guarantee.endsOn}
          requested={billing.refundRequested}
          canManage={billing.canManage}
        />
      ) : null}

      <UsageMeter />

      {/* Per-seat, so the family can put one adult on Pro and leave the
          children on base — which is the only reason 19 € is affordable. */}
      <SeatAddons
        seats={await listSeatAddons()}
        tiers={proTiers().map((t) => ({
          ...t,
          priceLabel: formatPlanPrice(t.eur),
        }))}
        canManage={billing.canManage}
        isOperator={await isOperator((await requireSession()).username)}
      />

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
                  {p.eur > 0 && p.seats > 1
                    ? ` · +${formatPlanPrice(extraSeatEur())} por pessoa extra`
                    : ""}
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
