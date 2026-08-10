# Portuguese Hub — design conventions

A European Portuguese learning app for families living in Portugal. Read this
before composing a screen: most of the look comes from the CSS layer below, not
from the five React components.

## Language: European Portuguese, always

Every string you write in a design is **pt-PT**, never pt-BR. This is the single
most visible way a design here goes wrong, and it is invisible to anyone who
doesn't speak both.

| Use | Not |
| --- | --- |
| pequeno-almoço | café da manhã |
| autocarro | ônibus |
| casa de banho | banheiro |
| telemóvel | celular |
| comboio | trem |
| estou **a** comer | estou comendo |
| Vais? / Tens? (tu) | Você vai? / Você tem? |

Address the learner as **tu**, not *você*. Continuous action is **estar a +
infinitive**, never the gerund. Use *ó* / *à* / *ã* correctly — the app grades
accents, so a mis-accented mock undermines the whole premise.

Bilingual pairs are the norm: Portuguese in `font-display` at the larger size,
the English gloss underneath in `text-sm text-ink-faint`.

## The CSS layer is the design system

Compose with these classes before reaching for utilities. They ship in
`styles.css` and are what makes a screen look like this app:

- `.card` — the default container for anything grouped. Almost every screen is a
  stack of these.
- `.btn-primary` (olive, the main action) · `.btn-ghost` (secondary) ·
  `.btn-terra` (destructive only)
- `.chip` — small status/label pill. Used heavily for levels, tenses, plans.
- `.input` — text inputs and selects.
- `.label` — the small uppercase eyebrow above a group.
- `.prose-basic` — any block of Markdown-derived rich text.
- `.tap-44` — guarantees a 44px touch target on a control that renders smaller.

### Tokens

Colours: `olive` (primary/brand), `terra` / `terra-dark` / `terra-pale`
(errors, corrections, warmth), `sage` / `sage-light` / `sage-pale` (success,
gentle affirmation), `azul` / `azul-pale` (links, info), `sand` (borders),
`cream` (subtle fills), `paper` (surface), `ink` / `ink-soft` / `ink-faint`
(text, in descending strength).

Type: `font-display` is **Fraunces** — headings, and every Portuguese phrase the
learner is meant to read aloud. Body text is **Inter**. Never set a Portuguese
target sentence in body font; the display face is how the app signals "this is
the thing to say".

Semantic colour matters here: **terra means a correction, not a failure.** The
app never scolds — a wrong answer gets terra marking plus an encouraging line.
Don't design red error states.

## Mobile first

This is used on phones, standing in a kitchen in Portugal. Design at 390px and
let it grow. Controls get `.tap-44`. Nothing important sits behind a hover.

## The five components

Everything on `window.PortDS` is genuinely presentational and safe to compose:

- **`Markdown`** — all rich text. Handles headings, lists, tables and
  blockquotes with the app's rhythm already applied.
- **`AudioButton`** — a play button for a pt-PT phrase. Pass `text` for a
  literal string. (`entryId` / `quizId` fetch cached audio by database id and
  won't resolve in a design.) Use `label` for a primary action, omit it for the
  icon-only form used in dense lists.
- **`Recorder`** — `mode="read"` scores pronunciation against `target`;
  `mode="open"` sends a free spoken answer to `prompt`. At rest it is one
  button, so **always compose it under the sentence it refers to** — a bare
  Recorder tells the user nothing.
- **`AnswerDiff`** — shows a wrong answer word by word against the right one.
  The point is showing *which* word slipped; never replace it with "the correct
  answer was X".
- **`VerbConjugator`** — a full-width reference surface. Give it its own row.

Sandra is the app's tutor persona — a friendly pt-PT teacher with a sense of
humour. Copy attributed to her is warm and a bit playful, never clinical.

The rest of this app's ~60 components are bound to the database or to server
actions and can't render in a design; build those surfaces from the classes and
tokens above rather than expecting a component.
