# Português — the family hub 🇵🇹

A private European Portuguese learning app for Kelly, Jenni & Robert, living near
Santa Cruz (Torres Vedras), Portugal. Live at **https://port.robertjeremiah.com**.

## What's inside

- **🌙 Sandra** — an AI tutor (chat, corrections, explanations) with a European
  Portuguese persona rooted in local daily life.
- **📖 O Livro** — the shared family phrasebook: 16 seeded categories (Cozinha,
  Lavandaria, Compras, Imprevistos…), searchable, everyone can add entries, and
  Sandra can suggest more per category.
- **📚 Lições** — workbook lessons in the style of real class worksheets
  (prompts, vocab, reading + questions, speaking, games). Sandra generates new
  ones on any topic.
- **✍️ TPC** — homework: Sandra writes assignments (optionally for the whole
  family), class homework can be pasted in and "enhanced", and submissions get
  warm, specific AI feedback with a score.
- **🎯 Praticar** — AI-generated quizzes (multiple choice + translation) with
  AI grading of free-text answers.
- **📝 Notas** — personal study notes with a "ask Sandra about this note" panel.
- **Dashboard** — streak, XP, family activity feed, and "O que estudar hoje?"
  AI suggestions.

## Stack

Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 · Neon Postgres (Vercel
Marketplace) + Drizzle ORM · AI SDK v7 via Vercel AI Gateway · Cloudflare
Turnstile · jose (JWT session cookie) — auth enforced in `proxy.ts`.

## Local dev

```bash
npm install
npx vercel env pull .env.local   # DATABASE_URL, OIDC token for AI Gateway, etc.
npm run dev
```

Database:

```bash
npm run db:push   # apply lib/db/schema.ts to Neon
npm run db:seed   # seed users + content/*.json (idempotent, keeps user edits)
```

## Environment variables

| Var | Purpose |
| --- | --- |
| `JWT_SECRET` | signs the session cookie |
| `VALID_USERS` / `SHARED_PASSWORD` | the login gate (default users Kelly,Jenni,Robert) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile; test keys pass everything — swap for real ones from the Cloudflare dash |
| `DATABASE_URL` | Neon (auto-provisioned by the Vercel integration) |
| `AI_MODEL` | e.g. `openai/gpt-5.6-luna` (needs AI Gateway credits) or `openai/gpt-oss-120b` (free tier) |
| `OPENAI_API_KEY` | optional — a real `sk-…` key makes openai/* models call OpenAI directly, bypassing the gateway |

## AI model note

The app is built for **GPT 5.6 Luna** (`openai/gpt-5.6-luna`). The Vercel AI
Gateway free tier doesn't include it, so out of the box it runs on
`openai/gpt-oss-120b`. Two ways to switch, both env-only:

```bash
# Option A (recommended) — use your own OpenAI account, bypassing the gateway:
printf '%s' 'sk-YOUR-KEY' | npx vercel env add OPENAI_API_KEY production
npx vercel env rm AI_MODEL production -y
printf '%s' 'openai/gpt-5.6-luna' | npx vercel env add AI_MODEL production
npx vercel deploy --prod --yes
```

Option B: top up AI Gateway credits (Vercel dashboard → AI → top up), then set
`AI_MODEL=openai/gpt-5.6-luna` and redeploy. `getModel()` in `lib/ai.ts` picks
the direct-OpenAI path automatically whenever `OPENAI_API_KEY` starts with `sk-`.
