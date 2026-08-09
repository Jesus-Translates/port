import type { ItemKind } from "@/lib/course";

/**
 * What the learner told us about how they want to learn, and what each answer
 * actually changes.
 *
 * Every question here earns its place by moving a lever. Questions about
 * "learning styles" — visual, auditory, kinaesthetic — are deliberately absent:
 * the theory does not survive testing, and an answer that changes nothing is
 * worse than no question, because it teaches the learner that the setup was
 * theatre. The one adjacent question we DO keep is about speaking aloud, which
 * is not a style but a behaviour: someone who will not talk to their phone yet
 * needs a different first unit, and we can act on that.
 */

/** Q1 — minutes per day. Sets how much counts as a finished day. */
export type Minutes = "5" | "15" | "30";
/** Q2 — what they most need. Picks the path. */
export type Need = "falar" | "perceber" | "ler-escrever" | "tudo";
/** Q3 — speaking aloud to the app. Gates when conversation appears. */
export type Voice = "avontade" | "nervoso" | "escrever";
/** Q4 — appetite for games. Weights how many appear in a unit. */
export type Games = "adoro" | "asvezes" | "poucos";
/** Q5 — guided or self-directed. Mirrors users.mode. */
export type Guidance = "guia" | "escolho";

export type Prefs = {
  minutes: Minutes;
  need: Need;
  voice: Voice;
  games: Games;
  guidance: Guidance;
};

export const DEFAULT_PREFS: Prefs = {
  minutes: "15",
  need: "tudo",
  voice: "nervoso",
  games: "asvezes",
  guidance: "guia",
};

export type Question = {
  id: keyof Prefs;
  pt: string;
  en: string;
  options: { value: string; pt: string; en: string }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "minutes",
    pt: "Quanto tempo tens por dia?",
    en: "We'll call a day done when you've hit this — no endless nagging.",
    options: [
      { value: "5", pt: "5 minutos", en: "one thing, most days" },
      { value: "15", pt: "15 minutos", en: "a proper session" },
      { value: "30", pt: "30 minutos", en: "I want to move fast" },
    ],
  },
  {
    id: "need",
    pt: "O que te faz mais falta agora?",
    en: "This decides the order activities come in.",
    options: [
      { value: "falar", pt: "Falar na rua", en: "ordering, asking, replying" },
      {
        value: "perceber",
        pt: "Perceber o que dizem",
        en: "they speak too fast for me",
      },
      { value: "ler-escrever", pt: "Ler e escrever", en: "forms, signs, messages" },
      { value: "tudo", pt: "Um pouco de tudo", en: "a balanced mix" },
    ],
  },
  {
    id: "voice",
    pt: "Falar em voz alta para a app — como te sentes?",
    en: "Nobody hears this but Sandra. It only changes when speaking shows up.",
    options: [
      { value: "avontade", pt: "À vontade", en: "let me talk from day one" },
      {
        value: "nervoso",
        pt: "Um bocadinho nervoso(a)",
        en: "ease me in — reading aloud first",
      },
      {
        value: "escrever",
        pt: "Prefiro começar por escrever",
        en: "writing first, speaking later",
      },
    ],
  },
  {
    id: "games",
    pt: "Jogos?",
    en: "How much of your practice should be games.",
    options: [
      { value: "adoro", pt: "Adoro", en: "two per unit" },
      { value: "asvezes", pt: "De vez em quando", en: "one per unit" },
      { value: "poucos", pt: "Poucos", en: "mostly the serious stuff" },
    ],
  },
  {
    id: "guidance",
    pt: "Preferes que a app te guie, ou escolher tu?",
    en: "Change this whenever you like.",
    options: [
      { value: "guia", pt: "Diz-me o que fazer", en: "one clear next step" },
      { value: "escolho", pt: "Deixa-me escolher", en: "show me the shortcuts too" },
    ],
  },
];

export type LearningPath = {
  id: string;
  namePt: string;
  blurbEn: string;
  /** The order activity kinds should appear in a unit. */
  order: ItemKind[];
};

/**
 * Named paths. Each is an ORDER over the activity kinds a unit already
 * generates — not a different curriculum. That matters: it means a path can
 * change at any time without regenerating 126 units.
 */
