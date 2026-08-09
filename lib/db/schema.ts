import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  // A1 | A2 | B1 | B2 — set by the placement quiz, filters default to level ±1.
  cefrLevel: text("cefr_level").notNull().default("A2"),
  // Where the learner actually lives, asked during onboarding. null means not
  // asked yet, which is NOT the same as "no" — generated content stays generic
  // until we know, rather than guessing at a town.
  livesInPortugal: boolean("lives_in_portugal"),
  /** Free text as the learner typed it: "Ericeira", "Lisboa", "Austin, Texas". */
  locality: text("locality"),
  /** zones.slug — the region they picked. null when abroad or not asked. */
  zoneSlug: text("zone_slug"),
  /** zone_places.slug — the optional "where in that zone". */
  placeSlug: text("place_slug"),
  /** Login identifier and the address account mail goes to. Optional. */
  email: text("email"),
  /** scrypt hash. null means this account still uses the shared password. */
  passwordHash: text("password_hash"),
  /** admin | teacher | student. null falls back to the ADMIN_USERS/TEACHER_USERS env lists. */
  role: text("role"),
  /** Soft delete: an inactive account keeps its history but cannot sign in. */
  active: boolean("active").notNull().default(true),
  /**
   * simple | full — how much of the app this person sees. New accounts start
   * simple: one guided step at a time. Full exposes every feature.
   */
  mode: text("mode").notNull().default("simple"),
  /**
   * Answers to the post-placement questionnaire — see lib/learning-path.ts for
   * the shape. jsonb because every answer drives a different lever and the set
   * will change as we learn which questions earn their place.
   */
  prefs: jsonb("prefs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  namePt: text("name_pt").notNull(),
  nameEn: text("name_en").notNull(),
  emoji: text("emoji").notNull().default("📖"),
  blurbEn: text("blurb_en"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: text("created_by").notNull().default("seed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// kind: term | verb | phrase | task
export const refEntries = pgTable("ref_entries", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("term"),
  section: text("section").notNull().default("Geral"),
  pt: text("pt").notNull(),
  en: text("en").notNull(),
  replyPt: text("reply_pt"),
  replyEn: text("reply_en"),
  note: text("note"),
  addedBy: text("added_by").notNull().default("seed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  tags: text("tags").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// blocks: array of typed lesson blocks (intro/prompts/vocab/reading/writing/speaking/game)
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  level: text("level").notNull().default("A2"),
  descriptionEn: text("description_en"),
  blocks: jsonb("blocks").notNull(),
  source: text("source").notNull().default("seed"), // seed | ai | user
  createdBy: text("created_by").notNull().default("seed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// status: open | submitted | reviewed
// items: HomeworkItem[] — one exercise per entry, each answered and graded
// on its own so the learner gets feedback before moving to the next.
export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  items: jsonb("items"),
  lessonId: integer("lesson_id").references(() => lessons.id, {
    onDelete: "set null",
  }),
  source: text("source").notNull().default("ai"), // ai | user | class
  status: text("status").notNull().default("open"),
  response: text("response"),
  feedback: text("feedback"),
  /** The unit path item this TPC fulfils, so finishing it ticks the course
   *  forward. Without somewhere to STORE the link, threading a query param
   *  through was never going to be enough — the grading happens question by
   *  question, long after the URL is gone. */
  unitItemId: integer("unit_item_id").references(() => unitItems.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
});

// questions/answers/feedback are JSON; status: ready | completed
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  topic: text("topic").notNull(),
  level: text("level").notNull().default("A2"),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers"),
  score: integer("score"),
  total: integer("total"),
  feedback: jsonb("feedback"),
  status: text("status").notNull().default("ready"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// kind: star (golden star for an achievement) | note (encouragement message)
export const kudos = pgTable("kudos", {
  id: serial("id").primaryKey(),
  fromUser: text("from_user").notNull(),
  toUser: text("to_user").notNull(),
  kind: text("kind").notNull().default("note"),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per AI call, so each person can see what they've actually spent.
export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  kind: text("kind").notNull(), // tutor | quiz | grade | homework | lesson | reference | suggest
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  // Micro-dollars (USD × 1e6) — integers avoid float drift on tiny amounts.
  costMicroUsd: integer("cost_micro_usd").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Spaced-repetition cards (FSRS). Shared content, per-user memory:
// kind: entry (from the phrasebook) | mistake (from graded errors) | verb.
// `fsrs` holds the serialized ts-fsrs Card; due/state are denormalized for queries.
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  kind: text("kind").notNull().default("entry"),
  sourceId: integer("source_id"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  note: text("note"),
  direction: text("direction").notNull().default("en-pt"),
  fsrs: jsonb("fsrs").notNull(),
  due: timestamp("due").notNull(),
  state: integer("state").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewLogs = pgTable("review_logs", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cached TTS audio (base64 mp3) so each phrase is synthesized exactly once.
/**
 * audioKey points at R2; audioB64 is the legacy inline copy. Exactly one of
 * them is set per row, and reads try the key first — that is what lets the
 * migration run gradually instead of as a big bang.
 */
export const ttsAudio = pgTable("tts_audio", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  text: text("text").notNull(),
  voice: text("voice").notNull(),
  /** Legacy inline copy. Null once the row lives in R2. */
  audioB64: text("audio_b64"),
  audioKey: text("audio_key"),
  bytes: integer("bytes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Serialized graded-reader chapters set in the family's real life.
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  seriesTitle: text("series_title").notNull(),
  chapter: integer("chapter").notNull().default(1),
  title: text("title").notNull(),
  level: text("level").notNull().default("A2"),
  textPt: text("text_pt").notNull(),
  textEn: text("text_en").notNull(),
  glossary: jsonb("glossary").notNull(), // [{pt, en}]
  questions: jsonb("questions").notNull(), // [{promptPt, options[4], answer}]
  createdBy: text("created_by").notNull().default("seed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Listening library: multi-voice dialogues with word-synced transcripts.
// transcript: {lines: [{speaker, voice, text, words: [{w, start, end}]}]}
// A human recording (source='human') overrides the TTS take when present.
export const listeningClips = pgTable("listening_clips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  cefr: text("cefr").notNull().default("A2"),
  topic: text("topic").notNull().default(""),
  transcript: jsonb("transcript").notNull(),
  /** Legacy inline copy. Null once the row lives in R2. */
  audioB64: text("audio_b64"),
  audioKey: text("audio_key"),
  bytes: integer("bytes").notNull().default(0),
  source: text("source").notNull().default("ai"), // ai | human
  createdBy: text("created_by").notNull().default("ai"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Curriculum spine: a unit = Learning Note + ordered references to existing
// activities (quiz topics, ditado, stories, phrasebook categories…).
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** Portuguese title, shown under the English one like a real course index. */
  titlePt: text("title_pt").notNull().default(""),
  /** communication | grammar | grammar-practice | vocabulary — makes the
   *  interleaving of the syllabus visible and auditable. */
  category: text("category").notNull().default("communication"),
  /** One line, second person: what you'll be able to DO after this unit. */
  blurbEn: text("blurb_en").notNull().default(""),
  /** Authorial intent, carried from the syllabus into lazy note generation. */
  notePrompt: text("note_prompt").notNull().default(""),
  cefr: text("cefr").notNull().default("A2"),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Empty until someone opens the unit — the note is generated on demand. */
  noteMd: text("note_md").notNull().default(""),
  status: text("status").notNull().default("draft"), // draft | published
  createdBy: text("created_by").notNull().default("ai"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// kind: note | category | quiz | ditado | verbos | story | listening | homework
// refId points at the concrete row when applicable; config carries params
// (e.g. {topic, level} for a quiz to generate).
export const unitItems = pgTable("unit_items", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  refId: integer("ref_id"),
  config: jsonb("config"),
  titlePt: text("title_pt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Per-learner completion of a single unit item. This is what turns the
 * syllabus from an index into a course: unit % , the "next item" pointer and
 * the family's progress all read from here. One row per (username, itemId);
 * writes use onConflictDoNothing so replaying an item is harmless.
 */
export const unitProgress = pgTable(
  "unit_progress",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    unitId: integer("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    itemId: integer("item_id")
      .notNull()
      .references(() => unitItems.id, { onDelete: "cascade" }),
    /** 0-100 where the activity produces one; null when it is just "done". */
    score: integer("score"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  // Enforced in the DATABASE, not by a read-then-write: two tabs ticking the
  // same item raced through the old guard and double-awarded XP.
  (t) => [uniqueIndex("unit_progress_user_item").on(t.username, t.itemId)]
);

// Field missions: real-world tasks around Torres Vedras.
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  promptPt: text("prompt_pt").notNull(),
  promptEn: text("prompt_en").notNull(),
  location: text("location").notNull().default(""),
  cefr: text("cefr").notNull().default("A2"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active").notNull().default(1),
  createdBy: text("created_by").notNull().default("seed"),
});

export const missionAttempts = pgTable("mission_attempts", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  kind: text("kind").notNull().default("self"), // self | audio
  transcript: text("transcript"),
  feedbackMd: text("feedback_md"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Listen & Speak: one generated MP3 per session (EN prompt → pause → PT),
// exposed via a personal RSS feed. Pruned to the last few per user.
export const lsSessions = pgTable("ls_sessions", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  cardCount: integer("card_count").notNull().default(0),
  /** Legacy inline copy. Null once the row lives in R2. */
  audioB64: text("audio_b64"),
  audioKey: text("audio_key"),
  bytes: integer("bytes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  kind: text("kind").notNull(),
  summary: text("summary").notNull(),
  xp: integer("xp").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Portugal, as the app understands it.
 *
 * `promptContext` is the whole point: a distilled paragraph, researched per
 * zone, injected into Sandra's prompts so a learner in Faro gets the Olhão
 * fish market and one in Braga gets Bom Jesus — instead of everyone getting
 * the same invented Portuguese village. The long-form research lives in
 * content/zones/*.md; only the distilled block belongs in a prompt.
 */
export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  namePt: text("name_pt").notNull(),
  nameEn: text("name_en").notNull(),
  emoji: text("emoji").notNull().default("📍"),
  /** One line for the picker. */
  blurbEn: text("blurb_en"),
  /** The paragraph appended to prompts. Keep it short — it costs tokens on every call. */
  promptContext: text("prompt_context"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Towns and bairros inside a zone — the optional second question. */
export const zonePlaces = pgTable(
  "zone_places",
  {
    id: serial("id").primaryKey(),
    zoneId: integer("zone_id")
      .notNull()
      .references(() => zones.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    /** Optional extra detail for this town specifically, appended after the zone's. */
    promptContext: text("prompt_context"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("zone_places_zone_slug").on(t.zoneId, t.slug)]
);

/**
 * Every email the app tried to send, delivered or not.
 *
 * "Did the parent actually get it?" has to be answerable without logging into
 * a third-party dashboard, and a failed send that leaves no trace is how you
 * find out weeks later that nobody has been receiving anything.
 */
export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  recipient: text("recipient").notNull(),
  ok: boolean("ok").notNull(),
  providerId: text("provider_id"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ───────────────────────────────────────────────────────────────────────────
// MULTI-TENANT IDENTITY — Stage 1, DORMANT.
//
// Nothing reads these yet. The live app still authenticates via the shared
// password and the bare `username` string on every table. These exist so the
// cutover can happen in verifiable steps rather than one rewrite.
//
// The central hazard the plan identified: `username` is currently a GLOBAL
// identifier, and stops being unique the moment a second family signs up. So
// it moves here, onto `memberships`, unique only WITHIN an account. Email is
// the global identifier instead — and is nullable, because children may not
// have one and must still be able to sign in.
// ───────────────────────────────────────────────────────────────────────────

/** A family or a lone individual — whatever subscribes and holds seats. */
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // free | individual | family
  plan: text("plan").notNull().default("free"),
  seatLimit: integer("seat_limit").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** A real human. Email is globally unique WHERE PRESENT; children have none. */
export const people = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    email: text("email"),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("people_email_unique").on(t.email)]
);

/** Person ↔ account. `username` lives HERE and is unique per account only. */
export const memberships = pgTable(
  "memberships",
  {
    id: serial("id").primaryKey(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    // owner | parent | child  (the existing admin/teacher roles map onto these)
    role: text("role").notNull().default("child"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("memberships_account_username").on(t.accountId, t.username)]
);

/** Password credentials. Hash only — scrypt via node:crypto, no native dep. */
export const credentials = pgTable("credentials", {
  personId: integer("person_id")
    .primaryKey()
    .references(() => people.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Server-side sessions, so access can actually be REVOKED. The current JWT
 * cannot be — which is tolerable for one family and not once money and child
 * accounts are involved. Only the hash is stored.
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** One row per account. `status` is Stripe's, and is the entitlement source. */
export const subscriptions = pgTable("subscriptions", {
  accountId: integer("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // active | trialing | past_due | canceled | incomplete | none
  status: text("status").notNull().default("none"),
  priceId: text("price_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAt: timestamp("cancel_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Single-use tokens: family invitations and magic-link sign-in. Hash only. */
export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  // invite | magic
  kind: text("kind").notNull(),
  accountId: integer("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  email: text("email"),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
