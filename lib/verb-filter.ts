/**
 * Selection logic for the conjugator tool — pure functions over lib/verbs.ts.
 *
 * lib/verbs.ts is hand-checked data with no regular/irregular flag, and we do
 * not add one: regularity is DERIVED here by regenerating the expected form
 * from the infinitive's ending and comparing it with the real one.
 */

import {
  IMPERATIVE_PERSONS,
  personLabel,
  TENSE_LABEL,
  type Tense,
  type Verb,
  VERBS,
} from "@/lib/verbs";

export type VerbClass = "ar" | "er" | "ir" | "outro";
export type Regularity = "all" | "regular" | "irregular";

/** One conjugated cell: the answer to a single question. */
export type Slot = {
  inf: string;
  en: string;
  tense: Tense;
  personIndex: number;
  answer: string;
};

export type VerbFilters = {
  classes: VerbClass[];
  tenses: Tense[];
  regularity: Regularity;
};

/** Display order — matches TENSE_LABEL. */
export const TENSES: Tense[] = [
  "presente",
  "perfeito",
  "imperfeito",
  "futuro",
  "conjuntivo",
  "imperativo",
];

export const CLASS_LABEL: Record<VerbClass, string> = {
  ar: "-ar",
  er: "-er",
  ir: "-ir",
  outro: "pôr",
};

/**
 * pôr and its compounds (compor, dispor, repor…) are a conjugation class of
 * their own — the "r" does not make them -er verbs, and there is no regular
 * paradigm to measure them against.
 */
export function verbClass(verb: Verb): VerbClass {
  const inf = verb.inf;
  if (inf.endsWith("pôr")) return "outro";
  if (inf.endsWith("ar")) return "ar";
  if (inf.endsWith("er")) return "er";
  if (inf.endsWith("ir")) return "ir";
  return "outro";
}

type ThemeClass = "ar" | "er" | "ir";
type StemTense = Exclude<Tense, "futuro" | "imperativo">;

/** Endings glued to the stem (infinitive minus -ar/-er/-ir). */
const STEM_ENDINGS: Record<ThemeClass, Record<StemTense, string[]>> = {
  ar: {
    presente: ["o", "as", "a", "amos", "am"],
    // EP keeps the accent in the 1st person plural: falámos, not falamos.
    perfeito: ["ei", "aste", "ou", "ámos", "aram"],
    imperfeito: ["ava", "avas", "ava", "ávamos", "avam"],
    conjuntivo: ["e", "es", "e", "emos", "em"],
  },
  er: {
    presente: ["o", "es", "e", "emos", "em"],
    perfeito: ["i", "este", "eu", "emos", "eram"],
    imperfeito: ["ia", "ias", "ia", "íamos", "iam"],
    conjuntivo: ["a", "as", "a", "amos", "am"],
  },
  ir: {
    presente: ["o", "es", "e", "imos", "em"],
    perfeito: ["i", "iste", "iu", "imos", "iram"],
    imperfeito: ["ia", "ias", "ia", "íamos", "iam"],
    conjuntivo: ["a", "as", "a", "amos", "am"],
  },
};

/** The futuro is built on the whole infinitive, so there is no stem junction. */
const FUTURO_ENDINGS = ["ei", "ás", "á", "emos", "ão"];

/** e/i are "front" vowels — they are what keeps c and g soft. */
function frontVowel(ending: string): boolean {
  return /^[eéêií]/.test(ending);
}

/**
 * Glue stem + ending, applying the SOUND-PRESERVING spelling shifts.
 *
 * These are not irregularities — fiquei, joguei, comecei and conheço sound
 * exactly like the plain stem; Portuguese just respells the consonant so it
 * keeps its sound. Which way the shift runs depends on the class, because the
 * stem's spelling in the infinitive is already fixed by the theme vowel:
 *   -ar  stem is spelt for a back vowel  →  shift before e/i (fic- → fiquei)
 *   -er/-ir stem is spelt for a front vowel → shift before a/o (conhec- → conheço)
 */
