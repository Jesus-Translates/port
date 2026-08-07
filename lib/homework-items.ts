export type HomeworkItem = {
  n: number;
  section: string | null;
  prompt: string;
  hint: string | null;
  answer: string | null;
  feedbackMd: string | null;
  correctedPt: string | null;
  correct: boolean | null;
  /** "certo" | "quase" | "errado" — "quase" = right idea, small slips. */
  verdict?: string | null;
  /** A portable rule to carry into the next question. */
  tip?: string | null;
};

export function blankItem(
  n: number,
  prompt: string,
  section: string | null = null,
  hint: string | null = null
): HomeworkItem {
  return {
    n,
    section,
    prompt,
    hint,
    answer: null,
    feedbackMd: null,
    correctedPt: null,
    correct: null,
    verdict: null,
    tip: null,
  };
}

/**
 * Splits a markdown assignment (pasted from class, or generated before
 * structured items existed) into individually answerable exercises.
 * Returns [] when it can't find at least two — the caller then falls back
 * to the single write-everything box.
 */
export function parseItemsFromMarkdown(md: string): HomeworkItem[] {
  const lines = md.split("\n");
  const items: HomeworkItem[] = [];
  let section: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Headings and bold-only lines act as section labels.
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      section = stripMd(heading[1]);
      continue;
    }
    const boldOnly = line.match(/^\*\*(.+?)\*\*:?$/);
    if (boldOnly) {
      section = stripMd(boldOnly[1]);
      continue;
    }

    // "1. …", "1) …", "- …", "* …"
    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    const bulleted = line.match(/^[-*]\s+(.+)$/);
    const text = numbered ? numbered[2] : bulleted ? bulleted[1] : null;
    if (!text) continue;

    const clean = stripMd(text);
    // Skip list lines that are just vocabulary glosses or headers, not tasks.
    if (clean.length < 4) continue;
    // Vocab-list sections are reference material, not exercises.
    if (section && /vocabul|expressõ|expressions?/i.test(section) && bulleted) {
      continue;
    }
    // "o frigorífico — the fridge" style glosses: dash/em-dash separator and
    // no sentence-ending punctuation means it's a word pair, not a task.
    if (bulleted && /[—–]|\s-\s/.test(clean) && !/[?.!…]$/.test(clean)) {
      continue;
    }
    items.push(blankItem(items.length + 1, clean, section));
  }

  return items.length >= 2 ? items : [];
}

function stripMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

export function itemProgress(items: HomeworkItem[]): {
  done: number;
  total: number;
  /** Answered but the grading call failed — needs a re-grade, not a red X. */
  ungraded: number;
  correct: number;
  allDone: boolean;
} {
  const answered = items.filter((i) => i.answer !== null);
  const ungraded = answered.filter((i) => i.correct === null).length;
  const correct = answered.filter((i) => i.correct === true).length;
  return {
    done: answered.length,
    total: items.length,
    ungraded,
    correct,
    // "Done" requires every item answered AND graded — a failed grading call
    // must never complete the assignment.
    allDone: answered.length === items.length && ungraded === 0,
  };
}

/** The prose before the first list item — the intro, without the exercises. */
export function introBefore(md: string): string {
  return md
    .replace(/^#\s+.+$/m, "")
    .split(/\n\s*(?:\d+[.)]|[-*])\s+/)[0]
    .trim();
}
