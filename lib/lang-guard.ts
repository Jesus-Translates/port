/**
 * This app writes in exactly two scripts, and both of them are Latin.
 *
 * Escutar dialogues came back in Chinese often enough to be reported. The
 * cause is the shape of the feature rather than any one prompt: a learner
 * types a free-text topic, it is interpolated into the instructions, and a
 * model asked to write "about 中文" will oblige. Prompt wording cannot close
 * that — an instruction is a request, and the whole point of a jailbreak is
 * that requests can be declined. A character-class check is not a request.
 *
 * So the rule is mechanical and it is enforced on BOTH sides: nothing
 * non-Latin goes into a prompt, and nothing non-Latin comes back out of one.
 *
 * What counts as allowed:
 *  - Latin      — a-z, and every accented letter Portuguese uses (ã ç õ á…)
 *  - Common     — digits, spaces, punctuation, currency, emoji
 *  - Inherited  — combining marks, so decomposed "ã" (a + U+0303) survives
 *
 * Everything else — Han, Hiragana, Katakana, Cyrillic, Arabic, Hebrew,
 * Devanagari, Greek, Thai — is refused. European Portuguese and English need
 * none of them, so there is no legitimate input this costs us.
 */
const NON_LATIN = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u;

/** True when the string contains any character outside Latin + Common. */
export function hasNonLatin(text: string): boolean {
  return NON_LATIN.test(text);
}

/**
 * The offending characters, deduplicated — for logs and error messages.
 *
 * Bounded: a wholly Chinese paragraph should produce a short sample, not a
 * second copy of itself in an error string.
 */
export function nonLatinSample(text: string, max = 8): string {
  const bad = new Set<string>();
  for (const ch of text) {
    if (NON_LATIN.test(ch)) bad.add(ch);
    if (bad.size >= max) break;
  }
  return [...bad].join("");
}

/**
 * Every field of a generated dialogue that a learner will read or hear.
 *
 * Checked as one blob rather than field by field: a clip is unusable if ANY
 * part of it is in the wrong script, and reporting which line was wrong helps
 * nobody — the whole thing gets regenerated either way.
 */
export function scriptOffenders(
  lines: { speaker?: string; text?: string; translation?: string }[]
): string[] {
  const out: string[] = [];
  for (const l of lines) {
    for (const v of [l.speaker, l.text, l.translation]) {
      if (v && hasNonLatin(v)) out.push(v);
    }
  }
  return out;
}

/**
 * The learner-facing refusal for a non-Latin free-text field, or null when the
 * text is fine. One message, so every AI route that takes a typed topic turns
 * away "写一个对话" the same way — the input half of the Chinese-output bug,
 * which is otherwise re-openable by every new route with a topic box.
 */
export function nonLatinError(text: string): string | null {
  if (!hasNonLatin(text)) return null;
  return (
    "O texto tem de estar em português ou inglês — só esses dois. " +
    `Encontrei: ${nonLatinSample(text)}`
  );
}

/*
 * Does this look like Portuguese rather than English?
 *
 * Needed because the app's prose is deliberately MIXED: a unit note explains
 * in English and quotes in Portuguese, often in the same sentence. A speak
 * button has to go on the Portuguese and nowhere near the English, since the
 * voice is European Portuguese and handing it "Good morning." produces
 * confident nonsense.
 *
 * Two signals, cheap and in this order:
 *  - a diacritic Portuguese uses and English does not (ã, ç, é, ô …), which
 *    settles most of it outright;
 *  - failing that, a common Portuguese word. "Bom dia" carries no diacritic at
 *    all, so the word list is what catches the greetings a beginner meets
 *    first — exactly the phrases most worth hearing.
 *
 * Deliberately conservative: it answers "probably Portuguese", and anything it
 * is unsure about gets NO button rather than a wrong reading.
 */
const PT_DIACRITIC = /[ãõáàâéêíóôúç]/i;

const PT_WORDS = new Set([
  "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos",
  "das", "em", "no", "na", "nos", "nas", "ao", "aos", "à", "às", "que", "e",
  "é", "são", "com", "para", "por", "se", "não", "sim", "eu", "tu", "ele",
  "ela", "nós", "vocês", "eles", "elas", "meu", "minha", "teu", "tua", "seu",
  "sua", "bom", "boa", "bons", "boas", "dia", "tarde", "noite", "olá", "adeus",
  "obrigado", "obrigada", "favor", "faz", "como", "estás", "está", "estou",
  "sou", "és", "tenho", "tens", "tem", "muito", "muita", "bem", "mal", "aqui",
  "ali", "hoje", "amanhã", "ontem", "agora", "chamo", "prazer", "conhecer",
  "falar", "fala", "quero", "queria", "pode", "podes", "vamos", "vai", "onde",
  "quando", "porque", "também", "já", "ainda", "sempre", "nunca", "casa",
  "água", "café", "pão", "mais", "menos", "grande", "pequeno", "este", "esta",
]);

export function looksPortuguese(text: string): boolean {
  const s = text.trim();
  if (s.length < 2) return false;
  if (PT_DIACRITIC.test(s)) return true;
  const words = s
    .toLowerCase()
    .replace(/[^a-zà-ÿ\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return false;
  return words.some((w) => PT_WORDS.has(w));
}
