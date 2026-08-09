# Lessons

Traps this repo has actually fallen into, and the rule that prevents the repeat.

## Azure TTS: 50 `<voice>` elements per document

A full 20-card Listen & Speak session returned a bare `400`. Cause: every
segment emitted a *second* `<voice>` wrapper just to hold its `<break>`, so 20
cards shipped 82 voice elements against Azure's limit of 50.

Why it hid: short clips and 2-line dialogues stayed well under the cap, so
single-voice playback and the admin voice probes all passed. It looked like a
bad voice name in the rotation.

- **Rule:** put `<break>` INSIDE the segment's own `<voice>`, never in its own.
- **Rule:** long content goes through `ssmlSegmentDocs()`, which splits at
  `AZURE_MAX_VOICES` and concatenates the audio.
- **Rule:** never `return null` on a failed provider call. `azureTrySsml()`
  keeps the status and body — the bug was unfindable for as long as the error
  text was thrown away.

## Verify against the data, not the page

While proving the location feature worked, the first check grepped a fetched
HTML page for the town name and reported the opposite of the truth — the site
chrome itself says "Santa Cruz", and the URL fetched wasn't even a real route.

- **Rule:** when checking what a generator produced, read the stored row, not a
  rendered page. Page chrome contaminates every string match.

## Migrate storage AFTER the new store is live, never before

Moving audio to R2 nulled the base64 column locally while production was
still running a build without the R2 credentials. For a few minutes Listen &
Speak returned 404: the new copy was unreachable and the old copy was gone.

- **Rule:** deploy the readers with credentials FIRST, confirm they read from
  the new store in production, and only then run the migration that drops the
  old copy. Redeploy after adding env vars — Vercel only picks them up on a
  new build.

## Never hand someone a placeholder they can paste

Telling the user to run `printf 'KEY=paste_here' >> .env.local` left two
literal `paste_here` lines above their real values. dotenv happened to take
the last occurrence so it worked, but a parser that takes the first would
have failed with a confusing 403.

- **Rule:** have people edit the file, or write the key with an empty value —
  never a placeholder string that is itself valid syntax.

## Correlated sub-selects bind to the wrong table

``sql`(select count(*) from ${a} where ${a.x} = ${b.id})` `` renders `${b.id}`
unqualified, so it binds to the inner table and silently returns zeros. This
repo has been bitten three or more times (category counts, unit item counts).

- **Rule:** use a grouped query plus a `Map`, never a correlated sub-select.

## `drizzle-kit push` is banned

It silently drops columns. Use `npm run db:generate` + `npm run db:migrate`.
