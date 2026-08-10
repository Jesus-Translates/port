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
  // Confirmed by native review of this app's own content, 2026-08-10.
  ["para viagem", "para levar", "Brazilian takeaway phrase — Portugal says 'para levar'"],
];

/**
 * Clitic placement after a proclisis trigger.
 *
 * Native review found a quiz item whose only accepted answer was "porque
 * estraga-se". "Porque", negatives, question words and a handful of adverbs
 * all pull the pronoun BEFORE the verb in European Portuguese, and the app was
 * teaching the opposite as correct — in a grammar drill, which is the worst
 * possible place to be wrong.
 */
const PROCLISIS_TRIGGERS =
  "porque|porqu\u00ea|que|quem|quando|onde|como|n\u00e3o|nunca|j\u00e1|tamb\u00e9m|s\u00f3|talvez|quem|se";

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
    // After a trigger the pronoun must PRECEDE the verb: "porque se estraga",
    // never "porque estraga-se".
    re: new RegExp(
      `\\b(?:${PROCLISIS_TRIGGERS})\\s+[a-zà-ÿ]+(?:a|e|i|ou|ei)\\-(me|te|se|nos|lhe|lhes)\\b`,
      "gi"
    ),
    expected: "pronome ANTES do verbo depois de porque/não/que/já (porque se estraga)",
    note: "European Portuguese moves the clitic before the verb after these triggers",
    severity: "high",
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

/**
 * Lines that are TEACHING the Brazilian form, not using it.
 *
 * A learning app says "No Brasil: geladeira · Em Portugal: frigorífico" on
 * purpose, and the first version of this linter flagged those lessons as
 * errors — it marked the curriculum wrong for doing its job. A checker that
 * cries wolf on correct content is worse than no checker, so any line that
 * names Brazil, or contrasts the two varieties, is exempt.
 */
const TEACHING_CONTRAST =
  new RegExp(
    [
      // Portuguese markers
      "\\bno brasil\\b", "\\bbrasileir[oa]s?\\b", "\\bbrasil\\b", "em portugal\\b",
      "\\bpt-?br\\b", "\\berrado\\b", "\\bevita[rs]?\\b", "\\bnão dig[ao]s?\\b",
      // English markers. The notes EXPLAIN in English by design, so a contrast
      // reads "not the Brazilian word ônibus" — no Portuguese marker in sight.
      // Missing these put three units in an infinite loop: the generator wrote
      // a correct teaching contrast, the linter called it a Brazilianism, the
      // endpoint rewrote it, and round it went, paying for a model call each
      // time.
      "\\bbrazilian\\b", "\\bin portugal\\b", "\\bnot the\\b", "\\binstead of\\b",
      "\\brather than\\b", "\\bavoid\\b", "\\bnever say\\b", "\\bwrong\\b",
      "\\bincorrect\\b", "\\bmay try to\\b", "\\bmay copy\\b",
      "✗", "❌",
    ].join("|"),
    "i"
  );

/** Every Brazilianism in a piece of text. */
export function lintPt(text: string): Finding[] {
  if (!text) return [];
  const out: Finding[] = [];
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/);

  /** Which line a match falls on, so context can excuse it. */
  const lineAt = (index: number): string => {
    let seenChars = 0;
    for (const line of lines) {
      seenChars += line.length + 1;
      if (index < seenChars) return line;
    }
    return "";
  };

  for (const rule of RULES) {
    for (const m of text.matchAll(rule.re)) {
      if (m.index !== undefined && TEACHING_CONTRAST.test(lineAt(m.index))) continue;
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
