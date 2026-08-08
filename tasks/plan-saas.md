# Portuguese Hub → multi-tenant SaaS: migration plan

**Status:** design only. No application code written. Written 2026-08-08.
**Audience:** the agents who will execute this. Every stage below is meant to be
handed to one agent with the acceptance criteria stated.

**Ground rule for every stage:** the live app keeps working for the eight Hansons
at every single step. Their real progress — 126 units, SRS decks, homework
history, XP — is not recoverable if lost. There is no second copy of it in
anyone's head.

---

## 0. Current state — the eight facts that drive every decision

Verified by reading, not assumed. These are the load-bearing ones.

1. **There is no tenant.** Identity is a username *string* in the `sub` of a JWT
   (`lib/auth.ts:74-79`). The roster is an **env var**, not a table:
   `getValidUsers()` splits `VALID_USERS` (`lib/auth.ts:19-27`). Roles are env
   too — `getRole()` reads `ADMIN_USERS` / `TEACHER_USERS` (`lib/auth.ts:99-104`).
   `scripts/seed.ts:51-64` materialises the `users` table *from* the env list, so
   the table is a cache of an environment variable.

2. **One shared password for all eight people** (`lib/auth.ts:29-40`). Today
   "another person's account" is not a security boundary at all — anyone who can
   log in as themselves can log in as anyone.

3. **`getSession()` verifies only the signature.** It never checks the username
   is a real member. A token signed for a deleted user still authenticates.

4. **Twelve tables key user data by a bare `username: text`** with no FK, no
   uniqueness guarantee, and inconsistent casing (`schema.ts:51, 76, 94, 120,
   135, 153, 249, 283, 295, 304` + `users.username`). Three more carry
   attribution columns (`created_by`, `added_by`, `from_user`/`to_user`).

5. **The data layer is tenant-blind by design, and says so.**
   `lib/data.ts:119-120`: *"The whole hub is shared family space… `username`
   records who created a thing, not who may see it."* Concretely:
   `getNotesAll()` (`lib/data.ts:121`), `getHomeworkAll()` (:151),
   `getQuizzesAll()` (:166), `getRecentKudos()` (:346) are **unfiltered table
   scans**. `getNote(id)` (:126), `getQuiz(id)` (:171), `getHomeworkItem(id)`
   (:156), `getLesson(id)` (:141) are **by-bare-id reads with no owner check**.
   `getFamilyBoard(usernames[])` (:255-330) runs five unscoped aggregates and
   filters in JavaScript. The day a second family exists, each of these is a
   full cross-tenant breach.

6. **There is no migration history.** `drizzle.config.ts` points `out` at
   `./drizzle`, but that directory does not exist. The workflow is
   `drizzle-kit push` (`package.json`, and `CLAUDE.md` instructs every agent to
   use it). `push` diffs and will silently drop columns.

7. **There is no single chokepoint for spend.** `lib/ai.ts` is only schemas,
   prompts and `getModel()`; every route calls `generateText`/`streamText`
   directly. The only pre-flight gate is `aiRateLimited()` (`lib/usage.ts:134`),
   which counts *rows* not cost, fails open, and is hand-copied into 16 routes —
   and **omitted from five paid paths**: `app/api/tts/route.ts`,
   `app/api/listening/human/route.ts`, `lib/actions/quiz.ts:76`,
   `lib/actions/homework.ts:60,152,183`, and `app/api/ls/generate/route.ts`
   (which has its own cooldown instead).

8. **Generated artefacts are already global, and that is good news.**
   `tts_audio` is keyed on `provider|voice|text` with no username
   (`lib/tts.ts:57`), so cache efficiency *improves* with more tenants.
   `listening_clips`, `stories`, `lessons`, `units`, `categories`, `ref_entries`
   are shared content. This hands us the free/paid line for free (§4).

### Two live defects found while surveying — fix these regardless of the migration

- **LS podcast token is accepted as a session cookie.** `lsToken()`
  (`lib/ls.ts:78-86`) mints a 90-day HS256 JWT with `sub = username`,
  `aud = "ls-feed"`, signed with **the same `JWT_SECRET`** as the session
  cookie. Its own verifier pins the audience (`lib/ls.ts:96-99`), but
  `verifySessionToken` (`lib/auth.ts:55`) calls `jwtVerify(token, secret)` with
  **no options** — no audience, no algorithm pin. So the feed URL, which the app
  *displays to the user to copy into a podcast app*
  (`app/(app)/practice/audio/page.tsx:94`), is a valid `ph_session` value for 90
  days. The code comment at `lib/ls.ts:75-77` claims this "can never be mistaken
  for a login session"; that claim is false.
  **Fix:** pass `{ audience: "ph-session", algorithms: ["HS256"] }` to
  `verifySessionToken` and set a matching audience when minting. Two lines.
  Do this in Stage 0 — it does not need the migration.
- **`forEveryone` is honoured for non-staff.** `app/api/ai/homework/route.ts:47`
  destructures it with no gate; the `staff` check at :54 guards `assignees` only;
  :198-199 expands `forEveryone` to the whole roster for any caller. Today this
  is *intentional* (see the comment at :55-57 — anyone may assign to the family).
  **After tenancy it is a cross-tenant write.** It must become "everyone in *my*
  account" at Stage 2, not before.

---

## 1. Tenancy model

### Recommendation: option (c) — `accounts` + `memberships`, and re-key every user-scoped table from `username: text` to `userId: integer`

Three moving parts:

| Concept | Table | Meaning |
|---|---|---|
| The billing tenant | `accounts` | One per paying customer. A family, or an individual. |
| The person | `users` | Global identity. Owns credentials and email. |
| The link | `memberships` | (user, account, role) — **and the username lives here** |

Leaf tables (`notes`, `homework`, `cards`, …) get `userId int NOT NULL REFERENCES users(id)`.
They do **not** get an `accountId`.

### Why not (a) — `familyId` on every user-scoped table

The appeal is defence in depth: a forgotten join still gets filtered. But it does
not actually deliver that here.

- **The column is not the safety mechanism; the access pattern is.** With
  `accountId` on `notes`, `getNotesAll()` still returns every row in the table,
  because nothing *forces* the predicate. The bug class this codebase already has
  (unfiltered scans, bare-id reads) is untouched by adding a column. What forces
  a predicate is either Postgres RLS or a type-level scope — and once you have
  either, the column is redundant.
- **RLS is the one thing that would justify it, and it doesn't fit this stack.**
  The app uses `@neondatabase/serverless` over HTTP (`lib/db/index.ts`), where
  each query is its own implicit transaction — there is no connection on which to
  `SET LOCAL app.account_id`. Making RLS work means moving to a pooled driver
  and a per-request role. That is a large, separate project. Keep it as a later
  hardening option, not a stage-1 dependency.
- **Denormalisation gets torn the moment a user moves.** A child grows up and
  takes an individual subscription; parents separate; a tutor joins a second
  family. With `accountId` on twelve tables, moving one person is a twelve-table
  rewrite that must be transactional or the tenant is half-migrated. With
  `userId` keying, it is **one row** in `memberships`.
