import { AnswerDiff } from "portuguese-hub";

/**
 * The three verdicts a learner actually sees, plus the blank-answer case.
 *
 * Content is real drill material: pt-PT, tu register, the kind of sentence
 * this app grades. The whole point of the component is showing WHICH word
 * slipped, so each story marks a different failure.
 */

const same = (text: string) => ({ text, status: "same" as const });
const wrong = (text: string) => ({ text, status: "wrong" as const });
const missing = (text: string) => ({ text, status: "missing" as const });

/** Right words, slipped accent — the most common near-miss. */
export const AcentoEscorregou = () => (
  <AnswerDiff
    nearMiss
    check={{
      verdict: "quase",
      attempt: [same("Esta"), same("a"), same("chover"), same("muito"), same("hoje")],
      target: [same("Está"), same("a"), same("chover"), same("muito"), same("hoje")],
    }}
  />
);

/** Everything written is right; the answer just stops early. */
export const RespostaIncompleta = () => (
  <AnswerDiff
    check={{
      verdict: "incompleto",
      attempt: [same("Queria"), same("um"), same("café")],
      target: [
        same("Queria"),
        same("um"),
        same("café"),
        missing("e"),
        missing("um"),
        missing("pastel"),
        missing("de"),
        missing("nata"),
      ],
    }}
  />
);

/** A real mistake — the infinitive after "gosto de" became a finite verb. */
export const PalavraErrada = () => (
  <AnswerDiff
    check={{
      verdict: "errado",
      attempt: [same("Eu"), same("gosto"), same("de"), wrong("falo"), same("português")],
      target: [same("Eu"), same("gosto"), same("de"), wrong("falar"), same("português")],
    }}
  />
);

/** Nothing typed — the component says so rather than rendering an empty row. */
export const FicouEmBranco = () => (
  <AnswerDiff
    check={{
      verdict: "errado",
      attempt: [],
      target: [same("Bom"), same("dia,"), same("como"), same("estás?")],
    }}
  />
);
