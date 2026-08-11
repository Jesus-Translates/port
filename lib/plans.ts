/**
 * What a household pays, and what it gets.
 *
 * Shared so the family's own billing screen and the operator's revenue report
 * can never quote different numbers for the same plan — which is exactly the
 * kind of drift a customer notices and nobody else does.
 */

export type PlanId = "individual" | "family";

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

/** Nobody needs sixty seats, and an unbounded number is an unbounded bill. */
export const MAX_SEATS = 12;

/** EUR per month for each seat beyond the plan's included ones. */
export function extraSeatEur(): number {
  const n = Number(process.env.PLAN_PRICE_EXTRA_SEAT);
  return Number.isFinite(n) && n >= 0 ? n : 5;
}

export function plans(): Plan[] {
  return [
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

/**
 * Days of no-questions money back after signing up.
 *
 * Not a free trial. Payment is taken up front and the subscription starts
 * immediately — this is the window in which "I do not like it" is a full
 * refund. A card entered on day one converts far better than a card asked for
 * on day eight, and a guarantee carries the risk that a trial wall creates.
 */
export function guaranteeDays(): number {
  const n = Number(process.env.GUARANTEE_DAYS);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 5;
}

/**
 * There is no free plan.
 *
 * It was removed once the margin guard existed: a free household still costs
 * real money in AI spend, against revenue of exactly zero, and no share of
 * nothing produces a margin. The money-back guarantee does the job a free tier
 * was doing — letting someone find out whether the app is for them without
 * risking anything — and does it without an unfunded cost centre.
 *
 * An unrecognised plan name falls back to Família rather than to something
 * cheap, so a bad value can never quietly hand out the largest allowance for
 * the smallest price.
 */
export function planById(id: string): Plan {
  const all = plans();
  return all.find((p) => p.id === id) ?? all.find((p) => p.id === "family") ?? all[0];
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
