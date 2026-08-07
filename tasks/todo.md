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
