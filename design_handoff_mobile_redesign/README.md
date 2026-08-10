# Handoff: Portuguese Hub — Mobile Redesign ("O Caminho")

## Overview

A full redesign of the Portuguese Hub mobile surface (web app, used on phones). Nine
screens: onboarding, home/today, the lesson drill loop (5 exercise types + completion),
vocabulary browser, verb conjugator, Sandra chat, progress/streak/league, family
multi-learner view, and profile/settings.

Two problems drove the work:

1. **"Generic, not nice looking."** The app read as a stack of white cards on cream with
   no branded surface. The fix is a deep olive **azulejo-patterned header band** on every
   screen, **Fraunces at display scale** for all Portuguese and all numerals, and a
   **calçada portuguesa** (Portuguese mosaic pavement) progression path — diamond stones
   on a cobble trail — instead of a lesson list.
2. **"Doesn't flow from lesson to lesson."** The fix is a **chained completion screen**:
   a lesson never ends on a list. It ends on an olive hand-off card naming and timing the
   next stone ("A seguir: 6 palavras para rever · 2 min · desbloqueia a pedra 'No mercado'")
   with a single primary button. Implement this — it is the core behavioural change.

Gamification is deliberately loud in *mechanics* and quiet in *palette*: streak, daily-goal
ring, XP, league, word of the day, SRS due-queue, family weekly challenge — all rendered in
olive / terra / azul, never neon. **Terra is a correction colour, never a failure colour.**
Nothing in this design scolds.

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype showing
intended look and behaviour, **not production code to copy directly**.

The design is authored as a "Design Component": a single `.dc.html` file with an HTML
template plus a JavaScript logic class, rendered by a runtime (`support.js`) that is part
of the design tool, not part of your app. Do not try to port that runtime.

**The task is to recreate these screens in the Portuguese Hub codebase** (Next.js / React,
Tailwind, the `portuguese-hub` component library) using its established patterns. The
prototype already composes the five real PORT DS components — `AudioButton`, `Recorder`,
`AnswerDiff`, `VerbConjugator`, `Markdown` — so those should be dropped in as-is from the
library rather than rebuilt.

## Fidelity

**High-fidelity.** Final colours, typography, spacing and interactions. Recreate
pixel-accurately using the codebase's existing Tailwind theme and CSS classes.

Two caveats:

- **Not a recreation of your current screens.** The attached `port.robertjeremiah.com`
  folder was not reachable from the design environment, so layouts were derived from the
  PORT DS tokens, its five components and its written conventions. Where a layout exists in
  the live app and differs, treat this as a proposal and reconcile.
- **One placeholder.** The Drops-style rapid visual word drill is *not* in the prototype —
  it needs real photography. Everything else is complete.

## Screens / Views

The prototype renders one screen at a time inside a 402×874 iPhone frame. `screen` state
drives which one. Screens 2–8 share a bottom tab bar; the lesson player and onboarding are
full-screen and hide it.

---

### 1. Onboarding

**Purpose:** First run — set the promise, pick who in the family is learning.

**Layout:** Full-bleed olive azulejo background (see Design Tokens → Azulejo). Column,
`padding: 78px 26px 0`, footer pinned at bottom with `padding: 22px 26px 34px`.

**Components:**
- **Logo mark** — 70×70, `border-radius: 22px`, `background: #c2622e`,
  `transform: rotate(45deg)`, `box-shadow: 0 5px 0 #9e4c1f`, `margin: 0 0 40px 12px`.
  Contains the letter **ç** in Fraunces 28px/600, counter-rotated `rotate(-45deg)`.
  (The ç is the mark — it is the letter English speakers cannot place.)
- **Headline** — Fraunces 40px/1.05, weight 600, `letter-spacing: -.025em`, `#faf7f0`.
  Copy, with hard line breaks: "Português / a sério. / Aqui em casa."
- **Subhead** — Inter 15.5px/1.6, `opacity: .72`, `max-width: 300px`, `text-wrap: pretty`.
  "O português de Portugal — o que se fala no talho, no autocarro e à porta da escola.
  Não o dos livros."
- **Eyebrow** — `.label` class, colour overridden to `rgba(250,247,240,.55)`. "Quem vai aprender?"
- **Learner rows** — column, `gap: 9px`. Each row `padding: 14px 16px`,
  `border-radius: 16px`, 38×38 avatar tile at `border-radius: 13px` with Fraunces 16px/600
  initial, name at Inter 15px/600, sub-line at 12px `opacity: .65`.
  - *Selected* — `background: rgba(250,247,240,.16)`, `border: 1.5px solid rgba(250,247,240,.4)`,
    avatar `#faf7f0` on `#5d6650` text, trailing 19px check icon.
  - *Unselected* — `background: rgba(250,247,240,.08)`, `border: 1.5px solid rgba(250,247,240,.16)`,
    avatar `rgba(250,247,240,.2)`.
  - *Add* — `border: 1.5px dashed rgba(250,247,240,.28)`, no fill, 38×38 outlined "+" tile,
    label "Juntar alguém da família" at `opacity: .75`.
  - Copy: "Rob — Adulto · já percebe um pouco" (selected); "Mia — 9 anos · na escola portuguesa".
- **Primary CTA** — full width, `min-height: 52px`, `border-radius: 16px`,
  `background: #faf7f0`, `color: #2b271f`, Inter 15.5px/600. "Vamos lá →"
- **Secondary** — centred 12.5px `opacity: .5`. "Já tens conta? Entrar"

---

### 2. Home / Hoje

**Purpose:** The daily landing. Answers "what do I do right now" in one screen without a decision.