- The join cost argument is not real at family scale. `homework JOIN users JOIN
  memberships WHERE account_id = $1` on indexed integer columns, over tables with
  thousands of rows, is free.

### Why not pure (b) without re-keying

An `accounts`/`memberships` model that leaves the leaf tables keyed by
`username: text` is the worst of both worlds: it declares tenancy while leaving
the join key ambiguous. It has to be re-keyed.

### The central hazard: `username` stops being globally unique

This is the decision that everything else hangs off, so state it plainly.

**`username` moves from `users` to `memberships`, with
`UNIQUE (account_id, lower(username))`. `email` stays on `users` with a global
partial unique index. Username is no longer a global identifier — it is a handle
*within a family*.**

Consequences, each deliberate:

- **Adults sign in with email + password at `/login`.** Email is globally unique,
  so the lookup is unambiguous. This is the default path.
- **Children sign in at their family's own URL: `/entrar/<account-slug>`**, with
  username + password. `accounts.slug` scopes the lookup, so two families can
  both have a "Sarah". This is exactly how Seesaw / ClassDojo / Khan Academy
  handle minors, and it solves the no-email problem and the uniqueness problem
  with one mechanism. Bookmark it, or print a QR code.
- **A bare username at `/login` with no family context is rejected**, with the
  same generic error as a wrong password. Do *not* build "we found 3 families
  with that username, which is yours?" — that is a user-enumeration oracle.
- **Why `displayName` stays on `users` but `username` moves to `memberships`:**
  displayName is who you are; username is what you type to sign in *here*. A
  user in two accounts legitimately has two usernames and one name.
- **The existing eight keep their usernames unchanged**, in the `hanson` account.
  Nothing they type changes.

### One deliberate v1 constraint, with its escape hatch named

`memberships` gets `UNIQUE (user_id)` in v1 — **one account per user**. This
makes "which tenant is this session acting in?" unambiguous, which deletes a
whole class of bug (account-switching, stale `activeAccountId`, tokens minted for
the wrong tenant).

To relax later: drop that index, add `sessions.accountId` as the *active* tenant
(already in the schema below), and add an account switcher. No data migration.
That is why this is a join table and not `users.accountId` + `users.role` — the
smaller design is defensible for v1, but the product direction (the todo already
plans paid italki tutors) makes multi-account membership likely within a year,
and the escape hatch is worth the one extra join.

---

## 2. Schema

Drizzle terms. New tables first, then changes to existing ones.

### New: tenancy

```ts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  // Used in /entrar/<slug>. Lowercase, [a-z0-9-], 3-32 chars. Reserve a
  // denylist (api, admin, login, entrar, www, app, help, support, static).
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),                       // "The Hanson family"
  kind: text("kind").notNull().default("individual"), // individual | family
  stripeCustomerId: text("stripe_customer_id"),       // nullable until checkout
  // Non-null = entitled regardless of Stripe. This is how the Hansons are
  // never billed and never locked out, and how you comp a support case.
  compUntil: timestamp("comp_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("accounts_stripe_customer").on(t.stripeCustomerId)]);

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // The sign-in handle WITHIN this account. Unique per account, not globally.
  username: text("username").notNull(),
  role: text("role").notNull().default("child"), // owner | parent | child | tutor
  status: text("status").notNull().default("active"), // active | disabled
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  // THE constraint that replaces global username uniqueness.
  uniqueIndex("memberships_account_username")
    .on(t.accountId, sql`lower(${t.username})`),
  uniqueIndex("memberships_account_user").on(t.accountId, t.userId),
  // v1 only — drop this to allow multi-account membership (see §1).
  uniqueIndex("memberships_user_once").on(t.userId),
  index("memberships_account").on(t.accountId),
]);
```

**Roles.** `owner` (exactly one per account; holds billing; cannot be removed
without transfer), `parent` (manage children, assign homework, see all progress
in the account), `child` (own data only), `tutor` (reserved — like `parent` but
no billing rights, no member management; do not build until asked).

Mapping from today: `ADMIN_USERS` (Robert) → `users.isPlatformAdmin = true`
**plus** membership role `owner`. `TEACHER_USERS` (Kelly) → `parent`. Everyone
else → `child`. There is no separate `teacher` role in a family product; the
staff/student split that `requireStaff()` implements becomes
`role IN ('owner','parent','tutor')`.

**Critical:** platform admin is *not* a membership role. It is a global flag on
`users`, it must never be grantable through any account-scoped UI, and it must be
logged when used.

### Changed: `users` becomes the real identity table

```ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // WAS: username notNull().unique()  →  MOVED to memberships. See Stage 4.
  displayName: text("display_name").notNull(),
  email: text("email"),                       // NULLABLE — children have none
  emailVerifiedAt: timestamp("email_verified_at"),
  emailStatus: text("email_status").notNull().default("ok"), // ok | bounced | complained
  isMinor: boolean("is_minor").notNull().default(false),     // set at child creation
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
  status: text("status").notNull().default("active"),        // active | disabled
  cefrLevel: text("cefr_level").notNull().default("A2"),     // unchanged
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  // Partial unique — many children share NULL. Emit as a raw SQL migration:
  //   CREATE UNIQUE INDEX users_email_lower ON users (lower(email))
  //     WHERE email IS NOT NULL;
  uniqueIndex("users_email_lower").on(sql`lower(${t.email})`)
    .where(sql`${t.email} IS NOT NULL`),
]);
```

### New: credentials, sessions, tokens

```ts
export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Algo-prefixed so argon2id can replace scrypt later with rehash-on-login
  // and no migration:  "scrypt$16384$8$1$<b64 salt>$<b64 hash>"
  passwordHash: text("password_hash").notNull(),
  mustChange: boolean("must_change").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("credentials_user").on(t.userId)]);
```

A separate table, not a column on `users`, because a user must be able to exist
with **no** password: invited-but-not-accepted, magic-link-only, or a child whose
parent has not set one yet.

```ts
export const sessions = pgTable("sessions", {
  // Random 128-bit id, base64url. Public half of the cookie.
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // The tenant this session acts in. With memberships_user_once this is
  // determined, but storing it makes account-switching a later no-op.
  accountId: integer("account_id").notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  // sha256(secret || TOKEN_PEPPER). The secret half NEVER touches the DB.
  secretHash: text("secret_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  userAgent: text("user_agent"),
  ip: text("ip"),
}, (t) => [
  index("sessions_user").on(t.userId),
  index("sessions_expires").on(t.expiresAt),
]);
```

```ts
// One table for every single-use emailed token. `purpose` discriminates.
export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  // sha256(token || TOKEN_PEPPER). The raw token exists only in the email.
  tokenHash: text("token_hash").notNull().unique(),
  purpose: text("purpose").notNull(), // signin | invite | verify_email | reset_password
  email: text("email"),               // destination for signin/invite
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  role: text("role"),                 // invite only: role to grant on accept
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("auth_tokens_expires").on(t.expiresAt)]);
```

TTLs: `signin` 15 min, `reset_password` 60 min, `verify_email` 24 h, `invite`
7 days. All single-use (`consumedAt`). Purge expired rows in the daily cron.

