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
      eur: priceFor("individual", 7.99),
      seats: 1,
      blurbPt: "Uma pessoa, tudo incluído — Sandra, jogos e revisão.",
    },
    {
      id: "family",
      namePt: "Família",
      eur: priceFor("family", 14.99),
      seats: 6,
      blurbPt: "Até seis pessoas em casa, cada uma com o seu caminho.",
    },
  ];
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