**Layout:** Vertical scroll. Olive azulejo header band, then `padding: 0 20px` content
sections separated by `26px`.

**2a. Header band**
- `padding: 58px 20px 26px` (58px top clears the status bar), `border-radius: 0 0 28px 28px`,
  full azulejo background (all three pattern layers + `#5d6650`), `color: #faf7f0`.
- **Date eyebrow** — Inter 12.5px/600, `letter-spacing: .06em`, uppercase, `opacity: .62`.
  "SÁBADO · DIA DE MERCADO" — this is *contextual*, it names what today is for.
- **Greeting** — Fraunces 29px/1.1, weight 600, `letter-spacing: -.015em`. "Bom dia, {name}"
- **Avatar button** — 42×42, `border-radius: 14px`, `background: rgba(250,247,240,.12)`,
  `border: 1.5px solid rgba(250,247,240,.28)`, Fraunces 16px/600 initial. Navigates to Profile.
- **Two stat tiles** — flex row `gap: 10px`, each `flex: 1`, `padding: 13px 14px`,
  `border-radius: 16px`, `background: rgba(250,247,240,.13)`.
  - *Streak* — flame icon (13px, fill `#e8a077`), label "FOGO" at 11px/600
    `letter-spacing: .09em` uppercase `opacity: .7`; value Fraunces 27px/600 "13" with
    "dias" at 13px/400 `opacity: .6`.
  - *Daily goal* — label "META DE HOJE"; a 34×34 progress ring built as
    `background: conic-gradient(#e8a077 0 62%, rgba(250,247,240,.18) 62% 100%)` with a
    23×23 `#5d6650` disc centred to punch the hole; value Fraunces 21px/600 "31" + "/50"
    at 12px/400 `opacity: .6`.

**2b. Today's contextual lesson card** (the primary action)
- Full-width button, `border-radius: 20px`, `border: 1px solid #e6dcc6`, `background: #fff`,
  `box-shadow: 0 2px 10px rgba(43,39,31,.05)`, `overflow: hidden`, left-aligned.
- Body `padding: 17px 18px 16px`: a `.chip` overridden to `background:#f7e6d9; color:#9e4c1f`
  reading "Contextual", then "6 min" at 11.5px `#a39b88`; title Fraunces 22px/1.2 weight 600
  `letter-spacing: -.01em` "Ao balcão do café"; body Inter 13.5px/1.5 `#6f6858`
  "É sábado — vais ao mercado e ao café. Estas 12 frases são as que vais mesmo precisar hoje.";
  then an 8px `border-radius: 99px` `#f2ecdf` track with an olive fill and "0 / 12" at 11.5px.
- Footer bar `background: #5d6650`, `color: #faf7f0`, `padding: 13px 18px`, Inter 14.5px/600,
  space-between: "Começar a lição" · "→".

**2c. The calçada path** — the signature element
- Eyebrow `.label` "O teu caminho" with "Unidade 3 · Na rua" at 11.5px `#a39b88` right-aligned.
- Nine alternating rows: **stone, trail, stone, trail, stone, trail, stone, trail, stone**.
- **Every row is `display:flex; justify-content:center` with NO transform.** The horizontal
  offset lives on the *inner* element — the stone column, or an inner cobble row. This matters:
  putting `translateX` on the full-width row creates horizontal overflow inside the phone.
  Give the scroll container `overflow-x: clip`.
- **Stone (completed)** — 62×62, `border-radius: 18px`, `background: #5d6650`,
  `transform: rotate(45deg)`, `box-shadow: 0 3px 0 #4a5140`. A 24px check icon inside,
  `stroke: #faf7f0`, `stroke-width: 2.8`, counter-rotated `rotate(-45deg)`.
  Caption below (outside the rotation): Inter 11.5px/600 `#6f6858`, `margin-top: 4px`.
- **Stone (current)** — 78×78, `border-radius: 22px`, `background: #c2622e`,
  `transform: rotate(45deg)`, `box-shadow: 0 4px 0 #9e4c1f`, and
  `animation: ph-pulse 2.4s ease-out infinite` (see Interactions). Label inside is Fraunces
  15px/600 `#faf7f0`, counter-rotated. Caption below at 12px/600 `#9e4c1f`, `margin-top: 6px`.
  Tapping it starts the lesson.
- **Stone (locked)** — 62×62, `background: #f2ecdf`, `border: 1.5px solid #e6dcc6`,
  rotated; 20px padlock icon `stroke: #a39b88` counter-rotated. Caption 11.5px `#a39b88`.
- **Cobble trail** — inner flex row, `gap: 9px`, three 7×7 squares each `rotate(45deg)`.
  `#e6dcc6` on completed segments, `#f2ecdf` on locked ones. Row padding `12px 0`
  (14px top on the segment straight after the current stone).
- Offsets applied to the inner elements, top to bottom:
  `-92px` (stone "Bom dia"), `-46px` (trail), `+14px` (stone "No autocarro"), `+48px` (trail),
  `+78px` (stone "Café" / current), `+30px` (trail), `-24px` (stone "No mercado"),
  `-62px` (trail), `-96px` (stone "No talho").
- Stone captions in order: Bom dia · No autocarro · **Ao balcão · agora** · No mercado · No talho.
- **Alternative layout available:** a plain vertical list (rows at `padding: 13px 15px`,
  `border-radius: 14px`, sage-pale for done / terra for current / cream for locked). The
  prototype exposes this as a `pathStyle` prop with values `caminho` | `lista`. Ship the
  calçada; keep the list as an accessibility/reduced-motion fallback.

