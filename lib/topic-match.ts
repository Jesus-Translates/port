/**
 * "Which of these rows is this unit step about?"
 *
 * A unit path item hands an activity a topic — sometimes a phrase ("comprar
 * peixe na praça"), more often a whole sentence of instructions ("Ouvir e
 * completar frases sobre relações familiares, praticando o artigo definido…").
 * Three surfaces need to answer the same question about it:
 *
 *   - Escutar and Histórias ask "do we already OWN one of these?", so they want
 *     the matches only — an empty list means "nothing here, use the generate
 *     form underneath".
 *   - Ditado asks "which phrases should this round draw first?", so it wants
 *     every row, best first. The topic RANKS, it never filters: a pure grammar
 *     step ("o artigo definido antes do possessivo") matches nothing in the
 *     phrasebook, and five ordinary phrases beat an empty screen.
 *
 * Both come from `rankByTopic` / `sortByTopic` below, over one stop list and
 * one notion of "this word matched". This is deliberately boring token overlap
 * rather than anything clever: it runs over rows already loaded for the page,
 * it never builds SQL out of learner text, and a near-miss costs nothing.
 */

/** Lowercase, unaccented, punctuation-free — "à praça" and "a praca" are one. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Words that would match half the phrasebook, so they carry no topic signal:
 * the ordinary glue of Portuguese and English, plus the instruction verbs every
 * unit topic is written with ("Ouvir e completar frases sobre…"). Those describe
 * the exercise, not the vocabulary. Modals and fillers go too — "pode" is in
 * half the book, so a hit on it says nothing.
 *
 * Written with accents for readability; folded to match `normalize` below.
 */
const STOP = new Set(
  [
    "que", "dos", "das", "nos", "nas", "com", "por", "para", "mais", "muito",
    "também", "como", "quando", "antes", "depois", "sobre", "entre", "numa",
    "sem", "pelo", "pela", "uma", "uns", "umas", "este", "esta", "isso",
    "não", "sim", "mas", "nem", "vez", "vezes",
    "the", "and", "with", "for", "your", "you", "about",
    // instruction verbs and exercise vocabulary
    "ouvir", "escutar", "completar", "completando", "praticar", "praticando",
    "treinar", "usar", "usando", "escrever", "dizer", "frase", "frases",
    "palavra", "palavras", "expressão", "expressões", "curta", "curtas",
    "curto", "curtos", "incluindo", "exemplo", "exemplos", "tema", "nível",
    "contraste", "forma", "formas", "habitual", "diálogo", "diálogos",
    // The phrasebook files almost every row under the section "Perguntas e
    // respostas", so these match three quarters of the book and rank nothing.
    "pergunta", "perguntas", "resposta", "respostas",
    // Every syllabus topic says it is about European Portuguese — and one
    // category is called "Portuguese culture & history", which that boilerplate
    // would otherwise drag into every single round.
    "português", "portuguesa", "portugueses", "portuguesas",
    "europeu", "europeia", "europeus", "europeias",
    // modals and fillers
    "pode", "podes", "posso", "podia", "dava", "será", "quero", "queres",
    "preciso", "precisas", "algum", "alguma", "alguns", "algumas", "coisa",
    "coisas", "outro", "outra", "outros", "outras", "tudo", "nada", "aqui",
    "onde",
  ].map(normalize)
);

/** Terms shorter than this only ever match a word exactly: "mar" must not drag
 *  in *marido*, and "pai" must not drag in *país*. */
const INFLECTION_MIN = 4;

/** How much of a length difference reads as inflection rather than a different
 *  word — casa/casas, forno/fornos, eletrodoméstico/eletrodomésticos. */
const INFLECTION_SLACK = 2;

export type TopicQuery = {
  /** Content words worth searching for, in the order the topic said them. */
  terms: string[];
  /** The normalized topic, for the verbatim bonus. */
  whole: string;
};

/**
 * The words in a topic worth searching for. Null when the topic is blank or is
 * all glue — callers read that as "no opinion", not "no matches".
 *
 * Every surviving word counts, with no cap. A syllabus topic runs to 300
 * characters and its tail is where the short vocabulary hides — *forno*,
 * *roupa*, *panela* — so keeping only the longest dozen (which is all the SQL
 * version this replaced could afford, at five ILIKEs per term per row) threw
 * away exactly the words the phrasebook was most likely to have. Scoring is
 * additive and relative, so extra terms sharpen the ranking rather than
 * flattening it.
 */
export function topicQuery(topic: string): TopicQuery | null {
  const whole = normalize(topic);
  const terms = [
    ...new Set(whole.split(" ").filter((w) => w.length > 2 && !STOP.has(w))),
  ];
  if (terms.length === 0) return null;
  return { terms, whole };
}

/**
 * Does this word count as a hit for this term? Exact, or one of the two
 * standing in for the other's singular/plural. Deliberately tighter than the
 * `ilike '%term%'` this replaced, which also matched a term buried anywhere
 * inside a longer word.
 */
function hits(term: string, word: string): boolean {
  if (term === word) return true;
  const [short, long] = term.length <= word.length ? [term, word] : [word, term];
  return (
    short.length >= INFLECTION_MIN &&
    long.length - short.length <= INFLECTION_SLACK &&
    long.startsWith(short)
  );
}

function scoreOf(query: TopicQuery, text: string): number {
  const flat = normalize(text);
  const words = new Set(flat.split(" ").filter(Boolean));
  let score = 0;
  for (const term of query.terms) {
    for (const word of words) {
      if (hits(term, word)) {
        score += 2;
        break;
      }
    }
  }
  // The whole topic appearing verbatim is a much stronger signal than two words
  // happening to coincide.
  if (query.whole.length > 3 && flat.includes(query.whole)) score += 5;
  return score;
}

/** Best first, ties left in the order they came in — so a caller that wants a
 *  random tiebreak shuffles before calling. */
function scored<T>(
  rows: T[],
  query: TopicQuery,
  textOf: (row: T) => string
): { row: T; score: number }[] {
  return rows
    .map((row, i) => ({ row, i, score: scoreOf(query, textOf(row)) }))
    .sort((a, b) => b.score - a.score || a.i - b.i);
}

/**
 * Every row, best first — rows that match nothing keep their place at the back
 * rather than being dropped. For callers where the topic ranks but must never
 * filter, and where a topic with no content words means "no opinion, leave the
 * order alone" rather than "no rows".
 */
export function sortByTopic<T>(
  rows: T[],
  topic: string,
  textOf: (row: T) => string
): T[] {
  const query = topicQuery(topic);
  if (!query) return rows;
  return scored(rows, query, textOf).map((r) => r.row);
}

/**
 * The rows worth showing for this topic, best first. Empty when the topic is
 * blank or nothing shares a meaningful word — an empty list is the honest
 * answer, and the caller shows nothing rather than a bad guess.
 */
export function rankByTopic<T>(
  rows: T[],
  topic: string,
  textOf: (row: T) => string
): T[] {
  const query = topicQuery(topic);
  if (!query) return [];
  return scored(rows, query, textOf)
    .filter((r) => r.score > 0)
    .map((r) => r.row);
}
