/**
 * A Brazilianism detector for generated European Portuguese.
 *
 * The prompt tells the model to write pt-PT. Prompts are advice, not
 * guarantees: a model trained on far more Brazilian than European Portuguese
 * drifts, and it drifts most on the words a learner will actually repeat in a
 * shop. This catches the mechanical divergences deterministically, for free,
 * on every generation — no second model call, no opinion.
 *
 * Only HIGH-CONFIDENCE rules live here. "legal", "time" and "fato" are
 * deliberately absent: legal also means lawful, time is an English word that
 * appears in bilingual content, and "fato" is a perfectly good European word
 * for a suit — flagging them would train people to ignore the linter, which is
 * worse than not having one.
 */

export type Finding = {
  /** What the model wrote. */
  found: string;
  /** What a European speaker says instead. */
  expected: string;
  /** Why it matters, in one line. */
  note: string;
  severity: "high" | "medium";
};

type Rule = {
  re: RegExp;
  expected: string;
  note: string;
  severity: "high" | "medium";
};

/** Vocabulary a Portuguese person simply does not use. */
const LEXICAL: [string, string, string][] = [
  ["ônibus", "o autocarro", "Brazilian bus"],
  ["banheiro", "a casa de banho", "Brazilian bathroom"],
  ["geladeira", "o frigorífico", "Brazilian fridge"],
  ["celular", "o telemóvel", "Brazilian mobile phone"],
  ["trem", "o comboio", "Brazilian train"],
  ["sorvete", "o gelado", "Brazilian ice cream"],
  ["xícara", "a chávena", "Brazilian cup"],
  ["café da manhã", "o pequeno-almoço", "Brazilian breakfast"],
  ["esporte", "o desporto", "Brazilian sport"],
  ["esportes", "os desportos", "Brazilian sports"],
  ["planejar", "planear", "Brazilian spelling"],
  ["planejamento", "o planeamento", "Brazilian spelling"],
  ["registro", "o registo", "Brazilian spelling"],
  ["bonde", "o elétrico", "Brazilian tram"],
  ["carona", "a boleia", "Brazilian lift/ride"],
  ["bala", "o rebuçado", "Brazilian sweet"],
  ["grampeador", "o agrafador", "Brazilian stapler"],
  ["aeromoça", "a hospedeira", "Brazilian flight attendant"],
  ["açougue", "o talho", "Brazilian butcher"],
  ["favela", "o bairro social", "Brazilian, and rarely the right word here"],
  ["cadê", "onde está", "Brazilian colloquial"],
  ["bacana", "fixe", "Brazilian slang"],
  ["legal demais", "muito fixe", "Brazilian slang"],
  ["pegar o autocarro", "apanhar o autocarro", "Brazilian verb choice"],
  ["pegar o comboio", "apanhar o comboio", "Brazilian verb choice"],
  ["tomar café da manhã", "tomar o pequeno-almoço", "Brazilian breakfast"],
  ["time de futebol", "a equipa de futebol", "Brazilian team"],
  ["torcida", "os adeptos", "Brazilian supporters"],
  ["sanduíche", "a sandes", "Brazilian sandwich"],
  ["suco", "o sumo", "Brazilian juice"],
  ["mamãe", "a mãe", "Brazilian"],
  ["papai", "o pai", "Brazilian"],
  ["garçom", "o empregado de mesa", "Brazilian waiter"],
  ["fila do caixa", "a fila da caixa", "Brazilian gender"],
];

const RULES: Rule[] = [
  ...LEXICAL.map(([found, expected, note]) => ({
    // Word boundaries that also respect Portuguese accented letters.
    re: new RegExp(`(?<![a-zà-ÿ])${found.replace(/ /g, "\\s+")}(?![a-zà-ÿ])`, "gi"),
    expected,
    note,
    severity: "high" as const,
  })),
  {
    // The single most common drift: Brazilian uses the gerund where European
    // Portuguese uses "estar a + infinitive".
    re: /\b(est(?:ou|ás|á|amos|ão|ava|avas|áva(?:mos)?|eve|iver)\w*)\s+([a-zà-ÿ]+(?:ando|endo|indo))\b/gi,
    expected: "estar a + infinitivo (estou a falar)",
    note: "Brazilian gerund — European Portuguese says 'estou a falar', not 'estou falando'",
    severity: "high",
  },
  {
    // Proclisis in a plain affirmative main clause: "me diga" / "te digo".
    // European Portuguese attaches the pronoun: "diga-me", "digo-te".
    re: /(?:^|[.!?]\s+|\b(?:e|mas|que)\s+)(me|te|se|nos|lhe|lhes)\s+(diga|digo|dá|dê|fala|falo|chamo|chama|ajuda|ajudo|ver|vejo)\b/gi,
    expected: "pronome depois do verbo (diga-me, chamo-me)",
    note: "Brazilian pronoun placement — European Portuguese puts it after the verb in a plain statement",
    severity: "medium",
  },
  {
    // "você" as the everyday informal address. Real in European Portuguese but
    // formal/regional; this app teaches the tu register on purpose.
    re: /(?<![a-zà-ÿ])voc[êe]s?(?![a-zà-ÿ])/gi,
    expected: "tu / vocês only where genuinely plural",
    note: "This app teaches the tu register; você reads as Brazilian or oddly formal",
    severity: "medium",
  },
];

/** Every Brazilianism in a piece of text. */
export function lintPt(text: string): Finding[] {
  if (!text) return [];
  const out: Finding[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    for (const m of text.matchAll(rule.re)) {
      const found = m[0].replace(/\s+/g, " ").trim();
      const key = `${found.toLowerCase()}|${rule.expected}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        found,
        expected: rule.expected,
        note: rule.note,
        severity: rule.severity,
      });
    }
  }
  return out;
}

/** True when the text contains a high-severity Brazilianism. */
export function hasBrazilianism(text: string): boolean {
  return lintPt(text).some((f) => f.severity === "high");
}

/**
 * A correction instruction for a model that just drifted.
 *
 * Cheaper and more reliable than hoping a longer prompt prevents drift: let it
 * write, check deterministically, and only pay for a second call when the
 * check actually fails.
 */
export function correctionPrompt(findings: Finding[]): string {
  const lines = findings
    .map((f) => `- "${f.found}" is Brazilian. Use ${f.expected}. (${f.note})`)
    .join("\n");
  return `Your previous answer used Brazilian Portuguese. Rewrite it in EUROPEAN Portuguese, fixing exactly these:
${lines}

Change nothing else — keep the same content, structure, length and formatting. Only correct the Portuguese.`;
}
