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
- [x] pt-PT TTS everywhere (gpt-4o-mini-tts, Postgres-cached, env-steerable) — NEEDS EAR-TEST
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
