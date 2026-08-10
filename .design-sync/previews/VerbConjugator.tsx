import { VerbConjugator } from "portuguese-hub";

/**
 * The full-width reference surface — verb search, tense filter, and a play
 * button on every single form.
 *
 * Two stories, because the component's real job is the contrast: a regular
 * -ar verb where the pattern holds, and an irregular one where it breaks and
 * the component has to say so. Filtered to one tense so a card shows a
 * readable table rather than six stacked ones.
 */

/** The regular -ar model. Every form follows the pattern. */
export const VerboRegular = () => (
  <VerbConjugator initialVerb="falar" initialTense="presente" />
);

/** The irregular one every learner meets first — the pattern breaks throughout. */
export const VerboIrregular = () => (
  <VerbConjugator initialVerb="ser" initialTense="presente" />
);

/** Past tense on a high-frequency irregular — the tense filter doing its work. */
export const PreteritoPerfeito = () => (
  <VerbConjugator initialVerb="ir" initialTense="perfeito" />
);