function join(stem: string, ending: string, cls: ThemeClass): string {
  const front = frontVowel(ending);
  if (cls === "ar") {
    if (!front) return stem + ending;
    if (stem.endsWith("ç")) return stem.slice(0, -1) + "c" + ending; // começar → comecei
    if (stem.endsWith("c")) return stem.slice(0, -1) + "qu" + ending; // ficar → fiquei
    if (stem.endsWith("g")) return stem.slice(0, -1) + "gu" + ending; // jogar → joguei
    return stem + ending;
  }
  if (front) return stem + ending;
  if (stem.endsWith("gu")) return stem.slice(0, -2) + "g" + ending; // -guir → -go
  if (stem.endsWith("qu")) return stem.slice(0, -2) + "c" + ending; // -quir → -co
  if (stem.endsWith("c")) return stem.slice(0, -1) + "ç" + ending; // conhecer → conheço
  if (stem.endsWith("g")) return stem.slice(0, -1) + "j" + ending; // -ger/-gir → -jo
  return stem + ending;
}

/**
 * The five forms a fully regular verb of this ending would have.
 * `null` for pôr-class verbs (no regular paradigm exists).
 */
export function regularForms(inf: string, tense: Tense): (string | null)[] | null {
  const cls: VerbClass = inf.endsWith("pôr")
    ? "outro"
    : inf.endsWith("ar")
      ? "ar"
      : inf.endsWith("er")
        ? "er"
        : inf.endsWith("ir")
          ? "ir"
          : "outro";
  if (cls === "outro") return null;
  const stem = inf.slice(0, -2);
  if (tense === "futuro") return FUTURO_ENDINGS.map((e) => inf + e);
  const table = STEM_ENDINGS[cls];
  if (tense === "imperativo") {
    // tu borrows the presente 3sg; você/nós/vocês borrow the conjuntivo.
    const pres = table.presente.map((e) => join(stem, e, cls));
    const conj = table.conjuntivo.map((e) => join(stem, e, cls));
    return [null, pres[2], conj[2], conj[3], conj[4]];
  }
  return table[tense].map((e) => join(stem, e, cls));
}

/**
 * Is this verb regular in this tense? Derived, never stored.
 * False when the verb has no forms recorded for the tense.
 */
export function isRegular(verb: Verb, tense: Tense): boolean {
  const actual = verb.forms[tense];
  if (!actual) return false;
  const expected = regularForms(verb.inf, tense);
  if (!expected) return false;
  return actual.every((a, i) => (a ?? "") === (expected[i] ?? ""));
}

/** The tenses this verb actually has data for, in display order. */
export function tensesOf(verb: Verb): Tense[] {
  return TENSES.filter((t) => verb.forms[t]);
}