### New: billing

```ts
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  plan: text("plan").notNull(),   // individual | family
  // Stripe's own status string, stored VERBATIM. Do not invent our own
  // vocabulary — it will drift: trialing | active | past_due | canceled |
  // incomplete | incomplete_expired | unpaid | paused
  status: text("status").notNull(),
  seatLimit: integer("seat_limit").notNull().default(1),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  // Freshness. Drives the self-healing read in §5.
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("subscriptions_account").on(t.accountId)]);

// Idempotency + replay. Insert-then-process gives exactly-once handling.
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),          // Stripe evt_... — the idempotency key
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),  // raw, so a bad handler can be replayed
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  error: text("error"),
});
```

### Changed: the twelve user-scoped tables

Add to each: `userId: integer("user_id").references(() => users.id, { onDelete: "cascade" })`.
Nullable at Stage 1, `NOT NULL` at Stage 4.

`notes`, `homework`, `quizzes`, `cards`, `review_logs`, `activity`, `ai_usage`,
`unit_progress`, `mission_attempts`, `ls_sessions` — one `userId`.
`kudos` — **two**: `fromUserId`, `toUserId`.

Indexes to add alongside (the current schema has almost none on `username`, so
these are new capability, not just parity):

```
notes(user_id)                     homework(user_id, status)
quizzes(user_id)                   cards(user_id, due)        -- the SRS hot path
review_logs(user_id)               activity(user_id, created_at DESC)
ai_usage(user_id, created_at)      mission_attempts(user_id)
ls_sessions(user_id)               kudos(to_user_id), kudos(from_user_id)
unit_progress: REPLACE uniqueIndex(username, item_id) with (user_id, item_id)
```

> `unit_progress_user_item` is load-bearing — it is what stops the XP
> double-award race fixed in `39239d7`. The replacement index must be created
> **before** the old one is dropped, in that order, or the race reopens.

### Shared/global content — leave alone, deliberately

`categories`, `ref_entries`, `lessons`, `units`, `unit_items`, `stories`,
`listening_clips`, `missions`, `tts_audio` stay global. They are the product's
content library, they cost real money to generate, and `tts_audio` gets *cheaper
per tenant* as tenants are added (`lib/tts.ts:57` — the hash has no username).
This is a genuine advantage; do not accidentally partition it.

Two consequences to handle at Stage 2, not later:
- Their `created_by` / `added_by` columns become meaningless across tenants.
  Keep them (audit value) but never authorise on them.
- **Writes** to shared content must become staff-gated *platform-wide*, not
  per-account. `deleteEntry` (`lib/actions/reference.ts:112`) currently lets any
  logged-in user delete any phrasebook row by bare id, including seeded content.
  Once strangers can sign up that is vandalism-as-a-service. Restrict shared-
  content mutation to `users.isPlatformAdmin`, and give tenants a per-account
  overlay table later if they want their own phrases.

### What happens to the existing eight users and their live data

Nothing is deleted, nothing is renamed, nobody is logged out.

1. Create `accounts` row: `slug: 'hanson'`, `kind: 'family'`,
   `compUntil: '2099-01-01'` — permanently entitled, never billed, never gated.
2. **Build the user list from the data, not from the `users` table.** The `users`
   table is only populated by `scripts/seed.ts` and `lib/actions/profile.ts:38`,
   so rows in `unit_progress`, `activity`, `cards` etc. may reference a username
   that has **no `users` row**. The backfill source must be:
   ```sql
   SELECT DISTINCT lower(username) FROM notes
   UNION SELECT DISTINCT lower(username) FROM homework
   UNION ... -- all 12 tables
   UNION SELECT DISTINCT lower(from_user) FROM kudos
   UNION SELECT DISTINCT lower(to_user)   FROM kudos
   ```
   Create a `users` row for every name in that set that lacks one.
3. Create a `memberships` row per user in account `hanson`, `username` = their
   current username verbatim, role from the current env lists (Robert →
   `owner` + `isPlatformAdmin`; Kelly → `parent`; other six → `child`,
   `isMinor = true` for the actual children).
4. **Credentials:** insert one row per user containing a scrypt hash of the
   current `SHARED_PASSWORD`, with `mustChange = true`. The app therefore keeps
   working through the cutover with the password everyone already knows, and the
   shared-password hole closes on each person's next login, which forces a
   personal password. Do *not* leave eight accounts sharing a password
   permanently — six of them belong to children.
5. Backfill `user_id` on all twelve tables by joining `lower(username)`.
6. **Hard gate before proceeding:** every table returns `0` for
   `COUNT(*) WHERE user_id IS NULL`, and `COUNT(DISTINCT user_id)` matches the
   membership count. If any table has a NULL, stop — that is silent data loss in
   progress (§8, R3).

---

## 3. Auth design

### Password hashing: `scrypt` from `node:crypto`

Parameters: `N = 2^15 (32768)`, `r = 8`, `p = 1`, 16-byte random salt, 64-byte
derived key, `maxmem: 64 * 1024 * 1024`. Roughly 100 ms on Vercel's Node runtime.

Why, given Vercel serverless specifically:

- **Zero dependencies, no native binary.** Vercel functions bundle and cold-start;
  a native module is one more thing that can fail on an architecture or Node
  version bump. `node:crypto` cannot.
- **Memory-hard.** bcrypt is not, and bcrypt also silently truncates at 72 bytes.
- **`bcryptjs` (pure JS) is rejected** — roughly an order of magnitude worse
  security per millisecond of CPU, and on a serverless function CPU is the
  budget.
- **argon2id via `@node-rs/argon2` is stronger** and is a legitimate choice; it
  is not chosen here only to avoid the native-module deploy risk. The algo prefix
  in `passwordHash` means switching later is rehash-on-successful-login with no
  migration and no forced reset.

Two gotchas to write into the implementation brief:

- `crypto.scrypt` throws at `N = 32768` unless `maxmem` is raised above the 32 MB
  default. Set it explicitly.
- **Always run the KDF, even when the user does not exist.** Compare against a
  fixed dummy hash. Otherwise response time is a username/email enumeration
  oracle, which matters far more once anyone can sign up.

### Username-or-email lookup

```
input contains "@"  →  email path:    users WHERE lower(email) = lower(input)
                                      (global, unique, unambiguous)
otherwise           →  username path: REQUIRES an account context
                                      memberships JOIN accounts
                                      WHERE accounts.slug = <ctx>
                                        AND lower(memberships.username) = lower(input)
```

The account context comes from the route: `/entrar/[slug]`. A bare username
posted to `/login` with no slug is rejected with the *same* generic message as a
wrong password ("Nome ou palavra-passe errados"). Never distinguish "no such
user" from "wrong password", and never enumerate families.

Rate limiting: the current limiter (`app/api/auth/login/route.ts:14`) is an
in-process `Map` — it resets on every cold start and is per-instance, so on
serverless it is close to decorative. Replace with a DB-backed counter keyed on
**both** IP and target identity (so one attacker cannot lock out a whole family's
IP, and so distributed guessing against one account is still caught). Keep
Turnstile on login, signup and magic-link request.

