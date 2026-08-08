/**
 * "Do we already have one of these?"
 *
 * A unit path item hands an activity a topic ("comprar peixe na praça"). The
 * library indexes it lands on — Escutar, Histórias — used to greet that topic
 * with an empty generate form, so the obvious action was to spend an AI call
 * making a second clip about something the family already owns.
 *
 * This is deliberately a small, boring token overlap rather than anything
 * clever: it runs over a few dozen rows already loaded for the page, it never
 * builds SQL out of learner text, and a near-miss costs nothing because the
 * generate form is still right there underneath.
 */

/** Short joining words that would match everything and mean nothing. */
const STOP = new Set([
  "dos",
  "das",
  "com",
  "para",
  "por",
  "que",
  "uma",
  "uns",
  "nos",
  "nas",
  "sobre",
  "the",
  "and",
  "for",
  "with",
  "about",
]);

/** Lowercase, unaccented, punctuation-free — "à praça" and "a praca" are one. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(
    normalize(s)
      .split(" ")
      .filter((w) => w.length > 2 && !STOP.has(w))
  );
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
  const wanted = tokens(topic);
  if (wanted.size === 0) return [];
  const whole = normalize(topic);

  return rows
    .map((row) => {
      const text = textOf(row);
      const have = tokens(text);
      let score = 0;
      for (const w of wanted) if (have.has(w)) score += 2;
      // The whole topic appearing verbatim is a much stronger signal than two
      // words happening to coincide.
      if (whole.length > 3 && normalize(text).includes(whole)) score += 5;
      return { row, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.row);
}