**2d. Word of the day**
- `.label` "Palavra do dia". Card `border-radius: 20px`, `background: #e3eaf6`, `padding: 18px`,
  flex row `gap: 16px`. Word Fraunces 25px/1.15 weight 600 `letter-spacing: -.01em`
  ("a saudade"); gloss 13px `#33589b` `opacity: .8`. Trailing icon-only `AudioButton`.

**2e. Family strip**
- `.label` "A família hoje" + "Ver todos" link at 12px `#33589b`.
- Three tiles, `flex: 1`, `gap: 9px`, `border-radius: 16px`, `border: 1px solid #e6dcc6`,
  `background: #fff`, `padding: 13px 11px`, centred. 36×36 avatar tile
  (`border-radius: 12px`, Fraunces 14px/600) — Rob on `#eef0e9`/`#5d6650`, Mia on
  `#f7e6d9`/`#9e4c1f`, Tomás on `#e3eaf6`/`#33589b`. Name 12.5px/600; XP 11px/600 `#c2622e`,
  or "Por fazer" at 11px `#a39b88` when nothing done.

---

### 3. Lesson player — the drill loop

**Purpose:** The core session. Six steps, indices 0–5.

**Persistent chrome (steps 0–4):**
- **Top bar** — `padding: 60px 20px 14px`, `position: sticky; top: 0`, `background: #faf7f0`.
  32×32 close button (`border-radius: 10px`, `border: 1px solid #e6dcc6`, `background: #fff`,
  `color: #6f6858`, "✕"); a `flex: 1` progress track (10px, `border-radius: 99px`,
  `background: #e6dcc6`) whose olive fill is `width: (step/5)*100%` with
  `transition: width .4s cubic-bezier(.3,.8,.3,1)`; an XP readout — flame icon + Fraunces
  15px/600 `#c2622e`, incrementing **+7 per step**.
- **Footer** — `position: sticky; bottom: 0`, `padding: 14px 20px 30px`,
  `border-top: 1px solid #f2ecdf`. Optional feedback banner, then the primary button.
  - *Primary enabled* — `background: #5d6650`, `color: #faf7f0`, `min-height: 52px`,
    `border-radius: 16px`, Inter 15.5px/600, `transition: all .16s ease`.
  - *Primary disabled* — `background: #f2ecdf`, `color: #a39b88`, `cursor: not-allowed`.
  - Label is "Verificar" until checked, then "Continuar".
  - *Feedback banner* — `padding: 12px 15px`, `border-radius: 13px`, 13.5px/1.45 weight 500,
    `animation: ph-rise .2s ease-out`. Correct: `background: #eef0e9`, `color: #4a5140`.
    Correction: `background: #f7e6d9`, `color: #9e4c1f`.
- Every step body gets `padding: 18px 20px 0` and `animation: ph-rise .3s ease-out`.

**Step 0 — Ouve e escolhe (listen & choose)**
- `.label` "Ouve e escolhe". A card (`border-radius: 20px`, `border: 1px solid #e6dcc6`,
  `background: #fff`, `padding: 26px 20px`, centred column `gap: 16px`) containing
  `AudioButton` with `label="Ouvir de novo"` and `text="Onde fica a paragem do autocarro?"`,
  plus "Toca para repetir · fala de Lisboa" at 12.5px `#a39b88`.
- Four option buttons, column `gap: 10px`. **Option button spec (reused in step 4):**
  `width: 100%`, left-aligned, `padding: 15px 17px`, `border-radius: 15px`,
  `min-height: 56px`, `transition: all .16s ease`, label Inter 15px/500.
  - idle — `border: 1.5px solid #e6dcc6`, `background: #fff`, `color: #2b271f`
  - selected — `border: 1.5px solid #2b271f`, `background: #fff`
  - correct — `border: 1.5px solid #5d6650`, `background: #eef0e9`
  - incorrect — `border: 1.5px solid #c2622e`, `background: #f7e6d9`, `color: #9e4c1f`
- Options: "Where is the butcher's?" / "What time is the market?" /
  **"Where is the bus stop?" (correct, index 2)** / "How much is the coffee?"

**Step 1 — Constrói a frase (word bank)**
- `.label` "Constrói a frase". Prompt "I'd like a coffee, please." at 20px/1.35;
  hint "Toca nas palavras pela ordem certa." at 13px `#a39b88`.
- **Answer tray** — `min-height: 96px`, `border-radius: 16px`, `background: #f2ecdf`,
  `border: 1px dashed #e6dcc6`, `padding: 14px`, wrapping flex `gap: 8px`,
  `align-content: flex-start`. Tapping a placed word removes it.
- **Word tiles** — Fraunces 17px/500, `padding: 9px 15px`, `border-radius: 11px`.
  Available: `background: #fff`, `border: 1px solid #e6dcc6`, `box-shadow: 0 2px 0 #e6dcc6`.
  Spent: `background` and `border` and `color` all `#f2ecdf` (a ghost hole in place),
  `pointer-events: none`. Placed tiles in the tray use `box-shadow: 0 1px 2px rgba(43,39,31,.06)`.
- Bank order (deliberately scrambled, two distractors):
  `['faz','Queria','favor.','um','se','café,','tomo','muito']`.
- Target: `Queria um café, se faz favor.` — graded by exact joined-string match.

**Step 2 — Escreve em português (type it, accent-graded)**
- `.label` "Escreve em português". Prompt "I'm eating breakfast." at 20px/1.35;
  hint "Cuidado com os acentos — contam." at 13px `#a39b88`.