export const PATHS: Record<string, LearningPath> = {
  falante: {
    id: "falante",
    namePt: "Falante",
    blurbEn: "Speaking first — say it out loud early and often.",
    order: ["vocab", "jogo-pares", "quiz", "falar", "conversa"],
  },
  ouvido: {
    id: "ouvido",
    namePt: "Bom ouvido",
    blurbEn: "Listening first — tune your ear before your tongue.",
    order: ["escutar", "cloze", "ditado", "jogo-frase", "falar"],
  },
  calma: {
    id: "calma",
    namePt: "Com calma",
    blurbEn: "Gentle build — recognition and writing before any microphone.",
    order: ["vocab", "jogo-pares", "cloze", "quiz", "homework", "falar"],
  },
  jogador: {
    id: "jogador",
    namePt: "Jogador",
    blurbEn: "Games-heavy — learn it by playing with it.",
    order: ["vocab", "jogo-pares", "jogo-genero", "jogo-frase", "verbos", "conversa"],
  },
  equilibrado: {
    id: "equilibrado",
    namePt: "Equilibrado",
    blurbEn: "A balanced mix of everything.",
    order: ["vocab", "quiz", "jogo-pares", "ditado", "escutar", "falar", "conversa"],
  },
};

/**
 * Which path the answers add up to.
 *
 * Speaking anxiety wins over everything else: putting a nervous learner into a
 * conversation on unit one is how you lose them, and no amount of "but they
 * said they want to speak" is worth that. Otherwise the need answer decides,
 * and a big appetite for games overrides a balanced default.
 */
export function pathFor(prefs: Prefs): LearningPath {
  if (prefs.voice === "escrever" || prefs.voice === "nervoso") {
    // Someone who wants games and is shy still gets games — just not a mic.
    if (prefs.games === "adoro") return PATHS.jogador;
    return PATHS.calma;
  }
  if (prefs.need === "falar") return PATHS.falante;
  if (prefs.need === "perceber") return PATHS.ouvido;
  if (prefs.games === "adoro") return PATHS.jogador;
  return PATHS.equilibrado;
}

/** How many finished activities make a day complete. */
export function dailyGoal(prefs: Prefs): number {
  return prefs.minutes === "5" ? 1 : prefs.minutes === "30" ? 5 : 3;
}

/** How many games belong in one unit's path. */
export function gameQuota(prefs: Prefs): number {
  return prefs.games === "adoro" ? 2 : prefs.games === "poucos" ? 0 : 1;
}

/**
 * Reorder one unit's activities to suit the learner.
 *
 * Unit items are SHARED content — the same rows serve everybody — so the path
 * cannot be baked in at generation time without giving each learner their own
 * copy of 126 units. Reordering at render gets the same effect for free, and
 * it means changing your answers reshapes every unit instantly, including the
 * ones you already started.
 *
 * Nothing is ever removed. Someone who says "poucos jogos" still has the games
 * available, they just stop being the next thing put in front of them.
 */
export function sortByPath<T extends { kind: string }>(
  items: T[],
  prefs: Prefs | null
): T[] {
  if (!prefs) return items;
  const order = pathFor(prefs).order;
  const quota = gameQuota(prefs);

  const rank = (item: T, index: number): number => {
    const i = order.indexOf(item.kind as ItemKind);
    // Kinds this path has no opinion about keep their original position,
    // after everything the path DOES name.
    const base = i === -1 ? order.length + index : i;
    const isGame = item.kind.startsWith("jogo-");
    if (isGame && quota === 0) return base + 100; // last, not gone
    if (isGame && quota === 2) return base - 0.5; // a nudge earlier
    return base;
  };

  return items
    .map((item, index) => ({ item, index, r: rank(item, index) }))
    .sort((a, b) => a.r - b.r || a.index - b.index)
    .map((x) => x.item);
}

/** Narrow unknown jsonb into a Prefs, filling anything missing. */
export function readPrefs(raw: unknown): Prefs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pick = <T extends string>(
    value: unknown,
    allowed: readonly T[],
    fallback: T
  ): T => (allowed.includes(value as T) ? (value as T) : fallback);

  // An empty object is "not answered", not "answered with defaults".
  if (!r.minutes && !r.need && !r.voice) return null;

  return {
    minutes: pick(r.minutes, ["5", "15", "30"] as const, "15"),
    need: pick(r.need, ["falar", "perceber", "ler-escrever", "tudo"] as const, "tudo"),
    voice: pick(r.voice, ["avontade", "nervoso", "escrever"] as const, "nervoso"),
    games: pick(r.games, ["adoro", "asvezes", "poucos"] as const, "asvezes"),
    guidance: pick(r.guidance, ["guia", "escolho"] as const, "guia"),
  };
}