### Sessions: server-side and revocable. Reject the long-lived JWT.

Cookie value is `<sessionId>.<secret>`; the DB stores only
`sha256(secret || TOKEN_PEPPER)`. Verify by primary-key lookup on `sessionId`
then a constant-time compare. A database leak alone does not yield usable
cookies.

**Why not a long-lived JWT, given "remembered indefinitely":**

- **No revocation.** A stolen phone, a shared school laptop, a child removed from
  a family, a parent who cancels — none of them can be cut off until expiry. With
  minors and money in scope, that is not acceptable.
- **No propagation.** Role changes, plan changes and account disable would not
  take effect until the token expires. The entitlement check in §4 would be
  reading a stale claim.
- **This codebase already demonstrates the failure mode.** `getSession()` checks
  the signature and nothing else (`lib/auth.ts:55`), which is exactly why the LS
  feed token doubles as a login (§0). A JWT is a bearer assertion that nobody
  re-validates; that property is the bug.

**"Remembered indefinitely" is delivered by sliding expiry, not by a long JWT:**
`expiresAt = now + 365 days`, pushed forward on use but **written at most once
per 24 h** so it is not a DB write per request. Effectively indefinite while in
use; dead after a year of disuse; revocable in one UPDATE at any moment.

Cookie: rename to **`__Host-ph_session`** — the prefix requires `Secure`,
`Path=/` and no `Domain`, all of which are already true, and it gives a free
cutover signal (old name = legacy JWT, new name = DB session), so both can
coexist during Stage 3 without anyone being logged out.
Attributes: `httpOnly`, `secure`, `sameSite: 'lax'`, `path: '/'`, `maxAge` 1 year.

**Where the check runs** — this is a Next 16 correctness point, not a preference.
The bundled docs say: *"Proxy is not intended for slow data fetching… it should
not be used as a full session management or authorization solution"*
(`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md:29`), and
*"you should not attempt relying on shared modules or globals"*
(`.../03-file-conventions/proxy.md`). So:

- `proxy.ts` does an **optimistic check only**: is a well-formed cookie present?
  No DB. Redirect/401 if absent. Unchanged in cost from today.
- `lib/auth/dal.ts` `verifySession()` does the real work — DB lookup, revocation,
  expiry, membership, role — **memoized per request with React `cache()`**, so a
  page rendering twenty components pays one round-trip.
- The same doc also warns that auth checks in **layouts** are insufficient
  because layouts do not re-render on client-side navigation
  (`.../02-guides/authentication.md:1348`). `app/(app)/layout.tsx:11` currently
  relies on `requireSession()` in the layout. That must stop being the only
  check — every page, action and route calls `verifySession()` itself.

**Revocation triggers to implement:** password change → revoke all of that user's
sessions; parent removes/disables a child → revoke that child's sessions;
"sign out everywhere" button; a devices list showing `userAgent`/`lastSeenAt`.

### Magic links

Flow: request → always respond "check your email" regardless of whether the
address exists → email contains `/auth/magic?token=…` → **that page renders a
form with a POST button**, and only the POST consumes the token.

The POST step is not optional. Corporate mail filters and link prescanners issue
GET requests to every URL in an email; a GET-consumes design burns the token
before the human clicks it, and the user sees "this link has expired" on a link
they just received. This is the single most common magic-link support ticket.

Tokens: 32 random bytes, base64url, stored as
`sha256(token || TOKEN_PEPPER)`, single-use, 15-minute TTL, invalidated on use.
On consumption, mint a normal session — magic link is an *authentication method*,
not a different session type.

### How children sign in with no email

`/entrar/<account-slug>` + username + password set by a parent. That is the whole
mechanism, and it is the same one that solves username uniqueness (§1).

Rules that fall out of it, all of which must be enforced server-side:

- A `child` membership may not set or change an email address, may not request a
  magic link, may not receive any email (§6), may not invite anyone, and may not
  see billing.
- A parent sets and resets the child's password. Show it once at creation; do not
  email it.
- Optional, if asked for: a 4-6 digit PIN for young children. Only acceptable
  with a hard lockout after ~5 attempts and only on the family-slug path. A PIN
  is a weak secret; do not offer it as the default.

---

## 4. Entitlement

### Where the check lives so it cannot be bypassed

The rule that has already bitten this codebase once, in commit `39239d7`:
**every exported function in a `"use server"` file is a network-callable POST
endpoint.** There are 17 such files (16 in `lib/actions/` plus an inline one at
`app/(app)/missoes/[id]/page.tsx:13`). A paywall in a page component, or in
`proxy.ts`, is not a paywall.

Four layers, innermost first. Only the first two are load-bearing; the outer two
are UX.

1. **The money chokepoint — build it, because it does not exist.** Today every
   route calls `generateText`/`streamText` directly (§0.7). Introduce
   `lib/ai/spend.ts`:
   ```
   withSpend(scope: Scope, kind: UsageKind, fn: () => Promise<T>): Promise<T>
   ```
   It (a) asserts entitlement for the feature, (b) asserts the account's spend
   cap and rate limit, (c) runs `fn`, (d) calls `recordUsage`. Every paid call
   goes through it and `getModel()` becomes reachable only from inside it.
   With that in place, a forgotten check in a server action still cannot spend
   money. This also fixes the five currently-unguarded paid paths (§0.7) and
   turns `aiRateLimited()`'s row-count into a real cost cap.
2. **`verifySession()` as the first statement of every server action and route
   handler**, plus `assertCanActOn(viewer, targetUserId)` for anything touching
   another person's row. **`accountId` is always derived from the session and
   never accepted as an argument.**
3. Page-level guards, for a decent redirect instead of an error.
4. UI degradation — grey out, show the upgrade prompt.

**Two enforcement mechanisms, not just conventions:**

- **A `Scope` branded type.** Data-layer functions take
  `scope: Scope` (a branded object producible *only* by `verifySession()`), and
  `getDb()` stops being importable outside `lib/db/`. Calling `getNotes()`
  without a scope becomes a type error, not a code-review miss. This is the
  single highest-value structural change in the whole plan.
- **A CI gate**: a script that fails the build if any file containing
  `"use server"` exports a function that does not call `verifySession()` in its
  opening statements. Cheap, and it catches the exact regression class that
  produced the last IDOR.

### The free-vs-paid boundary as one function

Fact 8 hands us a natural line: **consuming already-generated artefacts is free;
generating is paid.** All the shared content (`stories`, `listening_clips`,
`units`, `ref_entries`, `tts_audio` on a cache hit) costs a DB read to serve.

```ts
// lib/billing/entitlement.ts — the ONLY place this question is answered.
export type Tier = "free" | "individual" | "family";
export type Feature =
  | "ai_tutor" | "ai_generate" | "conversa" | "speech_score"
  | "tts_synthesize"        // cache MISS only; cache hits are free
  | "listening_generate" | "ls_podcast"
  | "homework_assign" | "family_members" | "export";

export type Entitlement = {
  tier: Tier; status: string; seatLimit: number;
  activeUntil: Date | null; reason: string;   // for the banner + support
};

export function getEntitlement(accountId: number): Promise<Entitlement>;
export function can(e: Entitlement, f: Feature): boolean;
export function requireFeature(scope: Scope, f: Feature): Promise<void>; // throws
```

