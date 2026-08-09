# WAVE 4 RESULTS (2026-08-07) — shipped

- [x] 126-unit A1-B2 course seeded and live (A1 32 / A2 44 / B1 28 / B2 22),
      Learning Notes written by Luna on first open (verified in prod: 5,527
      chars, all 4 headings, real pt-PT examples)
- [x] Walkable unit paths: generated on open, contract enforced in code,
      per-item completion, unit %, one "A seguir" pill
- [x] Two games: /jogos/pares (matching, timed) and /jogos/frase (sentence
      builder WITH distractor tiles). Misses become review cards
- [x] Token-level answer diff (certo/quase/incompleto/errado), LCS-anchored so
      one inserted word marks one token. Verified 6/6 + anti-cascade
- [x] SPEAKING_COACHING everywhere a transcript is graded — pronunciation
      pointers, not punctuation (user correction)
- [x] Fixed 3 security/correctness bugs a fresh-eyes review found: draft units
      readable+AI-buildable by students; completeItem XP double-award race;
      IDOR on the two progress readers
- [x] Fixed mistake-card starvation in getQueue — the headline differentiator
      was enrolling mistakes and then never showing them
- [x] Azure TTS priced $15/1M (was $16, and before that fell through to the
      text-model rate entirely)

## VERDICT: build vs buy (cross-examination)
KEEP THE APP. Duolingo, Babbel and Busuu are BRAZILIAN-ONLY — buying them is
negative value here. Only Pimsleur (2 levels, audio-only) and Memrise
(Portuguese (EU), 300+ native videos) are genuine pt-PT, and neither has a
family plan. App runs under EUR 1/month.
BUT: buy weekly italki hours (~$18/hr, Portugal-based tutors, variety
selectable). Nothing in software replaces a human ear from the Oeste.

## THE RISK THAT SHOULD WORRY US MOST
126 units, their notes, dialogues and verb tables are ALL model output with
NO native-speaker review — and the 8 people using it cannot detect a
Brazilianism. The draft->publish workflow exists; make it mean something.

## NEXT, in order
- [ ] AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (user). Highest leverage single
      change: 87% of spend -> 0 (F0 free tier is 27x lifetime usage/month),
      accent stops depending on prompt steering, voice rotation becomes real,
      AND free phoneme-level pronunciation assessment unlocks (pt-PT supported;
      prosody is en-US only). Settle AZURE_TTS_VOICES in the SAME change —
      adding a voice later re-hashes and re-synthesizes the whole library.
- [ ] Native-speaker (or adversarial second-model) pass gating unit publish
- [ ] Move audio blobs out of Postgres (Neon free = 0.5GB; base64 inflates
      1.33x) to Blob/R2 BEFORE bulk-generating audio for 126 units
