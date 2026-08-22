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
 * THE HARD CASE, and the one that shipped broken: an English sentence that
 * QUOTES Portuguese. `Using "você" for everyone` is a mistake-list heading —
 * English, with one Portuguese word in quotes — and a diacritic-first test
 * called the whole thing Portuguese and read it aloud in a Portuguese voice.
 * Portuguese signal alone is not enough, because the Portuguese is exactly
 * what an English sentence about Portuguese contains.
 *
 * So the test is now: Portuguese signal present AND no English signal at all.
 * Any unambiguously English word disqualifies the string, however much
 * Portuguese sits beside it. That refuses some genuinely Portuguese phrases
 * (a false negative costs a missing button); the alternative reads English
 * aloud in the wrong language and bills for it.
 *
 * The English list holds only words Portuguese never uses. "a", "as", "no",
 * "me", "do", "e" are all real Portuguese words and must never appear in it.
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

/**
 * Words that are English and are NOT Portuguese. One of these settles it.
 *
 * Deliberately excludes every English/Portuguese homograph — a, as, no, me,
 * do, e, se, ou, la, ma — because those appear constantly in real Portuguese
 * and would veto it.
 */
const EN_WORDS = new Set([
  "the", "and", "for", "with", "without", "using", "use", "used", "uses",
  "when", "while", "this", "that", "these", "those", "there", "here", "is",
  "are", "was", "were", "be", "been", "being", "am", "you", "your", "yours",
  "they", "them", "their", "we", "our", "he", "she", "his", "her", "it", "its",
  "from", "but", "not", "what", "which", "who", "whom", "whose", "how", "why",
  "instead", "always", "never", "often", "sometimes", "usually", "means",
  "meaning", "say", "says", "said", "saying", "common", "mistake", "mistakes",
  "wrong", "right", "correct", "people", "someone", "something", "anything",
  "everyone", "everything", "morning", "afternoon", "evening", "night",
  "hello", "goodbye", "please", "thank", "thanks", "name", "nice", "meet",
  "good", "bad", "very", "much", "many", "more", "less", "than", "then",
  "because", "about", "after", "before", "into", "onto", "over", "under",
  "would", "could", "should", "will", "can", "may", "might", "must", "have",
  "has", "had", "does", "did", "doing", "get", "got", "make", "made", "take",
  "took", "give", "gave", "know", "knew", "think", "thought", "want", "need",
  "like", "just", "only", "also", "even", "still", "yet", "both", "each",
  "every", "some", "any", "all", "most", "other", "another", "same",
  "different", "new", "old", "first", "last", "next", "one", "two", "three",
  "word", "words", "phrase", "phrases", "sentence", "sentences", "form",
  "forms", "verb", "verbs", "noun", "nouns", "formal", "informal", "polite",
  "speak", "speaking", "spoken", "talking", "talk", "hear", "listen",
  "everyone's", "don", "doesn", "isn", "aren", "won", "can",
]);

/**
 * Split into words, keeping accented letters INSIDE the word.
 *
 * This matters more than it looks: a naive ASCII word boundary splits
 * "notícia" into "not" + "ícia" and then finds the English word "not" inside a
 * Portuguese one. Accented letters are letters here, so they never break a
 * word apart.
 */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Does this contain a word that is English and cannot be Portuguese?
 *
 * Exported because the table rule needs it too. A cell in the Portuguese
 * column can still carry its own translation — "Faz calor. It is hot." — and
 * the column alone cannot see that.
 */
export function hasEnglishWord(text: string): boolean {
  return words(text).some((w) => EN_WORDS.has(w));
}

export function looksPortuguese(text: string): boolean {
  const s = text.trim();
  if (s.length < 2) return false;
  const w = words(s);
  if (w.length === 0) return false;

  // One unmistakably English word and we do not touch it, no matter how much
  // Portuguese it quotes. This is the `Using "você" for everyone` case.
  if (hasEnglishWord(s)) return false;

  if (PT_DIACRITIC.test(s)) return true;
  return w.some((x) => PT_WORDS.has(x));
}
