/**
 * What we keep after the placement test, and the plan built from it.
 *
 * The gaps outlive the screen that found them. The questionnaire runs
 * immediately afterwards and is the thing that turns "you keep missing the
 * pretérito perfeito" into "do these four things, in this order" — it needs
 * the weaknesses, and it needs them after a page navigation.
 *
 * Stored on users.placement as jsonb rather than in its own table: it is one
 * small document per learner, read whole and written whole, and it changes
 * shape as the questions do.
 */

export type PlacementGap = { topicEn: string; whyEn: string };

export type PlacementSummary = {
  level: string;
  headlineEn: string;
  canDoEn: string[];
  gaps: PlacementGap[];
  focusEn: string;
  encouragementPt: string;
  /** ISO date the test was taken. */
  at: string;
};

/** One step of the plan, pointing at somewhere real in the app. */
export type PlanStep = {
  titlePt: string;
  whyEn: string;
  /** Matches the app's own action kinds so the card can link straight in. */
  kind: "unidade" | "verbos" | "ditado" | "conversa" | "jogos" | "reference" | "quiz";
  param: string;
};

export type LearningPlan = {
  introEn: string;
  steps: PlanStep[];
  at: string;
};

export type PlacementRecord = {
  summary?: PlacementSummary;
  plan?: LearningPlan;
  /**
   * When a plan was FIRST built, as an ISO date. Never cleared, even when the
   * plan itself is.
   *
   * It is the marker for "this learner has had their free onboarding plan".
   * The plan is deliberately cleared when the questionnaire is answered so it
   * rebuilds with real preferences — and without a separate marker, clearing
   * it would also reopen the unmetered budget bypass that first-plan
   * generation is allowed to use. See app/api/ai/plan/route.ts.
   */
  planAt?: string;
};

const KINDS: PlanStep["kind"][] = [
  "unidade",
  "verbos",
  "ditado",
  "conversa",
  "jogos",
  "reference",
  "quiz",
];

/** Where a plan step actually sends the learner. */
export function planHref(step: PlanStep): string {
  const p = encodeURIComponent(step.param || "");
  switch (step.kind) {
    case "unidade":
      return step.param ? `/unidades/${p}` : "/unidades";
    case "verbos":
      return step.param ? `/verbos?tab=treinar&tempo=${p}` : "/verbos?tab=treinar";
    case "ditado":
      return step.param ? `/practice/ditado?tema=${p}` : "/practice/ditado";
    case "conversa":
      return step.param ? `/practice/conversa?tema=${p}` : "/practice/conversa";
    case "jogos":
      return "/jogos";
    case "reference":
      return step.param ? `/reference/${p}` : "/reference";
    case "quiz":
      return "/practice";
  }
}

/** Never trust jsonb read back from the database, or a model's `kind`. */
export function readPlacement(raw: unknown): PlacementRecord {
  if (typeof raw !== "object" || raw === null) return {};
  const r = raw as Record<string, unknown>;
  const out: PlacementRecord = {};

  const s = r.summary as Record<string, unknown> | undefined;
  if (s && typeof s.level === "string") {
    out.summary = {
      level: s.level,
      headlineEn: String(s.headlineEn ?? ""),
      canDoEn: Array.isArray(s.canDoEn) ? s.canDoEn.map(String).slice(0, 3) : [],
      gaps: Array.isArray(s.gaps)
        ? s.gaps
            .slice(0, 4)
            .map((g) => {
              const gg = (g ?? {}) as Record<string, unknown>;
              return {
                topicEn: String(gg.topicEn ?? ""),
                whyEn: String(gg.whyEn ?? ""),
              };
            })
            .filter((g) => g.topicEn)
        : [],
      focusEn: String(s.focusEn ?? ""),
      encouragementPt: String(s.encouragementPt ?? ""),
      at: String(s.at ?? ""),
    };
  }

  const p = r.plan as Record<string, unknown> | undefined;
  if (p && Array.isArray(p.steps)) {
    out.plan = {
      introEn: String(p.introEn ?? ""),
      at: String(p.at ?? ""),
      steps: p.steps
        .slice(0, 6)
        .map((v) => {
          const st = (v ?? {}) as Record<string, unknown>;
          const kind = String(st.kind ?? "");
          return {
            titlePt: String(st.titlePt ?? ""),
            whyEn: String(st.whyEn ?? ""),
            kind: (KINDS.includes(kind as PlanStep["kind"])
              ? kind
              : "unidade") as PlanStep["kind"],
            param: String(st.param ?? "").slice(0, 120),
          };
        })
        .filter((st) => st.titlePt),
    };
  }
  return out;
}
