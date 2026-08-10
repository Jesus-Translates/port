# design-sync notes — Portuguese Hub → "PORT DS"

Project: `8ad5d74c-1264-4995-a125-fb4680f6772a`
(https://claude.ai/design/p/8ad5d74c-1264-4995-a125-fb4680f6772a)

## What this repo is, for sync purposes

A Next.js **application**, not a component library. There is no `dist/`, no
published package, and no Storybook. Everything below exists because of that
mismatch — none of it is optional.

## Scope: 5 of ~65 components

`.design-sync/entry.tsx` is a hand-curated entry. Most components in
`components/` call server actions or `getDb()` and cannot run in a browser
bundle at all (`spend-chip` reads live spend through drizzle; `game-shell` and
`lesson-complete` pull in `unit-return`).

**Do not add a component to the entry without checking its import graph first.**
Two specific traps already hit:

- **`next/link` breaks the bundle.** `ListeningElsewhere` was originally in
  scope; it dragged Next's client router in, and the bundle died at load with
  `ReferenceError: process is not defined` (11 undefined `process.env.__NEXT_*`
  reads). Every component then failed the `[BUNDLE_EXPORT]` gate. It is also a
  props-less fixed list of podcast links — content, not a composable part — so
  it was dropped on both grounds. Anything importing `next/link`, `next/image`,
  or `next/navigation` will do the same.
- `cfg.replaces` does **not** help here — it maps elements to component names
  for previews, not module aliases. `cfg.libOverrides` forks converter scripts,
  not app modules. There is no module-aliasing knob.

## The build has three stages, and the order matters

`cfg.buildCmd` = `npm run build && node .design-sync/prepare-css.mjs && node .design-sync/prepare-types.mjs`

1. **`npm run build`** — produces the compiled CSS and fonts.
2. **`prepare-css.mjs`** — stages `.design-sync/css/app.css` + `.design-sync/media/`.
   `cfg.cssEntry` must point at the **compiled** stylesheet, never
   `app/globals.css`: the source is raw Tailwind v4 (`@import "tailwindcss"` +
   an unprocessed `@theme`), which ships *zero* `.card`/`.btn-primary`/`.chip`
   and no utilities. The compiled file is content-hash-named, hence the script.
   It also copies the fonts into `media/` **beside** the CSS, because Next emits
   `url(../media/<hash>.woff2)` — flatten that and you get `[FONT_DANGLING]` and
   every design renders in a fallback face.
3. **`prepare-types.mjs`** — emits `types/` and rewrites `@/` to relative.
   Without a `.d.ts` tree every component shipped
   `{ [key: string]: unknown }` — no API for the design agent at all.
   `findTypesRoot()` probes `types/` before `lib/`, which is why the output goes
   there and no converter code needed changing.

Both `types/` and `.design-sync/css|media/` are gitignored build artifacts.

### Two non-obvious type gotchas

- **`incremental` must stay off** in `tsconfig.types.json`. The app's tsconfig
  turns it on; inherited, a wiped `types/` plus a fresh `.tsbuildinfo` emits
  nothing and the converter silently reads no props.
- **Object-typed props print as their alias name.** `Tense` (a literal union)
  inlines fine, but `AnswerCheck` (an object alias) emitted as a bare, dangling
  `AnswerCheck` in the shipped `.d.ts`. Fixed with `cfg.dtsPropsFor.AnswerDiff`,
  which inlines the shape structurally. **That override is hand-maintained — if
  `AnswerCheck` or `DiffTok` changes in `lib/diff.ts`, update it.**

Components expose their props as exported `<Name>Props` types, re-exported
through `entry.tsx`. Both halves are required: the converter resolves props via
the entry, so a Props type that stops at the component file is invisible.

## Two real app bugs this sync surfaced

Worth knowing that the render gate earns its keep:

1. **Invalid regex from literal combining marks.** Ten files wrote
   `.replace(/[<U+0300>-<U+036F>]/g, "")` with the *literal* combining
   characters. Served without an explicit charset they mojibake to
   `/[Ì€-Í¯]/` — "Range out of order in character class" — which threw at
   bundle load. All now use the escaped `[̀-ͯ]`. **Keep it escaped**;
   invisible combining marks in source are unreviewable.
2. **`.prose-basic` had no table rules and no heading weight.** Tailwind
   preflight resets `h1`/`h2` weight, and there were no `th`/`td` rules at all,
   so unit-note tables rendered as run-together text
   ("Português europeuO que se ouve no Brasil"). Fixed in `app/globals.css`.
   This affected all 151 unit notes in production, not just previews.

## Previews

All 5 authored in `.design-sync/previews/` (committed; the converter never
touches them). 17 cells, all graded `good`.

- **`Recorder` must be composed inside a card with its sentence.** On its own
  it is one "Gravar" button whose resting state is identical in both modes, so
  three bare stories were three identical cards. Mirrors `falar-modes.tsx`.
- **`VerbConjugator` needs `cardMode: "column"` AND `viewport: "1200x1150"`.**
  Column alone still clipped the conjugation table — the component's whole
  payoff — right after the first row.
- `AudioButton` previews pass `text`, never `entryId`/`quizId`: those fetch
  cached audio by database id and resolve to nothing outside the app.
- `Recorder`'s `autoStart` is deliberately unpreviewed — it opens the mic on
  mount, which in a headless capture is a permission prompt and a blank card.

Content is real pt-PT drill material. Keep it that way: `foo`/`test` in a card
teaches the design agent the wrong register, and this DS is *about* register.

## Re-sync risks (the watch-list)

- `npm i --no-save playwright` + `npx playwright install chromium` is needed for
  the render check; it is deliberately **not** in `package.json` (one-off
  tooling), so a fresh clone or an `npm ci` drops it. Without it validate exits
  on `[RENDER_SKIPPED]` and the render gate never runs.
- `ds-bundle/`, `.ds-sync/`, `.design-sync/` are eslint-ignored — the bundle is
  compiled output plus vendored React and produced 57 lint errors before that.
- If `AnswerCheck`/`DiffTok` change, update `cfg.dtsPropsFor.AnswerDiff`.
- If a new component is scoped in, check its import graph for `next/*` first.
- Known-clean warn list: none outstanding. `[FONT_DANGLING]` and
  `[CSS_IMPORT_MISSING]` are both resolved by `prepare-css.mjs`; if either
  returns, that script's output layout is what broke.