`can()` is imported by both the server (to refuse) and the UI (to grey out), with
the serialized `Entitlement` passed to client components as props — one source of
truth, no drift between what the button looks like and what the server allows.

Suggested mapping (the product owner sets the actual lines; the code shape does
not change):

| Free | Paid |
|---|---|
| Phrasebook browse, stories reading, Escutar playback | AI tutor, Conversa, quiz/lesson/homework/story generation |
| SRS review + FSRS scheduling of existing cards | Speech scoring, Listen & Speak MP3, new TTS synthesis |
| Verb drills, ditado grading, games mechanics | Listening-clip generation, phrasebook ingest/expansion |
| Units navigation, XP, own history, **export** | Homework assignment, adding family members |
| Cached TTS playback | |

Two deliberate choices in that table:

- **SRS review of existing cards stays free even on a lapsed subscription.** It
  costs nothing to serve, and breaking someone's 200-day streak is both the
  cruellest possible degradation and the thing most likely to make them never
  come back. It is also the strongest reason to resubscribe.
- **Export is always free, forever, including after cancellation.** It is the
  right thing to do, it is a GDPR obligation anyway, and it removes the "they're
  holding my child's work hostage" complaint.

### Stripe lag, failed payments, cancellation grace

**Checkout lag — do not wait for the webhook.** On the `success_url` return,
retrieve the session server-side (`stripe.checkout.sessions.retrieve(id, {
expand: ['subscription'] })`) and upsert immediately. Access is granted only if
that retrieve confirms `active` or `trialing`. The webhook then arrives and is
idempotent. Do **not** grant an optimistic grace on "a checkout was started" —
anyone can start a checkout.

**Status → access policy:**

| Stripe status | Access | UI |
|---|---|---|
| `trialing`, `active` | Full | Normal. Trial shows days remaining. |
| `past_due` | **Full**, for the whole dunning window | Persistent banner + email. Do not punish an expired card. |
| `cancel_at_period_end = true` | Full until `currentPeriodEnd` | "Ends on <date>", one-click resubscribe |
| `unpaid`, `canceled` | Degraded (free tier) | Banner, data intact, export offered |
| `incomplete`, `incomplete_expired`, `paused` | Degraded | "Finish setting up payment" |
| `compUntil > now()` | Full, always | Nothing. This is how the Hansons stay unbilled. |

**Degrade, never delete.** On lapse: all notes, homework, quizzes, progress, XP
and history remain visible and exportable; SRS keeps working; paid generation
stops. No data is ever deleted on non-payment — only on explicit account deletion
by the owner, and then with a 30-day soft-delete window.

**Never lock out mid-action.** Entitlement is evaluated per request, so a lapse
takes effect on the next call with a clear message, not a crash.

**Fail-safe direction:** if Stripe is unreachable, serve the last known
entitlement and alert. Never revoke access because of an outage on our side.

---

## 5. Stripe integration shape

### Objects

- **Products ×2** — "Portuguese Hub Individual", "Portuguese Hub Family".
- **Prices ×4** — monthly + yearly for each. Yearly is the retention lever.
  Price IDs come from env; **never hardcode an amount in code**, and never trust
  a price ID sent by the client — map `plan+interval → env price ID` server-side.
- **Customer** — one per **account**, not per user. `accounts.stripeCustomerId`.
  Set `metadata.accountId` on the Customer. This is what makes every webhook
  resolvable without a reverse lookup.
- **Subscription** — one per account. Also set `metadata.accountId`.
- **Checkout Session** — `mode: 'subscription'`,
  `client_reference_id: accountId`, existing `customer` when known,
  `success_url` with `{CHECKOUT_SESSION_ID}`, `allow_promotion_codes: true`,
  and `automatic_tax: { enabled: true }` (see the VAT note in §9).
- **Billing Portal** — card updates, plan changes, cancellation, invoice history,
  receipts. **Build none of that.** Configure it in the Stripe dashboard and link
  to it. This removes more work from the project than any other single decision.

### Load-bearing webhooks — and nothing else

| Event | What it does |
|---|---|
| `checkout.session.completed` | Link customer + subscription to the account (belt; the synchronous retrieve is the braces) |
| `customer.subscription.created` | Create the local row |
| `customer.subscription.updated` | **The workhorse** — status, price, cancel_at_period_end, period end |
| `customer.subscription.deleted` | Degrade to free |
| `invoice.paid` | Extend period, in-product confirmation |
| `invoice.payment_failed` | Dunning banner + nudge email |
| `customer.subscription.trial_will_end` | 3-day heads-up (optional) |

Everything else is noise. Subscribe to exactly these in the endpoint config.

### Handler requirements — each of these is a classic failure

- **Read the raw body.** `const raw = await request.text()` then
  `stripe.webhooks.constructEvent(raw, sig, secret)`. Parsing JSON first breaks
  signature verification.
- **Add the route to `PUBLIC_PATHS` in `proxy.ts`** — Stripe sends no cookie —
  and let the signature be its only authentication.
- **Idempotency:** `INSERT INTO webhook_events (id, …) ON CONFLICT DO NOTHING`.
  Zero rows affected → already handled → return 200 immediately. Stripe retries;
  this makes retries free.
- **Order-independence:** Stripe does not guarantee delivery order, and a stale
  `updated` arriving after a `deleted` will happily write `active` over
  `canceled`. **Do not trust the event payload's state.** On any subscription
  event, re-retrieve `stripe.subscriptions.retrieve(id)` and write *that*. One
  extra API call buys complete order-independence — much simpler than
  timestamp-comparison logic, and impossible to get subtly wrong.
- **Return 200 fast.** Keep the handler small.

### Seat counting for the family plan

A seat is one `memberships` row with `status = 'active'` in the account, owner
included.

**Recommendation: flat-price family plan with a hard cap (say 6 members), not
per-seat metered billing.** Reasons: children are added and removed constantly;
proration on a family plan generates support tickets worth more than the revenue
difference at this price point; and "one price, up to 6 people" is a far easier
thing to put on a pricing page. Enforce the cap at invite time via
`can(entitlement, 'family_members')`.

If per-seat is insisted on: `quantity` on the subscription item, updated with
`proration_behavior: 'create_prorations'`, and quantity may never be set below
the current active-member count. Flagged in §9 as something to push back on.

### Keeping the local record honest — four independent belts

1. Idempotent `webhook_events` log keyed on `event.id`.
2. **Self-healing read:** if `subscriptions.lastSyncedAt` is older than 12 h, the
   entitlement check refreshes from the Stripe API inline (once, memoized) before
   answering. A silently-missed webhook heals on the next page load.
3. **Daily reconciliation cron** (Vercel Cron → a route authenticated by
   `CRON_SECRET`, which must therefore be in `PUBLIC_PATHS`): list subscriptions
   changed since the last run, reconcile, and log divergences. Also purges
   expired `auth_tokens` and `sessions`.
4. Stripe dashboard alerting on webhook delivery failures.

