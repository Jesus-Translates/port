import { AudioButton, Recorder } from "portuguese-hub";

/**
 * Recorder shown the way falar-modes.tsx actually composes it: inside a card,
 * under the sentence it refers to, next to a player for the model audio.
 *
 * On its own the component is a single "Gravar" button whose resting state is
 * identical in both modes — `mode`, `target` and `prompt` only become visible
 * after a recording. Three bare buttons would be three identical cards, so the
 * context is the story: read-aloud shows the sentence to say, open-answer
 * shows the question being answered.
 *
 * `autoStart` is not previewed — it opens the microphone on mount, which in a
 * headless capture is a permission prompt and an empty card.
 */

function Card({
  pt,
  en,
  eyebrow,
  children,
}: {
  pt: string;
  en: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <div className="text-2xs font-semibold tracking-wide text-ink-faint uppercase">
              {eyebrow}
            </div>
          ) : null}
          <p className="mt-1 font-display text-lg">{pt}</p>
          <p className="mt-0.5 text-sm text-ink-faint">{en}</p>
        </div>
        <AudioButton text={pt} />
      </div>
      {children}
    </div>
  );
}

/** Read-aloud drill: the learner says `target`, and gets a pronunciation score. */
export const LerEmVozAlta = () => (
  <Card
    pt="Queria um café e um pastel de nata, por favor."
    en="I'd like a coffee and a custard tart, please."
  >
    <Recorder mode="read" target="Queria um café e um pastel de nata, por favor." />
  </Card>
);

/** A longer target — the same control, a harder sentence to get through. */
export const FraseLonga = () => (
  <Card
    pt="Ao sábado de manhã vamos ao mercado de Torres Vedras comprar peixe."
    en="On Saturday mornings we go to the Torres Vedras market to buy fish."
  >
    <Recorder
      mode="read"
      target="Ao sábado de manhã vamos ao mercado de Torres Vedras comprar peixe."
    />
  </Card>
);

/** Open answer: the learner replies freely and Sandra responds to the content. */
export const RespostaLivre = () => (
  <Card
    eyebrow="Responde à Sandra"
    pt="O que costumas tomar ao pequeno-almoço?"
    en="What do you usually have for breakfast?"
  >
    <Recorder mode="open" prompt="O que costumas tomar ao pequeno-almoço?" />
  </Card>
);
