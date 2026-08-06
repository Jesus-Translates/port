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
- [ ] Next.js 16.2.12 docs brief (researcher subagent — running)
- [ ] Provision Neon via `vercel integration add neon`, pull env
- [ ] Scaffold: package.json, tsconfig, tailwind v4, next config
- [ ] Core: auth (login + Turnstile + JWT cookie + middleware/proxy), db schema, AI client
- [ ] Features: dashboard, tutor chat, reference book, notes, practice (quizzes), homework
- [ ] Seed content: EN/pt-PT reference packs (delegated content agents)
- [ ] Local verification: build, lint, browser walk-through of every page
- [ ] Fresh-eyes reviewer subagent on the full diff; fix findings
- [ ] Deploy to Vercel (Opus deployment agent), env vars, domain port.robertjeremiah.com
- [ ] Final report: what shipped, Turnstile real-key swap steps, ideas backlog

## Delegations

- researcher (opus): Next 16 docs brief — conventions/breaking changes
- content agents: seed reference book + starter workbook content (pt-PT)
- reviewer: post-implementation diff critique
- deployment agent (opus): Vercel deploy + env + domain

## Review

(to be filled at the end)
