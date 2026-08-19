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
      eur: priceFor("family", 20),
      seats: 4,
      blurbPt: "Até quatro pessoas em casa, cada uma com o seu caminho.",
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
 * Pay for a year, get a month.
 *
 * Eleven months for twelve. Modest as discounts go — the point is not to buy
 * the year cheaply, it is to be holding it when somebody passes their CIPLE
 * exam in month four and stops feeling urgent. Post-exam churn is the
 * predictable risk in this niche, and an annual term is the only hedge that
 * does not require the product to be better.
 *
 * THE MARGIN FLOOR IS 35% ON ANNUAL, NOT 40%, AND THAT IS ACCEPTED.
 *
 * You collect eleven months of revenue and they may consume twelve months of
 * allowance, so the guarantee in lib/budget.ts costShare() — 40% against
 * MONTHLY revenue — lands five points lower across a year. Deliberate: a
 * subscriber who prepays a year is worth more than five points, and the whole
 * reason for the discount is to still be holding them in month four. Do not
 * "fix" this by shrinking the annual allowance; it was priced knowing.
 */
export function annualMonths(): number {
  const n = Number(process.env.PLAN_ANNUAL_MONTHS);
  return Number.isFinite(n) && n > 0 && n <= 12 ? n : 11;
}

/** What a year costs up front, for any monthly figure. */
export function annualEur(monthlyEur: number): number {
  return monthlyEur * annualMonths();
}

/** What paying annually saves, in EUR per year. */
export function annualSavingEur(monthlyEur: number): number {
  return monthlyEur * (12 - annualMonths());
}

export type BillingInterval = "month" | "year";

/**
 * The AI add-ons, bought per SEAT and priced to cover the extra they buy.
 *
 * A seat's base allowance is its share of the household's monthly ceiling.
 * These multiply it — and they multiply the household ceiling by the same
 * capacity, because selling somebody credits the month cap then refuses is
 * worse than not selling them.
 *
 * Two tiers on purpose. Most people who hit the wall need a bit more, not five
 * times more: "boost" is the price of another seat and doubles the thing they
 * already like. "pro" is for the month somebody is cramming for CIPLE, where
 * the comparison that matters is a TUTOR HOUR, not the 5 EUR seat.
 *
 * That tutor hour is now a measured number rather than a guess. Preply's
 * Portugal-based European Portuguese tutors were 22-39 EUR per 50-minute
 * lesson, on a minimum of 4 lessons per 28-day cycle — roughly 88-156 EUR a
 * month for ONE learner (preply.com/en/online/portuguese-tutors, retrieved
 * 2026-08-19; their dedicated CIPLE page averaged $31/hour, $36 in Portugal).
 * This comment used to say "~19 EUR", which understated it by half and made
 * our own case weaker than the evidence supports. Neither Preply nor italki
 * sells a family or multi-seat plan at all — that is checked, not assumed.
 *
 * Both are priced so the incremental AI spend still clears the margin floor;
 * see lib/budget.ts costShare(). Changing a price here without redoing that
 * arithmetic is how a margin quietly disappears.
 */
export type ProTierId = "boost" | "pro";

export type ProTier = {
  id: ProTierId;
  namePt: string;
  /** EUR per month, per seat, on top of the seat's own price. */
  eur: number;
  /** What it multiplies the seat's allowance by. */
  multiplier: number;
  blurbPt: string;
};

export function proTiers(): ProTier[] {
  return [
    {
      id: "boost",
      namePt: "Boost",
      eur: priceForAddon("BOOST", 5),
      multiplier: 2,
      blurbPt: "O dobro das conversas com a Sandra. Para quem fala todos os dias.",
    },
    {
      id: "pro",
      namePt: "Pro",
      // 20, not 19. Five times a seat's allowance is 9,43 € of extra AI, and
      // clearing the 40% floor needs 19,32 € gross — so 19 lands at 39% and
      // quietly breaks the guarantee the whole guard exists to make. 20 is
      // also the flat number, which is the house style for prices anyway.
      eur: priceForAddon("PRO", 20),
      multiplier: 5,
      blurbPt: "Cinco vezes mais. Para o mês antes do exame.",
    },
  ];
}

export function proTierById(id: string | null | undefined): ProTier | null {
  if (!id) return null;
  return proTiers().find((t) => t.id === id) ?? null;
}

/** The multiplier a seat is entitled to right now. 1 when it has no add-on. */
export function multiplierFor(
  tierId: string | null | undefined,
  until: Date | string | null | undefined
): number {
  if (!until) return 1;
  if (new Date(until).getTime() <= Date.now()) return 1;
  return proTierById(tierId)?.multiplier ?? 1;
}

function priceForAddon(key: string, fallback: number): number {
  const n = Number(process.env[`PLAN_PRICE_ADDON_${key}`]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
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