- `.input` with Fraunces 17px, `padding: 14px 16px`, placeholder "Escreve aqui…".
- Target: `estou a comer o pequeno-almoço` (compared lowercased, punctuation stripped).
- On a miss: a `#f7e6d9` `border-radius: 16px` `padding: 16px` panel with
  "Quase! Faltou o acento." at 12.5px/600 `#9e4c1f`, then the real **`AnswerDiff`**
  (`nearMiss`, verdict `quase`, attempt `pequeno-almoco` vs target `pequeno-almoço` marked
  `wrong`, all other tokens `same`), then a Sandra line at 13px/1.55 `#6f6858`:
  "O *é* aberto muda tudo — **estou a comer**, nunca *comendo*."

**Step 3 — Lê em voz alta (pronunciation)**
- `.label` "Lê em voz alta". Card `border-radius: 20px`, `border: 1px solid #e6dcc6`,
  `background: #fff`, `padding: 24px 20px`.
- Target sentence Fraunces **26px**/1.25 weight 500 `letter-spacing: -.01em`:
  "Queria um café e um pastel de nata, se faz favor." Gloss 13.5px `#a39b88`.
- A `border-top: 1px solid #f2ecdf` divider, then icon-only `AudioButton` + "Ouve primeiro,
  depois grava" at 12.5px `#a39b88`.
- Below the card: `Recorder mode="read"` with the same `target`. **The Recorder must sit
  under the sentence it scores** — never floating alone.
- No "Verificar" here; primary reads "Continuar" and is always enabled.

**Step 4 — Diálogo (Practice-Portuguese style)**
- `.label` "No café · diálogo". Two turns, `gap: 12px`:
  - Speaker turn — 34×34 avatar (`border-radius: 11px`, `background: #e3eaf6`,
    `color: #33589b`, Fraunces 14px/600, "E"), then a bubble (`flex: 1`,
    `border-radius: 14px`, `border: 1px solid #e6dcc6`, `background: #fff`,
    `padding: 13px 15px`) with Fraunces 17px/1.35 "Boa tarde! O que deseja?", gloss 12.5px
    `#a39b88`, and an icon-only `AudioButton`.
  - Learner turn — avatar `#eef0e9`/`#5d6650` "Tu"; bubble
    `border: 1px dashed #c7ccbc`, `background: #eef0e9`, Fraunces 17px `#5d6650`, "…a tua vez".
- Answer panel — `border-radius: 16px`, `background: #f2ecdf`, `padding: 15px 16px`,
  heading "O que respondes?" at 12.5px/600 `#6f6858`, then two option buttons using the
  step-0 spec but overridden to Fraunces 16px, `min-height: 50px`, `padding: 12px 15px`.
- Options: **"Queria um galão, se faz favor." (correct)** / "Eu quero pedir o café agora."
- Correct feedback: "Isso mesmo! Um galão é o pedido certo ao balcão."

**Step 5 — Completion + the hand-off (the flow fix)**
- No footer, no progress bar interaction. `animation: ph-rise .35s ease-out`.
- **Badge** — 96×96, `border-radius: 28px`, `background: #5d6650`, `rotate(45deg)`,
  `animation: ph-pop .5s cubic-bezier(.2,.9,.3,1.4) both`; 40px check icon
  `stroke: #faf7f0`, `stroke-width: 2.6`, counter-rotated.
- **Title** Fraunces 32px/600 `letter-spacing: -.01em` "Boa, {name}!";
  sub "No café · 5 de 5 certas" at 14.5px `#6f6858`.
- **Three stat tiles** — `flex: 1`, `gap: 10px`, `border-radius: 16px`, `padding: 14px 12px`,
  centred. Value Fraunces 26px/600, label 11px/600 uppercase `letter-spacing: .08em`.
  `#f7e6d9`/`#9e4c1f` "+38 XP" · `#eef0e9`/`#5d6650` "13 DIAS" · `#e3eaf6`/`#33589b` "6 NOVAS".
- **Sandra note** — `border-radius: 18px`, `border: 1px solid #e6dcc6`, `background: #fff`,
  `padding: 16px`, 12.5px/1.55 `#6f6858`: "**Sandra:** O *pastel de nata* saiu-te perfeito.
  O *café* ainda soa a brasileiro — mais fechado, sim?"
- **THE HAND-OFF CARD** — pinned to the bottom (`margin-top: auto`).
  `border-radius: 20px`, `background: #5d6650`, `padding: 18px 18px 16px`, `color: #faf7f0`.
  Eyebrow "A SEGUIR" at 10.5px/600 `letter-spacing: .14em` uppercase `opacity: .65`;
  title Fraunces 21px/1.2 weight 600 "6 palavras para rever"; meta 13px `opacity: .72`
  "2 min · desbloqueia a pedra 'No mercado'"; then a full-width `min-height: 48px`
  `border-radius: 14px` `background: #faf7f0` `color: #2b271f` button "Continuar →" that
  **starts the next session immediately**.
- Below it, a low-emphasis escape: "Parar por hoje", `min-height: 44px`, no border,
  `color: #a39b88`, 13.5px.

---

### 4. Palavras — vocabulary browser + verb conjugator

**Purpose:** Reference plus the SRS review entry point.

**Layout:** Olive azulejo header (`padding: 58px 20px 18px`, two-layer dot pattern only,
`border-radius: 0 0 28px 28px`) with title "Palavras" at Fraunces 27px/600
`letter-spacing: -.015em`, then a segmented control.

