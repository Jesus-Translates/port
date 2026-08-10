# Handoff — everything the next session needs

Written 2026-08-10, closing a parallel session so work continues in one place.
Repo is clean, `HEAD == origin/main`, production serves current code.

---

## 1. What this session built

**Per-learner location, researched properly.** Onboarding asks which region,
then optionally which town — no longer free text. The answer pulls a paragraph
of real local detail into every prompt.

- `content/zones/*.md` — 15 dossiers, ~106,000 words. The human source of truth.
- `zones` / `zone_places` tables — **10 pickable zones, 128 places, 3 reference
  dossiers**. Only the distilled `## Prompt context` block reaches the database,
  because every word of it is paid for on every AI call.
- `npm run db:zones` — re-seeds from the Markdown. Idempotent.
- `lib/place.ts` `styleFor()` appends region + town; `referenceContext()` adds
  accents/bureaucracy/transport but ONLY to the four generators that invent real
  situations (homework, conversa, listening, stories). Deliberately not global.

**Other things that landed:** self-service signup at `/registar`; the
`/bem-vindo` onboarding sequence; complete-and-advance between lesson steps;
household tenancy isolation; audio moved to R2; Sandra's persona and full
immersion; the reports panel; three new games.

**Content export.** `npm run content:export` writes 154 unit Learning Notes, 30
paths, 263 exam questions, lessons, stories and clip transcripts to
`content/generated/` (892 KB JSON). This is the only copy outside the database
of everything an AI wrote. Regenerating it costs real money.

---

## 2. Traps this codebase has actually fallen into

Read `tasks/lessons.md` too. The ones that recur:

**Seeders that report success while importing nothing.** Four times now:
a `\Z` that JavaScript treats as a literal Z; an exact heading match that missed
`## Bairros do Porto`; a bairros file logged "reference only"; alphabetical
ordering running a child file before its parent existed. Every one printed a
tick. `scripts/seed-zones.ts` now re-reads the database afterwards and exits
non-zero if any dossier produced no context or no places. **Do not remove that
check**, and do not trust a success line without counting rows against source.

**Correlated sub-selects bind to the wrong table.** ``sql`(select count(*) from
${a} where ${a.x} = ${b.id})` `` renders the outer column unqualified. Use a
grouped query plus a Map. Bitten this repo 3+ times.

**`drizzle-kit push` is banned** — it silently drops columns. `npm run
db:generate` then `npm run db:migrate`.

**Verify against the data, not the page.** Grepping rendered HTML for a place
name gives false results — site chrome contaminates every match. Read the row.

**A substring match cannot tell a warning from a use.** Checking the corpus for
Brazilian forms flagged `ônibus` and `estou fazendo` as surviving; both were a
prohibition and a documented regionalism. Read the surrounding sentence.

**Migrate storage AFTER the readers are live.** Moving audio to R2 nulled the
base64 column while production still lacked credentials — Listen & Speak 404'd
for a few minutes. Deploy readers first, confirm, then drop the old copy.

**Commit messages: use a heredoc.** Apostrophes in `-m "…"` break out of shell
quoting and git reads the rest as pathspecs.

---

## 3. Standing content rules

These are why the corpus is trustworthy. Keep them.

- **Wrong is worse than missing.** If a claim cannot be sourced, DELETE it
  rather than hedge. A file full of `(unverified)` gets used by the model anyway.
  Roughly 30 claims were deleted on this basis — five Lisbon restaurants, eight
  Algarve market days, the ex-SCUT road list, the MST termini.
- **Never name a business you cannot confirm still trades.** Where the name
  can't be verified, write the *ritual* instead — the queue, the ordering
  custom, the argument about who does it best.
- **Humour goes on rituals, never on a named business.** No complaints, no
  criticism, no jokes at a real establishment's expense. This is defamation
  risk dressed as personality, and the ritual humour is funnier anyway.
- **Transport is the least reliable category** by a distance. Termini, line
  assignments and service status go stale fast, and Wikipedia summary articles
  contradict the per-line articles. Check the operator.
- **Brazilian forms inside warnings must survive.** Several dossiers quote them
  in order to forbid them, and five document the southern/insular gerund as
  genuine regional EP with a recognise-don't-produce rule.

---

## 4. Live state

- **DB**: 10 zones + 3 reference, 128 places, 9 users, 1 household.
- **R2**: bucket `portugues-audio`, 16 objects, 3.18 MB. All audio rows carry a
  key; none inline. `/api/ls/audio` 302s to a presigned URL.
- **Azure TTS**: live. Never exceed **50 `<voice>` elements** per SSML document
  — `ssmlSegmentDocs()` splits and concatenates.
- **Sandra**: persona in `lib/ai.ts` as `SANDRA`. The MODEL is still
  `gpt-5.6-luna` — that name is not the persona, never rename it.
- `PT_STYLE` is ~778 tokens on **every** call. Real recurring cost; justified,
  but know it before adding to it.

---

## 5. Outstanding — in priority order

1. **Stripe.** Zero implementation. Revenue in `/admin/relatorios` is list-price
   estimate and says so; it flips to real when a subscription carries a Stripe
   id. **Needs Robert to create the account and prices first.**
2. **Resend.** Fully built, completely dormant — production has **zero** of the
   env vars. Needs `RESEND_API_KEY` and `EMAIL_FROM` (verified domain).
3. **Personal-data backup.** `content/generated/` covers generated content, but
   accounts, FSRS cards, progress, homework and spend exist only in Neon. A
   `pg_dump` or Neon branch kept OUTSIDE git is the right tool — never commit it.
4. **Native-speaker audit** of the 126 units (~€150) before charging anyone.
5. **Remaining Fable UX findings**: `## Restaurants & institutions` exists in
   only 5 of 10 regional dossiers; five prompt contexts sit near their cap.
6. `tasks/curriculum-gap.md` — missing units (ficar, airport, negation,
   Christmas, cognates).

---

## 6. Things NOT to redo

- Don't re-research the zones. 15 dossiers, fact-checked, EU-Portuguese swept.
- Don't reinstate **Confeitaria Manuel Natário** as closed — it trades; the sole
  closure claim was an undated AI-generated page. `norte.md` records why.
- Don't "correct" the southern gerund out of alentejo/algarve/madeira/acores.
- Don't re-add Almada to Grande Lisboa's towns — it is Península de Setúbal, and
  the seeder excludes it by name.
- Don't put reference dossiers into `currentStyle()` — that was a deliberate
  cost decision.
- `lessons.json` names Kelly, Jenni and Robert as characters. Fine here; must
  never become product seed data for other households.

---

## 7. Reports worth reading

- `tasks/zone-review.md` — Fable's editorial review, 19 cross-file
  contradictions with a right/wrong call on each, all 15 prompt contexts ranked.
- `tasks/eu-portuguese-sweep.md` — the Brazilianism sweep.
- `tasks/lessons.md` — the recurring-trap list.
- `tasks/plan-saas.md`, `tasks/curriculum-gap.md`, `tasks/research-name-market.md`.
