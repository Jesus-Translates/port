import { Markdown } from "portuguese-hub";

/**
 * The text-heavy component — this is where the app's Fraunces/Inter pairing
 * and the `.prose-basic` rhythm either show up or don't.
 *
 * Content mirrors the two real sources: Sandra's spoken-feedback replies
 * (missões, falar) and the written unit notes (workbook, homework).
 */

/** Sandra's feedback after a spoken answer — the app's most frequent Markdown. */
export const FeedbackDaSandra = () => (
  <Markdown>{`Boa! Percebi-te bem. Só três coisas:

- **"Tou"** — na escrita fica *estou*, mas em conversa ninguém repara.
- Disseste *"eu vou para a praia"*. Também podes dizer **"vou à praia"** — mais natural aqui.
- O **r** de *praia* saiu curto. Tenta alongá-lo: *pr-r-raia*.

Para a próxima, tenta contar-me o que fizeste **ontem** — vamos treinar o pretérito.`}</Markdown>
);

/** A unit note: headings, a table of forms, and a callout. */
export const NotaDeUnidade = () => (
  <Markdown>{`## Estar a + infinitivo

Em Portugal, uma ação a decorrer usa **estar a + infinitivo** — não o gerúndio.

| Português europeu | O que se ouve no Brasil |
| --- | --- |
| Estou a comer | Estou comendo |
| Estás a ouvir? | Está ouvindo? |
| Estamos a chegar | Estamos chegando |

> Se disseres *"estou comendo"* cá, toda a gente percebe — mas soa a telenovela.

### Quando treinar

Usa-o sempre que estiveres a descrever o momento: ao telefone, a chegar
atrasado, ou a explicar porque não atendeste.`}</Markdown>
);

/** Short inline copy — instructions above a homework task. */
export const InstruçõesCurtas = () => (
  <Markdown>{`Ouve a frase e escreve-a. Podes ouvir **as vezes que precisares** —
o que conta é acertares nos acentos.`}</Markdown>
);