- **Segmented control** — `background: rgba(250,247,240,.13)`, `padding: 4px`,
  `border-radius: 14px`, two `flex: 1` buttons at `min-height: 38px`,
  `border-radius: 11px`, Inter 13.5px/600. Active: `background: #faf7f0`, `color: #5d6650`.
  Inactive: transparent, `color: rgba(250,247,240,.72)`. Tabs "Vocabulário" / "Verbos".

**Vocabulário tab** (`padding: 18px 20px 30px`)
- **SRS due card** — full-width button, `border-radius: 18px`, `background: #f7e6d9`,
  `padding: 16px 18px`, flex `gap: 14px`. Count Fraunces **34px**/600 `#9e4c1f` "24";
  "palavras para rever" at 14.5px/600; "Repetição espaçada · 4 min" at 12.5px `#9e4c1f`
  `opacity: .85`; trailing "→" at 18px `#9e4c1f`. Starts a review session.
- `.input` search, placeholder "Procurar…", 14.5px.
- Grouped lists under `.label` headings "No café · 12 palavras" and
  "No mercado · 18 palavras".
- **Vocabulary row** — flex `gap: 13px`, `padding: 11px 4px`,
  `border-bottom: 1px solid #f2ecdf`. Icon-only `AudioButton`; then Portuguese in
  **Fraunces 16.5px**/1.25 weight 500 with the English gloss at 12.5px `#a39b88` beneath
  (the bilingual pair convention — gloss hideable via the `showTranslations` setting);
  then an 8px status dot: `#c2622e` due · `#33589b` new · `#c7ccbc` known.
- Café entries: o galão (due) / a bica / o pastel de nata / se faz favor (due) / a conta (new).
  Mercado entries: o talho (due) / a peixaria (new) / meio quilo / está fresco? (new).

**Verbos tab** (`padding: 18px 16px 30px`)
- The real `VerbConjugator` at full width, `initialVerb="ir"`, `initialTense="presente"`.
  It gets its own row — nothing beside it.

---

### 5. Sandra — conversation practice

**Purpose:** Free spoken/typed conversation with the tutor persona.

**Layout:** Column, header + `flex: 1` transcript + sticky composer.

- **Header** — olive azulejo, `padding: 58px 20px 18px`, `border-radius: 0 0 28px 28px`,
  flex `gap: 13px`. 46×46 avatar (`border-radius: 15px`, `background: #f7e6d9`,
  `color: #9e4c1f`, Fraunces 19px/600, "S"); name Fraunces 22px/600; status
  "Só português. Devagarinho." at 12.5px `opacity: .68`.
- **Transcript** — `padding: 20px 20px 0`, column `gap: 14px`.
  - *Sandra bubble* — `align-self: flex-start`, `max-width: 82%`,
    `border-radius: 18px 18px 18px 6px`, `background: #fff`, `border: 1px solid #e6dcc6`,
    `padding: 13px 15px`. Portuguese in Fraunces 17px/1.4. Below it an icon-only
    `AudioButton` and a "Traduzir" link at 11.5px `#33589b` — translation is opt-in, never shown by default.
  - *Learner bubble* — `align-self: flex-end`, `border-radius: 18px 18px 6px 18px`,
    `background: #5d6650`, `color: #faf7f0`, Fraunces 17px/1.4.
  - *Correction bubble* — `background: #f7e6d9`, `max-width: 88%`, correction text at
    13.5px/1.55 `#9e4c1f` then the next question in Fraunces 16px `#2b271f`. Terra, warm,
    never red: "**Quase!** Dizemos *uma torrada* — mas em Portugal pedes logo **duas
    torradas**, que vêm sempre aos pares. 🙂"
  - *Suggested replies* — `.btn-ghost` at 13px, `min-height: 38px`, `padding: 6px 13px`.
- **Composer** — `position: sticky; bottom: 0`, `padding: 16px 20px 26px`,
  `background: #faf7f0`, `border-top: 1px solid #f2ecdf`. `Recorder mode="open"` with the
  live `prompt` on top (speaking is the primary path), then `.input`
  "…ou escreve a resposta" + a `.btn-primary` "→" at `min-width: 46px`.

---

### 6. Progresso — streak, XP, league

**Layout:** Olive azulejo header carrying the weekly chart, then `padding: 22px 20px 0`.

- **Weekly XP chart (in the header)** — flex row `gap: 6px`, `height: 80px`,
  `align-items: flex-end`. Each day: a `flex: 1` bar, `border-radius: 6px 6px 3px 3px`,
  height = XP px (min 6), `background: #e8a077`; an empty day is
  `rgba(250,247,240,.16)`. Day letter beneath at 10.5px `opacity: .6`.
  Data: S 34 · T 52 · Q 18 · Q 61 · S 44 · S 31 · D 0.
- **Three stat cards** — `flex: 1`, `gap: 10px`, `border-radius: 18px`,
  `border: 1px solid #e6dcc6`, `background: #fff`, `padding: 15px 14px`. Value
  Fraunces 28px/600, caption 11.5px `#a39b88`. "13 dias seguidos" (`#c2622e`) ·
  "1 240 XP total" (`#5d6650`) · "A2 nível atual" (`#33589b`).
- **Heatmap** — `.label` "Últimas 5 semanas", then
  `display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px`, 35 cells at
  `aspect-ratio: 1`, `border-radius: 5px`. Four-step ramp:
  `#f2ecdf` → `#dfe3d8` → `#c7ccbc` → `#97a08b`.
