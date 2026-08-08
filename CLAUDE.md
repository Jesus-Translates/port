# Portuguese Hub — project notes for Claude

Next.js **16.2.12** — NEWER than your training data. Before writing code, check
`node_modules/next/dist/docs/`. Highlights that differ from Next 13-15 habits:

- Middleware is **`proxy.ts`** (export `proxy`, Node runtime only). `middleware.ts` is deprecated.
- `cookies()`, `headers()`, `params`, `searchParams` are **async-only**. Use the
  global `PageProps<'/route'>` / `RouteContext<'/route'>` types (no import).
- Turbopack is the default bundler; `next lint` is gone (use `npm run lint` → eslint).
- `cacheComponents` is intentionally OFF — everything is dynamic (authed app).

AI SDK is **v7** (`ai@7`): `instructions:` (not `system:`), structured output via
`generateText({ output: Output.object({ schema }) })` → `result.output`, streaming
chat via `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`,
client `useChat` + `DefaultChatTransport` with manual input state.
Model comes from `getModel()` in `lib/ai.ts` (AI Gateway string or direct OpenAI).

Conventions:
- European Portuguese ONLY in content/prompts (tu register, pequeno-almoço,
  estar a + infinitive). The family lives near Santa Cruz / Torres Vedras.
- Auth: JWT cookie (`ph_session`) checked in `proxy.ts`; every server action and
  API route re-checks via `requireSession()` / `getSession()`.
- DB access through `getDb()` (lazy — never construct at module top level).
- Schema changes go through MIGRATIONS, never `drizzle-kit push`. `push` diffs
  against the live DB and silently drops what it thinks is gone — unacceptable
  now there is real family data and a tenancy migration in flight.
  `npm run db:generate` writes a reviewable file to `drizzle/`, then
  `npm run db:migrate` applies it in order. `db:push` has been removed.
- `db:seed` / `db:syllabus` for content; both idempotent and must never clobber
  user-added rows (`addedBy != 'seed'`). `db:backfill` adopts new users into
  the account model.