Money gets four belts. Nothing else in this plan does.

---

## 6. Resend integration shape

### Transactional emails

Let **Stripe** send receipts, invoices, and card-expiry/dunning mail — it is
configured in the dashboard, it is legally formatted, and rebuilding it is pure
cost. Resend sends only what Stripe cannot:

| # | Email | Contains | Trigger |
|---|---|---|---|
| 1 | Magic-link sign-in | One button to a **POST-confirm** page, 15-min expiry, "ignore if this wasn't you". No account details. | User request |
| 2 | Verify email | Confirm button, 24 h | Signup, email change |
| 3 | Password reset | Reset button, 60 min; **using it revokes all sessions** | User request |
| 4 | Family invitation | Who invited, what account, what role, 7-day expiry | Parent/owner invites an adult |
| 5 | Welcome | What to do first, link to `/entrar/<slug>` for the family | First successful checkout |
| 6 | Trial ending | 3 days out, one-click manage | `trial_will_end` |
| 7 | Payment problem | In-product-tone nudge + portal link | `invoice.payment_failed` |
| 8 | Subscription ended — your data is safe | What is kept, what is paused, export link | `subscription.deleted` |
| 9 | *Later:* weekly family digest | Each child's XP, streak, homework due | Cron, parents only |

### How a child's non-existent address is made unreachable

Not by convention — by construction. **One function is the only way mail leaves
the system:**

```ts
resolveRecipient(userId): Promise<{ email: string; name: string } | null>
```

It returns `null` — and therefore sends nothing — when the user has no email,
when `users.isMinor` is true, or when `users.emailStatus !== 'ok'`. `sendEmail()`
accepts a `userId`, never a raw address, for anything user-triggered. A raw
address is permitted only for genuinely address-first flows (signup verification,
invitation to someone who has no account yet), and those live in a separate
`sendToAddress()` that is used in exactly three places.

`users.isMinor` exists precisely so the rule is explicit rather than an accident
of `email` happening to be NULL — a parent could enter a child's address, and the
guard must still hold.

**Substitution rule:** anything *about* a child goes to the account's parents and
owner, naming the child. Children receive nothing, ever.

### Domain and DNS

Send from a **subdomain**: `mail.port.robertjeremiah.com`. Not the apex — it
keeps transactional reputation isolated and avoids colliding with existing apex
records. DNS is likely at Vercel for this domain; the records go wherever the
zone is.

Records needed, **using the exact values Resend generates in its dashboard**
(do not copy values from anywhere else):

- **DKIM** — TXT at `resend._domainkey.mail.…` (Resend supplies the key).
- **SPF** — TXT on the sending subdomain, the `include:` that Resend specifies.
- **MX** — on the subdomain, for Resend's return-path / bounce handling.
- **DMARC** — TXT at `_dmarc.port.robertjeremiah.com`. Start `p=none` with a
  `rua=` reporting address; tighten to `p=quarantine` after two clean weeks.

Domain verification must be **complete before Stage 3**, because magic links and
password reset depend on it, and DNS propagation is the one part of this project
that cannot be hurried. Start it in Stage 0.

**Bounce handling:** subscribe to Resend's bounce/complaint webhook and set
`users.emailStatus`. Without it, repeated sends to a dead address will damage
domain reputation and eventually the magic links stop arriving for everyone.

---

## 7. Migration sequence

Each stage ships independently. The app works for the Hansons at every point.

### Stage 0 — Safety net *(reversible; ships nothing user-visible)*

- Replace `drizzle-kit push` with `generate` + `migrate`. Commit a baseline
  migration that exactly matches the current production schema. **Delete the
  `db:push` script from `package.json`** and update `CLAUDE.md`, which currently
  instructs every agent to use it.
- `pg_dump` production, restore it to a Neon branch, and **verify the restore
  works**. Nothing is a backup until it has been restored once.
- Establish the rehearsal workflow: every migration below runs on a Neon branch
  of production data first, and the verification queries are run there.
- Start Resend domain verification (DNS lead time).
- Fix the two live defects in §0: pin `audience` + `algorithms` in
  `verifySessionToken`, and mint session tokens with a distinct audience.

**Done when:** a migration can be generated, reviewed as SQL, applied to a Neon
branch, and the branch verified; `db:push` no longer exists; the LS token no
longer authenticates as a session.

### Stage 1 — Identity tables, dormant *(reversible)*

- Create `accounts`, `memberships`, `credentials`, `sessions`, `auth_tokens`,
  `subscriptions`, `webhook_events`. Add **nullable** `user_id` to the twelve
  user-scoped tables (`kudos` gets two). No application code reads any of it.
- Run the backfill in §2 — including building the user list from the UNION across
  all twelve tables, not from `users`.

**Done when:** every user-scoped table returns 0 for `user_id IS NULL`;
`COUNT(DISTINCT user_id)` per table is ≤ the membership count; the eight
memberships exist with the right roles; the app behaves identically.
**Reversible:** drop the new tables and columns.

### Stage 2 — Data Access Layer, `Scope` type, and tenant scoping *(reversible)*

This is the security-critical stage, and it must land **before any outsider can
sign up**.

- Add `lib/auth/dal.ts` with `verifySession()` (`cache()`-memoized) and the
  branded `Scope` type. Stop exporting `getDb()` outside `lib/db/`.
- Rewrite `lib/data.ts` and all 17 `"use server"` files to take a `Scope` and
  filter by `user_id` — while still **writing both** `username` and `user_id`
  (dual-write is what makes this reversible).
- Specifically fix, because these are cross-tenant holes the moment tenancy
  exists: `getNotesAll`, `getHomeworkAll`, `getQuizzesAll`, `getRecentKudos`,
  `getStats`'s family-wide `recent` feed, `getFamilyBoard`'s roster parameter,
  `getNote`/`getQuiz`/`getHomeworkItem` bare-id reads, `cloneQuiz`
  (`lib/actions/quiz.ts:153` — enumerable cross-user quiz read),
  `updateNote`/`deleteNote` (`lib/actions/notes.ts:24,43` — any user may edit
  any note), `deleteEntry` (`lib/actions/reference.ts:112`),
  `isFamily()` (`lib/actions/kudos.ts:9` — env list → account membership),
  `forEveryone` (`app/api/ai/homework/route.ts:198`),
  and `app/api/listening/human/route.ts:92` (any user overwrites any clip).
- Move the ownership predicate **into the WHERE clause** everywhere it is
  currently a preceding SELECT-then-check (six sites in `homework.ts`, plus
  `quiz.ts:139`, `review.ts:25`). Guard-then-write is the exact shape the last
  IDOR took.
- Roles come from `memberships.role`, not env. `requireStaff()` becomes
  `role IN ('owner','parent','tutor')`.
- Add the CI gate on `"use server"` exports.
- Build `withSpend()` (§4) and route all paid calls through it, including the
  five currently unguarded.

Auth is still the old shared-password JWT throughout. Nothing user-visible
changes for the family.

**Done when:** every function in `lib/data.ts` and `lib/actions/` takes a
`Scope`; the CI gate passes; a manual test signing in as a fabricated second
account cannot read or write any row belonging to the first; a fresh reviewer
agent with no build context has critiqued the whole diff.