- **League** — `.label` "Liga Azulejo" + a `.chip` on `#e3eaf6`/`#33589b` "3 dias restantes".
  Card `border-radius: 18px`, `border: 1px solid #e6dcc6`, `background: #fff`,
  `overflow: hidden`. Rows `padding: 13px 15px`, `border-bottom: 1px solid #f2ecdf`,
  `gap: 13px`. Rank badge 26×26 `border-radius: 9px` Fraunces 13px/600 —
  top three `#c2622e`/`#faf7f0`, rest `#f2ecdf`/`#a39b88`. Name 14.5px/500; XP Fraunces
  15px/600 `#6f6858`. **The current user's row is highlighted `background: #eef0e9`.**
  Standings: 1 Mia 412 · 2 Carla 388 · 3 {name} 340 · 4 Diogo 291 · 5 Tomás 204.

---

### 7. Família — multi-learner

**Layout:** Olive azulejo header — "Família Jeremiah" at Fraunces 27px/600 with
"Semana de 10 a 16 de agosto" at 13px `opacity: .68` — then `padding: 20px 20px 0`.

- **Weekly challenge card** — `border-radius: 20px`, `background: #f7e6d9`,
  `padding: 17px 18px`. Eyebrow "DESAFIO DA SEMANA" at 12px/600 `letter-spacing: .1em`
  uppercase `#c2622e`; title Fraunces 20px/1.25 weight 600 "Pedir o pequeno-almoço só em
  português"; a 9px `border-radius: 99px` track on `rgba(158,76,31,.18)` with a
  `#c2622e` fill at 66%, and "2 / 3" at 12px/600 `#9e4c1f`.
- **Learner rows** — `.label` "Quem está a aprender", then cards `border-radius: 18px`,
  `border: 1px solid #e6dcc6`, `background: #fff`, `padding: 15px 16px`, `gap: 14px`.
  44×44 avatar (`border-radius: 15px`, Fraunces 17px/600) in the learner's colour pair;
  name 15.5px/600 + a `.chip` level badge (`padding: 1px 8px`, 10.5px); note 12.5px
  `#a39b88`; a 7px progress track on `#f2ecdf`. Right-aligned XP in Fraunces 19px/600
  `#c2622e` over "XP hoje" at 10.5px `#a39b88`.
  - Rob · A2 · "Ao balcão do café · a meio" · 31 XP · 62% · `#eef0e9`/`#5d6650`
  - Mia · B1 · "Terminou tudo hoje" · 80 XP · 100% · `#f7e6d9`/`#9e4c1f`
  - Tomás · A1 · "Ainda não começou" · 0 XP · 0% · `#e3eaf6`/`#33589b`

---

### 8. Perfil / definições

**Layout:** Olive azulejo header with a 58×58 avatar (`border-radius: 19px`,
`background: rgba(250,247,240,.15)`, `border: 1.5px solid rgba(250,247,240,.28)`,
Fraunces 23px/600), name Fraunces 24px/600, and "A2 · Torres Vedras · desde março" at
12.5px `opacity: .68`. Body `padding: 22px 20px 30px`.

- **Daily goal picker** — `.label` "Meta diária", three `flex: 1` buttons at
  `min-height: 64px`, column-stacked value + caption. Unselected: `.btn-ghost`,
  value Fraunces 17px/600, caption 10.5px `#a39b88`. Selected:
  `border: 1.5px solid #5d6650`, `background: #eef0e9`, `border-radius: 12px`, both lines
  `#5d6650`. Options **20 "Calma" · 50 "A sério" (selected) · 100 "Intenso"**.
- **Preferences list** — `border-radius: 18px`, `border: 1px solid #e6dcc6`,
  `background: #fff`, `overflow: hidden`, rows `padding: 15px 16px` split by
  `border-bottom: 1px solid #f2ecdf`. Row title 14.5px/500, sub 12px `#a39b88`.
  - "Mostrar tradução" / "Inglês por baixo do português" → **toggle**: 46×28,
    `border-radius: 99px`, `padding: 3px`, `transition: background .18s ease`;
    on `#5d6650` with `justify-content: flex-end`, off `#e6dcc6` with `flex-start`;
    22px white knob, `box-shadow: 0 1px 3px rgba(0,0,0,.2)`. Drives the vocabulary glosses.
  - "Sotaque" / "Lisboa" → disclosure "›" `#a39b88`
  - "Lembrete diário" / "Todos os dias às 19:30" → disclosure
- Two `.btn-ghost` full-width buttons: "Rever a configuração inicial" (returns to
  onboarding) and "Terminar sessão" (`color: #a39b88`).

---

### 9. Bottom tab bar (screens 2, 4, 5, 6, 7, 8)

- `position: sticky; bottom: 0`, `background: rgba(250,247,240,.94)`,
  `backdrop-filter: blur(14px)`, `border-top: 1px solid #e6dcc6`, `padding: 9px 6px 30px`
  (the 30px is the home-indicator inset).
- Five `flex: 1` buttons, column, `gap: 4px`, `min-height: 44px`, `padding: 7px 2px`.
  21px stroked icon (`stroke-width: 1.9`, `currentColor`) over a 10.5px/600 label.
  Active `color: #5d6650`; inactive `color: #a39b88`.
- **Hoje** (house) · **Palavras** (open book) · **Sandra** (speech bubble) ·
  **Progresso** (bar chart) · **Família** (two figures).
- Hidden entirely during the lesson player and onboarding.

## Interactions & Behavior

**Navigation**
- Tab bar sets `screen`. Home avatar → `perfil`. "Ver todos" → `familia`.
  Profile → "Rever a configuração inicial" → `onboarding`. Onboarding CTA → `home`.
