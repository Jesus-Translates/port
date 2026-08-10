/**
 * Is this line English or Portuguese?
 *
 * Listen & Speak assumed every card's front was English and handed it to an
 * American voice. That holds for phrasebook cards, and it is wrong for every
 * mistake card — those are made from what the learner actually got wrong, so
 * their fronts say things like "Diz melhor: «As ondas é muito grandes»". The
 * result was an American voice teaching Portuguese pronunciation, which is
 * worse than no audio at all.
 *
 * Deliberately a heuristic, not a language-detection dependency: these are one
 * or two sentences of known-vocabulary text, and the two languages are easy to
 * separate on diacritics and function words alone.
 */

/** Characters that essentially never appear in English. */
const PT_CHARS = /[ãõâêôáàéíóúç]/gi;

/** High-frequency Portuguese words with no English collision. */
const PT_WORDS =
  /\b(não|você|voce|está|estás|estão|é|são|com|para|uma|dos|das|pelo|pela|muito|muita|quando|onde|porque|também|já|aqui|ali|meu|minha|teu|tua|seu|sua|nós|eles|elas|isto|isso|aquilo|fazer|dizer|quero|queres|tens|tenho|vamos|obrigado|obrigada|faz|favor|bom|boa|dia|noite|tarde)\b/gi;

/** High-frequency English words with no Portuguese collision. */
const EN_WORDS =
  /\b(the|and|you|your|are|is|was|were|this|that|these|those|what|when|where|which|how|there|here|with|from|they|them|have|has|had|will|would|can|could|should|about|into|say|said|ask|tell|make|made|take|took|go|going|want|need|think|know)\b/gi;

export type Lang = "pt" | "en";

/**
 * Which language dominates, and whether the line mixes both.
 *
 * Mixed lines follow the DOMINANT language, and `mixed` is reported so callers
 * can decide. "Go into the pastelaria and ask for pastéis de nata" is an
 * English instruction carrying two Portuguese nouns: an English voice is right
 * for it, and the learner hears those nouns pronounced properly in the
 * Portuguese half of the card a second later.
 *
 * The bug this exists to fix is the OTHER case — a wholly Portuguese line like
 * "Quanto estás disposto a pagar por um quilo de carne picada?" being handed
 * to an American voice because the app assumed every card front was English.
 */
export function detectLang(text: string): { lang: Lang; mixed: boolean } {
  const clean = (text ?? "").trim();
  if (!clean) return { lang: "en", mixed: false };

  const ptChars = (clean.match(PT_CHARS) ?? []).length;
  const ptWords = (clean.match(PT_WORDS) ?? []).length;
  const enWords = (clean.match(EN_WORDS) ?? []).length;

  // A diacritic is strong evidence; two is close to proof.
  const ptScore = ptWords + ptChars * 1.5;
  const enScore = enWords;

  const mixed = ptScore > 0 && enScore > 0;
  if (ptScore === 0 && enScore === 0) {
    // No signal either way — a bare noun like "o talho". Punctuation-free
    // short strings in this app are far more often Portuguese.
    return { lang: /^[a-z\s'.,!?-]+$/i.test(clean) ? "en" : "pt", mixed: false };
  }
  return { lang: ptScore >= enScore ? "pt" : "en", mixed };
}

/** True when this line should be spoken by a Portuguese voice. */
export function isPortuguese(text: string): boolean {
  return detectLang(text).lang === "pt";
}