### Stage 3 — Real auth *(mostly reversible)*

- `sessions` table in use. `__Host-ph_session` opaque token. `proxy.ts` reduced
  to the optimistic cookie-presence check. `verifySession()` does the DB check.
- **Accept both cookies during the window:** on any request carrying a legacy
  `ph_session` JWT, mint a real session, set the new cookie, clear the old one.
  Nobody is logged out.
- New login page: email-or-username + password. `/entrar/[slug]` for family and
  child login. Forced password change for the eight (`mustChange`).
  Password reset. DB-backed login rate limiting.
- Retire `SHARED_PASSWORD`, `VALID_USERS`, `ADMIN_USERS`, `TEACHER_USERS` **at
  the end of this stage**, only after confirming all eight have set personal
  passwords.
- Magic link is *deferred* — see §9.

**Reversibility:** reversible until the env vars are removed and people have set
personal passwords; after that a rollback logs everyone out and they would need
resets. Treat the env-var removal as a **soft one-way door** and do it as its own
small deploy.

### Stage 4 — Drop the `username` columns *(**ONE-WAY DOOR** — and optional)*

- Only after Stages 2-3 have soaked for at least a week with zero
  `user_id IS NULL` on every table.
- Create the new `unit_progress (user_id, item_id)` unique index **before**
  dropping the old `(username, item_id)` one.
- Add `NOT NULL` + FKs + the indexes listed in §2. Stop writing `username`. Then
  drop the columns.
- Requires a fresh verified dump taken immediately before.

**This stage has no deadline and can be skipped indefinitely.** Leaving twelve
dead text columns in place costs essentially nothing. Do not let a tidiness
impulse push an irreversible change ahead of the soak.

### Stage 5 — Billing *(code reversible; live Stripe is one-way)*

- Stripe products and prices created **in test mode first**, and the entire flow
  exercised end to end with test cards including a failed payment and a
  cancellation.
- Webhook endpoint, `webhook_events`, `subscriptions`, `getEntitlement()`,
  `can()`, `requireFeature()`, the reconciliation cron.
- The Hanson account has `compUntil` far-future and must be verified to be
  ungated at every step.
- Paywall enforced server-side at `withSpend()` and `requireFeature()`; UI
  degradation using the same `can()`.

**One-way:** creating live-mode objects and taking a first real payment brings
refund obligations, VAT records and consumer-law duties (§9).

### Stage 6 — Email, beyond the auth minimum *(reversible)*

Invitations, welcome, trial-ending, payment-problem, subscription-ended, the
bounce webhook, `resolveRecipient()` hardening. (The auth-critical subset —
reset and verification — shipped in Stage 3 on the domain verified in Stage 0.)

### Stage 7 — Public signup *(**ONE-WAY DOOR in practice**)*

Open registration, pricing page, Turnstile on signup, abuse limits, terms and
privacy pages, the GDPR/consent posture for minors.

The moment a stranger's data is in the database, casual restructuring ends and
real controller obligations begin. Everything above should be finished, soaked
and reviewed first.

### Cross-cutting blocker, must land before Stage 7

**Move audio blobs out of Postgres.** `tts_audio.audio_b64`,
`listening_clips.audio_b64` and `ls_sessions.audio_b64` store base64 in the
database. The project's own `tasks/todo.md` already flags this: Neon free tier is
0.5 GB and base64 inflates 1.33×. With one family it is survivable. With paying
tenants generating Listen & Speak MP3s it is a hard wall, and hitting it takes
the database down for everyone at once. Blob/R2 with the DB holding keys.

---

## 8. The five biggest risks

### R1 — `drizzle-kit push` destroys production data

**Why it is first:** there is no migration history at all (`./drizzle` does not
exist), `push` is the documented workflow in `CLAUDE.md` so every agent reaches
for it, and `push` will drop a column it believes has been removed. This
migration renames and re-keys twelve tables — the exact conditions under which
push's diff is most likely to be wrong. The family's 126 units of progress, SRS
decks and homework history have no other copy.

**Mitigation:** Stage 0 switches to generated, human-reviewed SQL migrations and
**deletes the `db:push` script** so it cannot be invoked; `CLAUDE.md` is updated
in the same commit so no future agent is told to use it; every migration is
rehearsed on a Neon branch of production; a verified restore precedes every
one-way stage.

### R2 — Cross-tenant exposure through the currently-unscoped readers

**Why:** `lib/data.ts` has functions that return every row in a table with no
predicate whatsoever, and by-id readers with no owner check — correct today,
catastrophic the day a second family exists. `cloneQuiz` reads any quiz by
enumerable id. `updateNote`/`deleteNote` let any user edit anyone's note. The
data at stake is children's writing, voice recordings and progress.

**Mitigation:** Stage 2 lands scoping strictly before Stage 7 opens signup; the
branded `Scope` type makes an unscoped call a *type error* rather than a
code-review miss; `getDb()` becomes unimportable outside `lib/db/`; the CI gate
on `"use server"` exports; an explicit adversarial test that signs in as family B
and walks ids 1..N from family A across every entity; and a fresh reviewer agent
with no build context critiques the diff — which is exactly how the last three
security bugs were found.

### R3 — Silent data loss during the username → userId backfill

**Why:** usernames are bare text with no FK. Rows exist in `unit_progress`,
`activity` and `cards` for usernames that may have no `users` row, because
`users` is only populated by the seed script and one profile upsert. Casing is
inconsistent — some writes lowercase, some do not. A backfill that joins on
`users` or on exact case leaves `user_id` NULL, and those rows then become
invisible to a scoped query. That is data loss by disappearance, which is far
harder to notice than deletion — and if `username` has already been dropped, it
is unrecoverable.

**Mitigation:** build the user list from `SELECT DISTINCT lower(username)`
UNION-ed across **all twelve tables plus both kudos columns**, not from `users`;
create missing `users` rows; make `COUNT(*) WHERE user_id IS NULL = 0` on every
table a **hard gate** that blocks the stage; dual-write for a full week; and
never drop `username` until that soak is clean (Stage 4 is optional and has no
deadline).

### R4 — Entitlement bypass through server actions

**Why:** all 17 `"use server"` files export public POST endpoints, and this
codebase has already shipped an IDOR from exactly that oversight (`39239d7`).
There is currently no single point through which paid work passes — 16 routes
hand-copy a rate-limit call and five paid paths omit it entirely. A check placed
in a page, a layout or `proxy.ts` is trivially bypassed by calling the action
directly.

**Mitigation:** put the entitlement assertion **inside `withSpend()`**, the one
function every paid call must pass through, so money cannot be spent even if an
action forgets; `verifySession()` as the first statement of every action and
route; `assertCanActOn(viewer, targetUserId)` for anything touching another
person; `accountId` always derived from the session and never accepted as an
argument; the CI gate; and one adversarial review pass over the finished
paywall.

### R5 — Stripe and local state diverge