- Lesson entry from three places: the Home contextual card, the current calçada stone, and
  the SRS due card on Palavras. All three reset the drill to step 0 with cleared answers.
- Lesson exit: the ✕ and "Parar por hoje" both return to `home`.
- **"Continuar →" on the completion screen restarts the loop at step 0** — the chain. In
  production it should load the *next* queued session (the review queue named on the card),
  and the path should auto-scroll to the newly current stone.

**Grading**
- Step 0 / 4: correct index comparison. Step 1: joined word array vs target string.
  Step 2: lowercased, punctuation-stripped comparison — **accents are significant**.
- Primary button stays disabled until an answer exists (a pick, ≥1 placed word, ≥1 typed char).
- First tap on an enabled primary = check (grade + feedback, lock the options). Second tap = advance.
- Step 3 has no grading gate; `Recorder` owns its own scoring.

**Animations**
```css
@keyframes ph-pulse { 0%{box-shadow:0 0 0 0 rgba(194,98,46,.45)} 70%{box-shadow:0 0 0 14px rgba(194,98,46,0)} 100%{box-shadow:0 0 0 0 rgba(194,98,46,0)} }
@keyframes ph-rise  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes ph-pop   { 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
```
- `ph-pulse 2.4s ease-out infinite` — the current calçada stone, drawing the eye to the one
  thing to tap.
- `ph-rise .3s ease-out` — each drill step body on mount; `.2s` on the feedback banner.
- `ph-pop .5s cubic-bezier(.2,.9,.3,1.4) both` — the completion badge.
- Progress fill: `width .4s cubic-bezier(.3,.8,.3,1)`.
- Option buttons and the primary: `all .16s ease`. Toggle: `background .18s ease`.
- Respect `prefers-reduced-motion`: drop `ph-pulse` and the rise/pop animations; the
  `pathStyle: lista` layout is the reduced fallback for the path.

**Layout hazard (found in review — do not repeat)**
The calçada offsets must live on the **inner stone column / inner cobble row**, never on the
full-width flex row. A `translateX` on a 362px row pushes its right edge to 460px inside a
402px viewport and the screen scrolls sideways. Also set `overflow-x: clip` on the app
scroll container.

**Touch targets** — every control is ≥44px, per `.tap-44`. Nothing sits behind a hover;
hover states are decoration only.

**Responsive** — designed at 390–402px and allowed to grow. The header band, cards and tab
bar are all fluid; the calçada offsets are absolute px and should scale with viewport width
(or centre the path in a fixed 402px column) above ~480px.

## State Management

```
screen      'home' | 'lesson' | 'palavras' | 'sandra' | 'liga' | 'familia' | 'perfil' | 'onboarding'
vocabTab    'vocab' | 'verbos'
step        0..5                  lesson step index
pick        number | null          step 0 selection
built       string[]               step 1 placed words
typed       string                 step 2 input
dialogPick  number | null          step 4 selection
checked     boolean                current step has been graded
xp          number                 session XP, +7 per step
showEn      boolean                English glosses visible
```

Derived, not stored: which step body renders, progress-bar width, primary label/enabled,
feedback text and colour, per-option visual state, whether a bank tile is spent.
Advancing a step clears `pick` / `typed` / `dialogPick` / `checked` but not `built`
(the loop is linear; nothing goes back).

**Data the real screens need:** today's contextual lesson (title, unit, minutes, phrase
count, progress), the unit path (stones with status + label), SRS due count and queue,
vocabulary grouped by scene with per-item SRS status, streak and daily goal/target, XP
totals and 7-day series, 35-day activity, league standings and time remaining, family
members with level/progress/today's XP, the weekly family challenge, word of the day, and
the Sandra thread. Pronunciation scoring and open-answer feedback are already server-side
behind `Recorder`.

## Design Tokens

All from PORT DS — do not introduce new colours.

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#faf7f0` | app surface, text on olive |
| `cream` | `#f2ecdf` | subtle fills, dividers, disabled |
| `sand` | `#e6dcc6` | borders, tracks, cobbles |
| `ink` | `#2b271f` | primary text |
| `ink-soft` | `#6f6858` | secondary text |
| `ink-faint` | `#a39b88` | tertiary text, inactive tabs |
| `olive` | `#5d6650` | brand, primary action, header band, done |
| `sage` | `#97a08b` | heatmap top step |
| `sage-light` | `#c7ccbc` | known-word dot, dashed borders |
| `sage-pale` | `#eef0e9` | correct answers, gentle affirmation |
| `terra` | `#c2622e` | streak, XP, current stone, **corrections** |
| `terra-dark` | `#9e4c1f` | correction text, stone shadow |
| `terra-pale` | `#f7e6d9` | correction fills, warm cards |
| `azul` | `#33589b` | links, info, new words |
| `azul-pale` | `#e3eaf6` | info cards, word of the day |

Non-token values used, and why: `#4a5140` (a darkened olive for the stone's 3px bottom
shadow) and `#e8a077` (a lightened terra for chart bars and the flame *on* the olive band,
where full terra lacks contrast). Add both to the theme rather than hard-coding them.

**Typography** — `font-display` = **Fraunces** (all headings, all Portuguese the learner
reads aloud, all numerals). `font-sans` = **Inter** (everything else).
Never set a Portuguese target sentence in Inter — the display face is the app's signal for
"this is the thing to say".
Scale in use: 40 / 34 / 32 / 29 / 27 / 26 / 25 / 22 / 21 / 20 / 19 / 17 / 16.5 / 15.5 / 15 /
14.5 / 13.5 / 12.5 / 11.5 / 10.5px. Display sizes carry `letter-spacing: -.01em` to
`-.025em`; uppercase eyebrows carry `+.06em` to `+.14em`.

