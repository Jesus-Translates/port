/**
 * What a household pays, and what it gets.
 *
 * Shared so the family's own billing screen and the operator's revenue report
 * can never quote different numbers for the same plan — which is exactly the
 * kind of drift a customer notices and nobody else does.
 */

export type PlanId = "free" | "individual" | "family";

export type Plan = {
  id: PlanId;
  namePt: string;
  /** Monthly list price in EUR. */
  eur: number;
  seats: number;
  blurbPt: string;
};

/** Env override per plan, e.g. PLAN_PRICE_FAMILY=12.99. */
function priceFor(id: PlanId, fallback: number): number {
  const raw = process.env[`PLAN_PRICE_${id.toUpperCase()}`];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** EUR per month for each seat beyond the plan's included ones. */
export function extraSeatEur(): number {
  const n = Number(process.env.PLAN_PRICE_EXTRA_SEAT);
  return Number.isFinite(n) && n >= 0 ? n : 5;
}

export function plans(): Plan[] {
  return [
    {
      id: "free",
      namePt: "Grátis",
      eur: priceFor("free", 0),
      seats: 1,
      blurbPt: "Uma pessoa, o essencial. Sem cartão.",
    },
    {
      id: "individual",
      namePt: "Individual",
      eur: priceFor("individual", 10),
      seats: 1,
      blurbPt: "Uma pessoa, tudo incluído — Sandra, jogos e revisão.",
    },
    {
      id: "family",
      namePt: "Família",
      eur: priceFor("family", 25),
      seats: 5,
      blurbPt: "Até cinco pessoas em casa, cada uma com o seu caminho.",
    },
  ];
}

/**
 * What a household actually invoices per month: the plan, plus every seat
 * beyond the ones it includes.
 *
 * Seats are the only thing that scales cost — one plan price against an
 * unbounded number of learners is a promise to lose money on the largest
 * families, which are exactly the ones the family plan attracts.
 */
export function grossMonthlyEur(planId: string, seatLimit: number): number {
  const plan = planById(planId);
  const extra = Math.max(0, Math.round(seatLimit) - plan.seats);
  return plan.eur + extra * (plan.eur > 0 ? extraSeatEur() : 0);
}

export function planById(id: string): Plan {
  return plans().find((p) => p.id === id) ?? plans()[0];
}

/** Portuguese money, the way Portugal writes it: 14,99 €. */
export function formatPlanPrice(eur: number): string {
  return eur === 0
    ? "Grátis"
    : new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
      }).format(eur);
}

/** What a subscription status means to the person paying. */
export const STATUS_PT: Record<string, { label: string; tone: "ok" | "warn" | "off" }> = {
  active: { label: "Ativa", tone: "ok" },
  trialing: { label: "Período de experiência", tone: "ok" },
  past_due: { label: "Pagamento em atraso", tone: "warn" },
  incomplete: { label: "Por concluir", tone: "warn" },
  canceled: { label: "Cancelada", tone: "off" },
  none: { label: "Sem subscrição", tone: "off" },
};