export function findVerb(inf: string): Verb | undefined {
  return VERBS.find((v) => v.inf === inf);
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Every form matching the filters. Ordered for the reference view; pass
 * `shuffle` for a test round. Null slots (the imperative has no "eu") are
 * skipped, and an impossible combination simply returns [].
 */
export function selectForms(
  filters: VerbFilters,
  opts: { shuffle?: boolean; limit?: number; random?: () => number } = {}
): Slot[] {
  const { classes, tenses, regularity } = filters;
  const out: Slot[] = [];
  if (classes.length === 0 || tenses.length === 0) return out;

  for (const verb of VERBS) {
    if (!classes.includes(verbClass(verb))) continue;
    for (const tense of TENSES) {
      if (!tenses.includes(tense)) continue;
      const forms = verb.forms[tense];
      if (!forms) continue;
      if (regularity !== "all") {
        const regular = isRegular(verb, tense);
        if (regularity === "regular" ? !regular : regular) continue;
      }
      forms.forEach((answer, personIndex) => {
        if (!answer) return;
        out.push({ inf: verb.inf, en: verb.en, tense, personIndex, answer });
      });
    }
  }

  const list = opts.shuffle ? shuffled(out, opts.random ?? Math.random) : out;
  return opts.limit != null ? list.slice(0, opts.limit) : list;
}

/* ── Multiple choice ──────────────────────────────────────────────────────── */

/**
 * Four options where the distractors are OTHER REAL FORMS OF THE SAME VERB —
 * that is what makes the question teach (falamos vs falámos) instead of being
 * a spot-the-odd-one-out. Alternates "wrong person" and "wrong tense" so both
 * axes are in play, and only borrows from other verbs if this one is too small.
 */
export function choiceOptions(
  slot: Slot,
  opts: { count?: number; random?: () => number } = {}
): string[] {
  const count = opts.count ?? 4;
  const random = opts.random ?? Math.random;
  const verb = findVerb(slot.inf);
  const seen = new Set<string>([slot.answer.toLowerCase()]);

  const samePerson: string[] = [];
  const sameTense: string[] = [];
  const rest: string[] = [];
  const add = (bucket: string[], form: string | null | undefined) => {
    if (!form) return;
    const key = form.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    bucket.push(form);
  };

  if (verb) {
    (verb.forms[slot.tense] ?? []).forEach((f, i) => {
      if (i !== slot.personIndex) add(sameTense, f);
    });
    for (const t of TENSES) {
      if (t !== slot.tense) add(samePerson, verb.forms[t]?.[slot.personIndex]);
    }
    for (const t of TENSES) (verb.forms[t] ?? []).forEach((f) => add(rest, f));
  }

  // Alternate the two axes so a round never becomes "always the wrong person".
  const byTense = shuffled(sameTense, random);
  const byPerson = shuffled(samePerson, random);
  const wrong: string[] = [];
  for (let i = 0; i < Math.max(byTense.length, byPerson.length); i++) {
    if (byTense[i]) wrong.push(byTense[i]);
    if (byPerson[i]) wrong.push(byPerson[i]);
  }
  wrong.push(...shuffled(rest, random));
  wrong.length = Math.min(wrong.length, count - 1);

  // A verb with barely any recorded forms still deserves four buttons.
  if (wrong.length < count - 1) {
    const cls = verb ? verbClass(verb) : "outro";
    for (const other of VERBS) {
      if (wrong.length >= count - 1) break;
      if (other.inf === slot.inf || verbClass(other) !== cls) continue;
      const form = other.forms[slot.tense]?.[slot.personIndex];
      if (!form || seen.has(form.toLowerCase())) continue;
      seen.add(form.toLowerCase());
      wrong.push(form);
    }
  }

  return shuffled([slot.answer, ...wrong], random);
}

/* ── Spelling ─────────────────────────────────────────────────────────────── */

export function stripAccents(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export type SpellVerdict = {
  verdict: "certo" | "quase" | "errado";
  /** Which accent slipped, for the "quase" case. */
  note?: string;
};

/**
 * Case-insensitive match is right. Right letters but wrong accents is "quase",
 * never wrong — the learner knew the form, the keyboard did not.
 */
export function checkSpelling(typed: string, answer: string): SpellVerdict {
  const t = typed.trim().toLowerCase().normalize("NFC");
  const a = answer.trim().toLowerCase().normalize("NFC");
  if (t === a) return { verdict: "certo" };
  if (stripAccents(t) !== stripAccents(a)) return { verdict: "errado" };

  const chars = [...a];
  const typedChars = [...t];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== typedChars[i]) {
      return {
        verdict: "quase",
        note: `escreveste «${typedChars[i] ?? "—"}», é «${chars[i]}»`,
      };
    }
  }
  return { verdict: "quase" };
}

/* ── Speaking ─────────────────────────────────────────────────────────────── */

/** Sentence subjects — PERSONS has slashes ("ele/ela"), unspeakable as text. */
const SUBJECT = ["eu", "tu", "ele", "nós", "eles"];

export type SpeakTarget = {
  /** What to read aloud — sent to /api/stt as `target`. */
  sentence: string;
  /** Which whitespace-delimited word of it is the conjugated form. */
  wordIndex: number;
};

/**
 * A bare word is too short for the recogniser to score, so the form goes into
 * a short spoken frame: the infinitive announced, then the form in context —
 * exactly how a conjugation is recited aloud, and grammatical for every verb.
 *   "Falar: eu falo."  ·  "Falar: que eu fale."  ·  "Falar: fala tu."
 */
export function speakTarget(slot: Slot): SpeakTarget {
  const head = slot.inf.charAt(0).toUpperCase() + slot.inf.slice(1) + ":";
  if (slot.tense === "imperativo") {
    const who = IMPERATIVE_PERSONS[slot.personIndex] ?? "tu";
    return { sentence: `${head} ${slot.answer} ${who}.`, wordIndex: 1 };
  }
  const who = SUBJECT[slot.personIndex] ?? "eu";
  if (slot.tense === "conjuntivo") {
    return { sentence: `${head} que ${who} ${slot.answer}.`, wordIndex: 3 };
  }
  return { sentence: `${head} ${who} ${slot.answer}.`, wordIndex: 2 };
}

/** "eu · falar · pretérito perfeito" — the human-readable question stem. */
export function slotPrompt(slot: Slot): string {
  const who = personLabel(slot.tense, slot.personIndex);
  return `${who} · ${slot.inf} · ${TENSE_LABEL[slot.tense].toLowerCase()}`;
}