**Why:** webhooks are missed, retried and delivered out of order. A naive handler
that trusts the payload will write a stale `active` over a `canceled`, or the
reverse — meaning either someone pays and is locked out, or someone stops paying
and keeps full access. Both are expensive; the first is a refund and a bad review.

**Mitigation:** idempotent `webhook_events` keyed on `event.id`; **re-retrieve
the subscription from the Stripe API on every subscription event rather than
trusting the payload**, which makes ordering irrelevant by construction; the
synchronous `checkout.sessions.retrieve` on the success redirect so nobody waits
on a webhook; `lastSyncedAt` staleness triggering an inline refresh on read; a
daily reconciliation cron; Stripe delivery-failure alerts; and a fail-safe
direction — when Stripe is unreachable, serve the last known entitlement and
alert rather than revoking access.

### Did not make the top five, but do not ignore

- **Children's personal data.** Under GDPR the digital-consent age in Portugal is
  13; the UK and much of the EU differ; US COPPA is under 13. The design already
  routes child creation through a verified paying parent, which is the right
  shape, but **voice recordings of minors** (`app/api/stt`, `conversa`,
  `missions/attempt`) are personal data of a sensitive kind and need a stated
  retention period and a deletion path. This is a policy item, not a coding task.
- **Audio blobs in Postgres** — see the cross-cutting blocker in §7.
- **`ls_sessions` podcast tokens have no revocation.** 90-day bearer credentials
  in URLs, served with `Cache-Control: immutable`
  (`app/api/ls/audio/route.ts:55`), landing in podcast-app logs. Once the
  `sessions` table exists, reissue these as revocable records with a `jti`.

---

## 9. What I would push back on

Flagged as asked. None of these blocks the plan; all should be decided
deliberately rather than by default.

1. **"Sessions remembered on a device indefinitely" — for adults, yes; for
   children, no.** A child's session lives on a shared family iPad or a school
   Chromebook. Recommend indefinite sliding expiry for `owner`/`parent`, a
   shorter window (90 days) for `child`, and a visible "signed in as Sammy"
   affordance with fast switching. The revocable session store makes this a
   one-line policy difference rather than a redesign.

2. **Magic links are the lowest-value item in the brief and should be deferred
   past launch.** Passwords already exist, so magic links add a second full auth
   path (delivery reliability, prescanner token burn, phishing surface, a whole
   new class of support ticket) for users who mostly are not blocked. When built,
   the POST-confirm step in §3 is mandatory. Recommend: not in Stage 3.

3. **Per-seat billing on a family plan.** Flat price with a member cap. Proration
   on a plan where children are added and removed constantly will generate more
   support cost than seat revenue at this price point.

4. **Selling to EU consumers is not a coding task.** VAT/OSS registration and
   thresholds, Stripe Tax, the 14-day statutory withdrawal right for digital
   services (and the waiver flow that lets you start immediately), terms of
   service, a privacy policy, and a defensible position on processing children's
   data. Half an hour with an accountant before Stage 7 is cheaper than any of
   the alternatives. This is the single most underestimated item in the project.

5. **The strongest objection is about the product, not the code, and it comes
   from your own notes.** `tasks/todo.md` says it plainly: 126 units, their notes,
   dialogues and verb tables are all model output with **no native-speaker
   review**, and the eight people using it cannot detect a Brazilianism. That is
   an acceptable risk for a family project. Charging strangers for European
   Portuguese instruction that has never been read by a European Portuguese
   speaker is a different proposition, and one bad review naming a Brazilianism
   is worth more damage than the first year's revenue. **Recommend: the
   native-speaker (or adversarial second-model) review pass gating unit publish —
   already on your list — becomes a hard prerequisite for Stage 7, not a
   nice-to-have.**

6. **Build vs buy for auth.** Better Auth, Clerk and WorkOS all ship
   organizations + Stripe. They were considered and are not recommended here,
   because the requirement that makes this app unusual — minors with no email
   signing in with a family-scoped username — is precisely where hosted auth gets
   awkward, and per-MAU pricing is hostile to a family plan where six of seven
   MAUs are children on one subscription. Building is the right call, but it is a
   call, and the reason it is right is the child-login model specifically. If
   that requirement ever softens, revisit.

7. **`unit_progress`, `activity` and `stories` accept client-asserted scores.**
   `finishStory`, `finishDitado`, `finishGame`, `finishVerbRound` take `score`
   and `total` straight from the client into XP and the leaderboard. Harmless
   between siblings; embarrassing on a public leaderboard, and it makes any
   future "certificate" or streak-based retention feature meaningless. Worth
   fixing when the family board becomes account-scoped in Stage 2.

---

## Appendix — environment variables the owner must supply

The owner must create the Stripe and Resend accounts; these cannot be provisioned
by an agent.

### Stripe (owner creates the account)

| Variable | What it is | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` / `sk_live_…` | Server only. **Never** prefix with `NEXT_PUBLIC_`. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | From the webhook endpoint definition. **Different per endpoint and per mode** — the most common misconfiguration. |
| `STRIPE_PRICE_INDIVIDUAL_MONTHLY` | `price_…` | |
| `STRIPE_PRICE_INDIVIDUAL_YEARLY` | `price_…` | |
| `STRIPE_PRICE_FAMILY_MONTHLY` | `price_…` | |
| `STRIPE_PRICE_FAMILY_YEARLY` | `price_…` | |
| `STRIPE_PORTAL_CONFIGURATION_ID` | optional | Only if a non-default portal config is wanted. |
| `BILLING_TRIAL_DAYS` | optional, e.g. `14` | |

Not needed: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. With hosted Checkout and the
hosted Billing Portal (the recommendation), Stripe.js never loads.

### Resend (owner creates the account and adds DNS)

| Variable | What it is |
|---|---|
| `RESEND_API_KEY` | `re_…` |
| `EMAIL_FROM` | e.g. `Portuguese Hub <ola@mail.port.robertjeremiah.com>` |
| `EMAIL_REPLY_TO` | a monitored human address |
| `RESEND_WEBHOOK_SECRET` | bounce/complaint webhook signature |

Plus the DKIM / SPF / MX / DMARC records in §6, using Resend's generated values.

### App

| Variable | What it is |
|---|---|
| `APP_URL` | Absolute base URL. **New and load-bearing** — magic links and Stripe redirect URLs cannot be built without it. |
| `TOKEN_PEPPER` | 32+ random bytes. Mixed into session-secret and auth-token hashing so a database leak alone yields no usable tokens. Rotating it invalidates all sessions and pending tokens. |
| `CRON_SECRET` | Authenticates the reconciliation cron route (which must be in `PUBLIC_PATHS`). Vercel Cron sends it as `Authorization: Bearer`. |

### Kept

`DATABASE_URL`, `JWT_SECRET` (still signs the LS feed tokens; keep until those
are reissued as revocable records), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
`TURNSTILE_SECRET_KEY`, `AI_MODEL`, `AI_GATEWAY_API_KEY`, and the still-pending
`AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION`.

### Retired at the end of Stage 3

`SHARED_PASSWORD`, `VALID_USERS`, `ADMIN_USERS`, `TEACHER_USERS` — all four
replaced by `memberships.role` and `users.is_platform_admin`.