**Radius** — 5 (heat cell) · 9 (rank badge) · 10–11 (small controls, word tiles) ·
12–15 (buttons, avatars, options) · 16–18 (cards, tiles, list containers) ·
20–22 (feature cards, stones) · 28 (header band bottom, completion badge) · 99/9999 (pills).

**Shadow** — `0 1px 2px rgba(43,39,31,.06)` placed word tiles ·
`0 2px 0 #e6dcc6` bank tiles · `0 2px 10px rgba(43,39,31,.05)` the Home lesson card ·
`0 3px 0 #4a5140` / `0 4px 0 #9e4c1f` stones (flat offset, no blur — they read as physical
paving) · `0 1px 3px rgba(0,0,0,.2)` toggle knob.

**Spacing** — 4px base. Screen gutter 20px (26px in onboarding). Section gap 26px.
List gap 8–10px. Header band top padding 58px (60px in the lesson) to clear the status bar;
bottom inset 30px for the home indicator.

**Azulejo pattern** — the one piece of decoration in the whole design. Full three-layer form
(onboarding, Home header):
```css
background:
  radial-gradient(circle at 0 0,     rgba(250,247,240,.10) 4px, transparent 4.5px),
  radial-gradient(circle at 20px 20px, rgba(250,247,240,.10) 4px, transparent 4.5px),
  linear-gradient(135deg, rgba(250,247,240,.05) 25%, transparent 25%, transparent 50%,
                          rgba(250,247,240,.05) 50%, rgba(250,247,240,.05) 75%, transparent 75%),
  #5d6650;
background-size: 40px 40px, 40px 40px, 28px 28px, auto;
```
Secondary screens use the two dot layers only (drop the diagonal), at `.10` opacity.
Onboarding drops both to `.09` / `.045` because the field is much larger.

## Assets

**None to source — deliberately.** No photography, no illustration, no icon library.

- **Fonts** — Fraunces and Inter, already shipped in the codebase.
- **Icons** — eight hand-drawn inline SVGs at 13–40px, stroked `currentColor` (or filled,
  for the flame): house, open book, speech bubble, bar chart, two figures, check, padlock,
  flame. All are simple UI glyphs; PORT DS ships no icon set. Replace with the codebase's
  icon component if one exists.
- **The calçada stones and the azulejo band are pure CSS** — rotated divs and layered
  gradients. No images.
- **PORT DS components** used live: `AudioButton`, `Recorder`, `AnswerDiff`,
  `VerbConjugator`. Import from the library; do not rebuild.
- **Missing:** the Drops-style visual word drill needs a real photo set (one clear
  object photo per concrete noun). It was left out rather than faked.

## Copy

**Every Portuguese string is European Portuguese (pt-PT) and the learner is addressed as
`tu`.** This is load-bearing and easy to break in translation review — a pt-BR string
undermines the product's entire premise.

Held to throughout: *pequeno-almoço* (not café da manhã) · *autocarro* (not ônibus) ·
*telemóvel* · *se faz favor* · *estou a comer* (estar a + infinitive, never the gerund) ·
*Vais? / Tens?*. Accents are correct everywhere because the app grades them — *café*,
*pastel de nata*, *balcão*, *galão*, *não*, *português*, *família*, *nível*, *só*.

Sandra's voice is warm, playful, specific, and never clinical: "O *pastel de nata* saiu-te
perfeito. O *café* ainda soa a brasileiro — mais fechado, sim?" Corrections open with
"Quase!" and explain *what slipped*, which is also why `AnswerDiff` is used instead of
printing the right answer.

## Files

| File | What it is |
| --- | --- |
| `Portuguese Hub - Mobile Redesign.dc.html` | The design. Template (markup) + logic class in one file. Read the template for structure and exact inline styles; read the logic class for state, grading and the computed style strings. |
| `ios-frame.jsx` | The 402×874 iPhone bezel/status bar used to present the screens. **Presentation scaffolding only — not part of the design.** |
| `support.js` | The design-tool runtime that renders the `.dc.html`. **Do not port.** |
| `_ds/port-ds-…/styles.css` | PORT DS stylesheet — the real tokens and `.card` / `.btn-*` / `.chip` / `.input` / `.label` / `.tap-44` classes. |
| `_ds/port-ds-…/_ds_bundle.js` | PORT DS component bundle (`window.PortDS`) — the five real components. |

To read the prototype's exact values: open the `.dc.html` and search for a screen's Portuguese
copy; the surrounding markup carries every inline style verbatim. Dynamic styles (option
states, tab colours, progress widths, avatar colour pairs) are built as strings in the logic
class near the bottom of the file.

## Suggested build order

1. Tokens: add `#4a5140` and `#e8a077` to the theme; confirm Fraunces/Inter aliases resolve.
2. The shared **olive azulejo header band** component (title, optional subtitle, optional
   slot for stats/segmented control/chart). Six screens depend on it.
3. Home, minus the path — header band, contextual lesson card, word of the day, family strip.
4. The **calçada path** component (stone status × 3, cobble trail, offset table).
   Mind the overflow hazard.
5. The lesson player shell — top bar, progress, sticky footer, grading gate — then the five
   step bodies in order. `AudioButton` / `Recorder` / `AnswerDiff` drop straight in.
6. The **completion + hand-off** screen and the chain to the next session. This is the fix
   the redesign exists for; do not ship the redesign without it.
7. Palavras, Sandra, Progresso, Família, Perfil.
8. Onboarding last.