- [ ] Azure Pronunciation Assessment replaces the ASR-proxy score in Falar
- [ ] KILL dual-speed second render (WAVE 4 #9) — browser playbackRate is free
      and ttsHash ignores rate, so it would collide silently
- [ ] Error-pattern analysis -> feed the italki lesson, not compete with it

# WAVE 4 (2026-08-07): Competitive upgrade plan — from the Practice Portuguese review

Seven agents reviewed practiceportuguese.com (logged-in) + our own codebase.
Full reports in the session transcript. Synthesis below.

## Where we already win (do NOT spend effort here)
- FSRS vs their binary Leitner ladder (they have NO daily limit; 166/172 cards
  were due at once on the real account). Their own staff admit the gap.
- We auto-enrol mistakes from every grading path; they REMOVED auto-add in 2022
  and make you tap "Add to Smart Review" on an item you just failed.
- AI generation, AI tutor, Conversa, speech scoring in review: they have none.
- Placement: they have NO placement test at all — everyone starts A1 unit 1.

## Ranked plan (impact / effort)
- [x] 1. "A seguir" card — one server-resolved next action (SHIPPED fb61826)
- [x] 2. Loading skeleton for the whole (app) group (SHIPPED 521e51b)
- [x] 3. Honour placement level everywhere + Azure TTS mispricing (SHIPPED 913db36)
- [ ] 4. CURRICULUM SPINE — the biggest gap. They have 137 tight single-concept
      units (A1 39 / A2 55 / B1 24 / B2 19); ours is EMPTY (units default to
      draft, students see nothing). Generate ~126 units with their interleaving
      rule: never >2 consecutive grammar units, never >3 non-grammar; grammar
      exercises drawn from the situational units around them. Fix the draft trap.
      Add local units nobody else has: mercado de Torres, Carnaval de Torres,
      surf/Santa Cruz, pêra rocha/Oeste wines, Estremadura accent listening.
      Non-negotiable topics they got right that naive syllabi miss: Correios,
      Polícia, Desastres, Falar com os Vizinhos, Finanças/NIF, Câmara,
      utilities, IMT/licence, 112. [L]
- [ ] 5. Token-level diff feedback: ✗ your answer w/ offending word marked above
      ✓ correct w/ fix marked. We ALREADY have the LCS machinery in
      lib/pronunciation.ts + lib/ditado.ts — just needs to render in quiz/TPC. [S]
- [ ] 6. "Start Here" unit: teach the app + why pt-PT + one trivially easy win,
      counting toward progress. Their highest-ROI onboarding move. [S/M]
- [ ] 7. Universal phrase menu — AddToDeck/play/slow-audio/lookup on EVERY phrase
      object everywhere (theirs works mid-quiz, in verb tables, in prose). [M]
- [ ] 8. Register chips on cards: `sing., inf.` / `formal` / `masc.` — removes the
      "which you?" ambiguity in EN→PT. Our AI can emit these at generation time;
      theirs is hand-curated, so this is CHEAPER for us. [S]
- [ ] 9. Dual-speed audio on every phrase (normal + prosody rate -25%), incl. each
      MCQ option — turns recognition items into listening practice. [S/M]
- [ ] 10. Three-state answer check: typo / incomplete / wrong, with a "that was a
      typo" retry. We have "quase" in TPC only. [S]
- [ ] 11. Nav 8 tabs → 5; merge ditado+verbos into Rever modes, ciple → quiz
      preset, ouvir → section of escutar, falar+missoes → Conversa. [M]
- [ ] 12. Error-pattern analysis — we store every graded item WITH a diagnosis and
      never aggregate it. One AI pass → "os teus três erros" + practise-this. [M]
- [ ] 13. Card state as full-card fill (completed=gold+trophy, next=green). COPY
      THE LOOK, FIX THE CONTRAST — theirs measures 2.98:1 and fails WCAG. [S]
- [ ] 14. Adaptive level from quiz accuracy + FSRS lapse rate. [M]

## Their mistakes to avoid
- Binary ✓/✗ grading throws away scheduler signal.
- Wrong answers never come back automatically.
- Explanations are per-phrase, not per-error (an LLM can do better).
- No lesson score, no end-of-lesson summary.
- Gamification so hidden it is undiscoverable; account page is billing-only.
- Community-authored cards shipped to paying learners with a "may contain
  mistakes" disclaimer.
- 83 of 105 buttons unlabelled; transcript lines not keyboard-reachable.

## Model decision
Gemini Flash Lite: NO. luna cut prices ~80% on 2026-07-30 to $0.20/$1.20;
3.5 Flash Lite is $0.30/$2.50 — dearer on both axes. Only cheaper option is
2-gen-old 2.5 Flash Lite, saving <2 cents all-time. The AI SDK Google path
silently strips minItems/maxItems (we have been burned by near-miss JSON
twice already), and NOBODY has measured any Flash Lite on pt-PT. Staying.

# WAVE 3 (2026-08-08): Azure voices + full competitive roadmap — SHIPPED (deploy 1)

User directives: (1) swap TTS to Azure with RANDOM/rotating EU-PT voices;
(2) build ALL 10 roadmap items; (3) Opus builders write code, Fable orchestrates,
peer-reviews and fact-checks. Mid-wave addition: Conversa mode (spoken back-and-forth).

## Plan
- [x] FOUNDATION (Fable): Azure TTS seam in lib/tts.ts (stable-hash voice rotation,
      OpenAI fallback, azureSynthesizeSsml/ssmlSegments); 6 new tables pushed to prod.
- [x] A: chat-derived TPC ("Gerar TPC desta conversa") + AddToDeck/Harvest chips +
      /practice/rever/gerir deck manager. Reviewed: ownership-scoped, XP anti-farm ok.
- [x] B: CEFR per user + /placement (16 items fact-checked) + /ouvir. Reviewed earlier.
- [x] C: cloze ditado mode + verbs 30→107 w/ futuro+imperativo. Fact-checked subir/
      seguir/cair/haver/vestir/construir — all correct; EP -ámos + -car/-gar/-çar shifts ok.
- [x] D: Listen & Speak — session MP3 (EN prompt → pause → PT answer), RSS feed
      (token-auth, /api/ls/* public paths), 10-min cooldown, prune to 5.
- [x] E: listening library /escutar — multi-voice dialogues, whisper word timings,
      greedy alignment w/ coverage gate, speed pills, human re-record override.
- [x] F: /unidades unit spine (draft→publish, teacher review, admin index) +
      /missoes 8 field missions (all 8 briefs fact-checked pt-PT correct).
- [x] Fable integration: practice hub tiles (Escutar/Áudio/Ouvir/Missões/Nível),
      dashboard cards (Unidades, Missões) + activity emoji, nav unchanged (8 tabs full).
- [x] Verify: npm run build ✓, lint ✓, tsc ✓. Deploy 1 = everything above.
- [x] G (Fable inline; Opus builder hit session limit): Conversa — /practice/conversa
      spoken back-and-forth with Luna. Deploy 2 shipped; prod-verified end to end:
      opener+audio (103KB mp3), recast confirmed live ("as ondas é" → Luna replied
      "as ondas são"), summary caught exactly the seeded error, mistake card landed
      in the deck. Salvage fallback added for schema-lax gateway models.
- [ ] USER ENV NEEDED: AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (Speech resource,
      free F0 tier OK). Until set, TTS falls back to OpenAI; Azure-only features gate cleanly.

# Portuguese Hub — Full Rebuild (2026-08-06)

Goal: A true learning app for Kelly, Jenni & Robert learning European Portuguese while
living near Santa Cruz (Torres Vedras), Portugal. Gated by simple username + shared
password + Turnstile. AI = GPT 5.6 Luna via Vercel AI Gateway. Host: Vercel,
port.robertjeremiah.com.

## Plan

- [x] Inventory + tear down old Google-built app (kept .git, .vercel link, .env.local)
- [x] Digest example PDFs (lesson format + "Espaços da Casa" reference book → seed ideas)
- [x] Storage decision: Neon Postgres (Vercel Marketplace) + Drizzle ORM
- [x] AI decision: AI SDK v6 + gateway model `openai/gpt-5.6-luna`
- [x] Next.js 16.2.12 docs brief (researcher subagent)
- [x] Provision Neon via `vercel integration add neon`, pull env
- [x] Scaffold: package.json, tsconfig, tailwind v4, next config
- [x] Core: auth (login + Turnstile + JWT cookie + proxy.ts), db schema, AI client
- [x] Features: dashboard, tutor chat, reference book, notes, practice (quizzes), homework, workbook
- [x] Seed content: 434 pt-PT entries in 16 categories + 6 lessons (content agents)
- [x] Local verification: build, lint, browser walk-through, live AI quiz 4/4
- [x] Fresh-eyes reviewer (opus) — 14 findings, all fixed or already-fixed
- [x] Mid-build user request: everything shared across users (notes, quizzes + clone)
- [x] Deploy to Vercel prod (Opus agent), env vars, domain attached
- [x] Cloudflare CNAME `port` → vercel-dns (DNS only) — LIVE at https://port.robertjeremiah.com
- [x] Real Turnstile widget "Portuguese Hub" created (port.robertjeremiah.com + localhost),
      keys swapped in Vercel prod/preview and .env.local, redeployed, enforcement verified
- [x] OPENAI_API_KEY added by user; AI_MODEL switched to openai/gpt-5.6-luna — all 6 AI
      features verified live in production (chat, quiz, homework, lesson, ref-fill, suggest)
- [x] Mobile pass: bottom tab bar, 16px inputs (no iOS zoom), 44px targets, safe areas,
      PWA manifest + apple-icon; verified at 375×812
- [x] 8 users: Kelly, Jenni, Robert, Bobby, Sarah, Hannah, Rebecca, Sammy
- [x] OG image + apple icon via next/og (fixed proxy.ts 307 that blocked them)

## Delegations

- researcher (opus): Next 16 docs brief — conventions/breaking changes
- content agents: seed reference book + starter workbook content (pt-PT)
- reviewer: post-implementation diff critique
- deployment agent (opus): Vercel deploy + env + domain

## Second review round (2026-08-07)

Fresh-eyes Opus review of everything since 0297505: 14 findings, verdict fix-first.
All 4 blockers + perf fix + minors fixed and deployed same day (commit after cbb6f96).
IMPORTANT OPERATIONAL NOTE: schema changes ship via `npm run db:push` from .env.local,
which points at the PROD Neon DB — always push schema BEFORE `vercel deploy --prod`,
or new-table queries 500 in prod. No migration step runs on deploy.

## Roadmap BUILT end to end (2026-08-07, autonomous /goal run)

All six roadmap items shipped and verified in prod the same day:
- [x] Rever: FSRS (ts-fsrs) over the phrasebook, per-user state, 20 new/day cap,
      mistake cards auto-enrol from homework/quiz/ditado/verb errors
- [x] pt-PT TTS everywhere (gpt-4o-mini-tts, Postgres-cached, env-steerable) — ear-tested
      and approved by Robert 2026-08-08; staying on OpenAI, no Azure switch
- [x] Ditado (dictation, LCS word grading, answer hidden server-side)
- [x] Verbos (hand-checked EP conjugation tables, 30 verbs, EP -ámos)
- [x] Falar (record → gpt-4o-mini-transcribe → word alignment / Luna feedback; iOS mp4 handled)
- [x] CIPLE track (Leitura, Oral-listening via hidden TTS script, Escrita 25-35/60-80w,
      Cultura e História quiz + seeded 🇵🇹 category 24 entries, oral via Falar)
- [x] Histórias (serialized graded readers set in Santa Cruz, glossary→deck, questions, audio)
- [x] Praticar hub + dashboard due-count nudge
Prod-verified: TTS gen+cache, listening quiz audio, story ch.1, CIPLE escrita, STT round-trip 6/6.

## Feature roadmap (from Opus research agents, 2026-08-07)

Convergent top picks (both researchers independently):
1. FSRS spaced repetition over the family phrasebook (ts-fsrs, per-user card state)
2. Mistakes auto-enrol into the review queue (we already store verdict+correction+tip)
3. pt-PT TTS audio everywhere — MUST ear-test first (OpenAI TTS drifts Brazilian;
   fallback Azure pt-PT-RaquelNeural/DuarteNeural); then ditado (dictation) + audio-only
   anticipation drills (Pimsleur-style)
4. CIPLE A2/B1 exam track — nationality law 1/2026 raised stakes (A2 kept, B1 for some
   routes, new civics test); CAPLE sample papers = format spec; Realtime API for oral part
5. Graded stories set in their real life (Santa Cruz) with comprehension Qs + tap-to-deck
6. Verb-conjugation drill (perfeito vs imperfeito, conjuntivo)
Do NOT copy: energy/practice caps, ranked leagues across mixed levels, guilt notifications.

## Review

Shipped 2026-08-06. Deployment READY on Vercel (project port.robertjeremiah.com,
team hossola); domain attached, waiting only on the Cloudflare CNAME. Reviewer
verdict was "fix-first" — all five blockers fixed before deploy (Turnstile
fail-closed + rate limit, stranded homework retry, NaN params, enhanceHomework
guard, open redirect) plus the follow-up findings (nullable schemas for strict
structured outputs, chat error UX, Lisbon-timezone streaks, grading dedup,
maxDuration, after(), note-editor save race). Live-tested end to end locally:
login API, dashboard, reference, lesson, notes, streaming tutor, quiz 4/4 with
AI grading. AI runs on gpt-oss-120b until gateway credits unlock gpt-5.6-luna
(env-only switch).

## Review — topic matching unified (2026-08-09)

Two concurrent agents had shipped two answers to "does this row match the unit
topic?": `rankByTopic` (in-memory token overlap, used by Escutar/Histórias) and a
private `TOPIC_STOP`/`topicTerms`/`topicScore` in the ditado page (SQL ILIKE
scoring over ref_entries + categories). Now one module, `lib/topic-match.ts`:
`rankByTopic` (matches only) and `sortByTopic` (everything, best first) over one
stop list and one match rule. Ditado loads its eligible rows (130 today, capped
at 500) and ranks in memory instead of scoring in SQL.

Verified against the live DB, not by inspection:
- ILIKE is NOT accent-folded here (`'família' ilike '%familia%'` → false), so the
  two scorers could never have agreed on accents. In-memory folds both sides.
- The old SQL path matched 98-108 of 130 rows on four real syllabus topics — no
  ranking at all — because nearly every row's section is "Perguntas e respostas"
  and those topics contain "resposta"/"perguntas". Stop-listed; now 7-24 rows.
- The 12-term cap (a cost guard for 5 ILIKEs/term/row) was dropping real
  vocabulary — forno, panela, roupa, fogão — because it kept the LONGEST terms.
  Removed now that matching is in memory; one topic went from 0 matches to 27.
- Every Escutar/Histórias diff is an improvement: 6 false positives gone (the
  "A família da Luna" clip was matching butcher and condominium topics on the
  boilerplate "diálogo"/"frases"/"português"), 3 true positives gained via
  singular/plural matching (vizinho → "Os Vizinhos e o Mercado…").
- Grammar-only topics ("o artigo definido antes de possessivos") still score 0
  everywhere and fall back to a full random round of 5, never an empty screen.

Watch: matching is now O(rows) in the page, so if the phrasebook outgrows the
500-row CANDIDATES cap the ditado ranking silently becomes "best of a random
500". Revisit with a SQL prefilter if the book gets big.
