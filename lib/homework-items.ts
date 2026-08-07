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
  allDone: boolean;
} {
  const done = items.filter((i) => i.answer !== null).length;
  return { done, total: items.length, allDone: done === items.length };
}
