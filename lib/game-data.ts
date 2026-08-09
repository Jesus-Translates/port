import { and, eq, sql } from "drizzle-orm";
import { categories, getDb, refEntries } from "@/lib/db";
import { VERBS, type Tense, personLabel } from "@/lib/verbs";

/**
 * Content for the games that need no AI.
 *
 * Every round here is dealt from material the app already owns — the
 * phrasebook and the hand-checked verb tables — so a replay costs nothing and
 * takes no time. Games that call a model can only be played so many times
 * before they get expensive, which is exactly backwards for the thing meant to
 * be played for fun.
 */

const ARTICLES = ["o", "a", "os", "as"];

export type GenderRound = {
  /** The noun with its article stripped: "praia". */
  word: string;
  /** o | a | os | as */
  article: string;
  en: string;
};

/**
 * Nouns for "O ou A?". The phrasebook lists every noun WITH its article, which
 * makes it a ready-made gender key — the article is simply removed to make the
 * question.
 */
export async function genderRounds(limit = 25): Promise<GenderRound[]> {
  const rows = await getDb()
    .select({ pt: refEntries.pt, en: refEntries.en })
    .from(refEntries)
    .where(sql`lower(${refEntries.pt}) ~ '^(o|a|os|as) [a-zà-ú]'`)
    .orderBy(sql`random()`)
    .limit(limit * 2);

  const seen = new Set<string>();
  const out: GenderRound[] = [];
  for (const r of rows) {
    const parts = r.pt.trim().split(/\s+/);
    const article = parts[0].toLowerCase();
    const word = parts.slice(1).join(" ");
    // One-word nouns only: "a casa de banho" is a phrase whose gender is still
    // the first noun's, but showing the whole phrase gives the answer away less
    // cleanly and reads badly on a phone.
    if (!ARTICLES.includes(article) || !word || word.split(/\s+/).length > 2) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ word, article, en: r.en });
    if (out.length >= limit) break;
  }
  return out;
}

export type VerbRound = {
  /** "tu" / "nós" … */
  person: string;
  infinitive: string;
  tenseLabel: string;
  /** What is shown — right or wrong. */
  shown: string;
  /** The form that actually belongs there. */
  correct: string;
  isCorrect: boolean;
};

/**
 * Rounds for "Certo ou Errado?".
 *
 * Wrong forms are never invented — they are real forms borrowed from another
 * person in the SAME hand-checked row. Generating verb forms would put
 * unverified European Portuguese in front of a learner, which is the one thing
 * lib/verbs.ts exists to prevent.
 */
export function verbRounds(tenses: Tense[], count = 20): VerbRound[] {
  const pool: VerbRound[] = [];

  for (const verb of VERBS) {
    for (const tense of tenses) {
      const forms = verb.forms[tense];
      if (!forms) continue;
      for (let i = 0; i < forms.length; i++) {
        const correct = forms[i];
        if (!correct) continue;

        // Any other slot in this row is a candidate wrong answer, as long as it
        // is not spelled the same as the right one — eu and ele share a form in
        // the imperfeito, so "eu falava" shown for ele is not an error at all.
        const decoys = forms.filter(
          (f, j) => j !== i && f && f !== correct
        ) as string[];

        pool.push({
          person: personLabel(tense, i),
          infinitive: verb.inf,
          tenseLabel: tense,
          shown: correct,
          correct,
          isCorrect: true,
        });
        if (decoys.length > 0) {
          pool.push({
            person: personLabel(tense, i),
            infinitive: verb.inf,
            tenseLabel: tense,
            shown: decoys[Math.floor(Math.random() * decoys.length)],
            correct,
            isCorrect: false,
          });
        }
      }
    }
  }

  // Shuffle, then take a roughly even mix of right and wrong so the learner
  // cannot win by always answering the same way.
  const right = shuffle(pool.filter((r) => r.isCorrect));
  const wrong = shuffle(pool.filter((r) => !r.isCorrect));
  const half = Math.ceil(count / 2);
  return shuffle([...right.slice(0, half), ...wrong.slice(0, count - half)]);
}

export type IntruderRound = {
  words: { pt: string; en: string }[];
  /** Index into words of the one that does not belong. */
  intruderIndex: number;
  homeCategory: string;
  intruderCategory: string;
};

/**
 * Rounds for "O Intruso": three words from one category, one from a category
 * far enough away that there is exactly one defensible answer.
 *
 * Nearby categories (kitchen and pantry, say) would make two answers arguable,
 * so pairs are only drawn when the two categories are far apart in the
 * phrasebook's own ordering — a cheap stand-in for a hand-written distance map
 * that cannot go stale when someone adds a category.
 */
export async function intruderRounds(limit = 10): Promise<IntruderRound[]> {
  const db = getDb();
  const cats = await db
    .select({ id: categories.id, name: categories.namePt, sort: categories.sortOrder })
    .from(categories)
    .orderBy(categories.sortOrder);

  const byCat = new Map<number, { pt: string; en: string }[]>();
  for (const cat of cats) {
    const rows = await db
      .select({ pt: refEntries.pt, en: refEntries.en })
      .from(refEntries)
      .where(
        and(
          eq(refEntries.categoryId, cat.id),
          eq(refEntries.kind, "term"),
          // Nouns only, and short ones: a sentence among four words is
          // obviously the odd one out for the wrong reason.
          sql`${refEntries.pt} !~ '[?!.]'`,
          sql`array_length(regexp_split_to_array(trim(${refEntries.pt}), '\s+'), 1) <= 3`
        )
      )
      .orderBy(sql`random()`)
      .limit(12);
    if (rows.length >= 3) byCat.set(cat.id, rows);
  }

  const usable = cats.filter((c) => byCat.has(c.id));
  if (usable.length < 2) return [];

  const rounds: IntruderRound[] = [];
  for (let i = 0; i < limit * 3 && rounds.length < limit; i++) {
    const home = usable[Math.floor(Math.random() * usable.length)];
    // Adjacent categories in the phrasebook are neighbours in meaning too
    // (kitchen next to pantry, house next to rooms), and a "distant" pick from
    // one of those has a second defensible answer. Demand real distance.
    const far = usable.filter(
      (c) => Math.abs(c.sort - home.sort) >= Math.max(4, usable.length / 3)
    );
    if (far.length === 0) continue;
    const away = far[Math.floor(Math.random() * far.length)];

    const three = shuffle(byCat.get(home.id)!).slice(0, 3);
    const one = shuffle(byCat.get(away.id)!)[0];
    if (three.length < 3 || !one) continue;
    if (three.some((w) => w.pt === one.pt)) continue;

    const words = shuffle([...three, one]);
    rounds.push({
      words,
      intruderIndex: words.findIndex((w) => w.pt === one.pt),
      homeCategory: home.name,
      intruderCategory: away.name,
    });
  }
  return rounds;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
