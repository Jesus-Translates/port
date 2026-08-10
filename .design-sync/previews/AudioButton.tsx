import { AudioButton } from "portuguese-hub";

/**
 * Labelled and icon-only, as the app uses both.
 *
 * Every story passes `text` rather than `entryId`/`quizId`: those two fetch
 * cached audio by database id, which resolves to nothing outside the app. With
 * `text` the button is the same component in the same states — it just has no
 * server to speak to, which is true of any preview.
 */

/** Above a story — the primary, labelled form. */
export const ComEtiqueta = () => (
  <AudioButton text="Era uma vez uma gaivota que vivia na Ericeira." label="Ouvir a história" />
);

/** Beside a single sentence in a dictation drill. */
export const OuvirAFrase = () => (
  <AudioButton text="Onde fica a paragem do autocarro?" label="Ouvir a frase" />
);

/** Icon-only — how it appears in dense lists, e.g. every row of a conjugation table. */
export const SoIcone = () => <AudioButton text="Bom dia, tudo bem?" />;

/** A row of words, each with its own player — the vocabulary-list composition. */
export const NumaLista = () => (
  <div className="space-y-2">
    {[
      ["o pequeno-almoço", "breakfast"],
      ["a paragem", "the (bus) stop"],
      ["o talho", "the butcher's"],
    ].map(([pt, en]) => (
      <div key={pt} className="flex items-center gap-3">
        <AudioButton text={pt} />
        <span className="font-display text-[15px]">{pt}</span>
        <span className="text-xs text-ink-soft">{en}</span>
      </div>
    ))}
  </div>
);
