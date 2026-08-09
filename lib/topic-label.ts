/**
 * A topic the learner can read, from a topic the model was given.
 *
 * Unit path items carry the FULL instruction as their topic — a median of 192
 * characters, every one of them over 80 — because that text is a good prompt.
 * It is a terrible label, and it was being rendered verbatim as a chip on
 * every activity page: the learner opened a game and was shown the paragraph
 * we used to ask for it.
 *
 * The prompt keeps its full length wherever it is sent to a model. Only the
 * display is shortened, and only here, so the two can never drift apart.
 */

/**
 * Boundaries a human would stop at, strongest first. A comma is last and
 * weakest on purpose: these topics are full of comma-separated LISTS
 * ("móveis, eletrodomésticos, objetos"), and treating the first one as the end
 * of a clause cut "combinar móveis, eletrodomésticos e objetos…" down to
 * "combinar móveis" — technically shorter, and useless.
 */
const BREAKS = [/[:—–]/, /\s[-]\s/, /\.\s/, /,\s(?=[a-zà-ú])/];
/** Below this, a "natural" boundary is just an unhelpfully short label. */
const MIN_USEFUL = 28;

export function shortTopic(topic: string, max = 64): string {
  const clean = topic.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  for (const re of BREAKS) {
    const cut = clean.search(re);
    if (cut >= MIN_USEFUL && cut <= max) return clean.slice(0, cut).trim();
  }

  // Otherwise trim on a word boundary rather than mid-word.
  const slice = clean.slice(0, max);
  const space = slice.lastIndexOf(" ");
  return `${(space > 20 ? slice.slice(0, space) : slice).trim()}…`;
}
