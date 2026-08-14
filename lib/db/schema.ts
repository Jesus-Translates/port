import {
  boolean,
  index,
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
  // A1 until the placement test says otherwise — see DEFAULT_CEFR.
  cefrLevel: text("cefr_level").notNull().default("A1"),
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
  /**
   * admin | teacher | student — WITHIN A HOUSEHOLD. null falls back to the
   * ADMIN_USERS/TEACHER_USERS env lists.
   *
   * "admin" here means "runs their own family". /registar sets it on whoever
   * creates a household, so it is held by every customer who ever signed up
   * and must never gate anything that reads across families.
   */
  role: text("role"),
  /**
   * PLATFORM operator — runs the deployment and can see every household.
   *
   * A different axis from `role` entirely, and the distinction is
   * load-bearing: if role "admin" also meant platform access, every family
   * owner would be an operator. An operator belongs to NO family, and is
   * excluded from the orphan sweep for that reason — they are family-less on
   * purpose, not lost.
   */
  isOperator: boolean("is_operator").notNull().default(false),
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
  /**
   * What the placement test concluded, and the plan built from it.
   *
   * Kept because the gaps outlive the screen that found them: the
   * questionnaire runs next and designs the plan around exactly these
   * weaknesses, and the plan itself is worth showing again later. See
   * lib/placement-record.ts for the shape.
   */
  placement: jsonb("placement"),
  /**
   * When this person answered "Quem mais vive cá em casa?" in onboarding —
   * by adding people or by saying it's just them. null = never asked.
   * A timestamp rather than a boolean because "skipped on day one" and
   * "skipped last week" are different signals if we ever re-ask.
   */
  familyStepAt: timestamp("family_step_at"),
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
export const refEntries = pgTable(
  "ref_entries",
  {
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
  },
  // Every phrasebook read filters by category or by owner; Neon bills the
  // sequential scans these replace on every single page of the reference.
  (t) => [
    index("ref_entries_category_idx").on(t.categoryId),
    index("ref_entries_added_by_idx").on(t.addedBy),
  ]
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    tags: text("tags").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("notes_username_idx").on(t.username)]
);

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
export const homework = pgTable(
  "homework",
  {
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
  },
  (t) => [index("homework_user_status_idx").on(t.username, t.status)]
);

// questions/answers/feedback are JSON; status: ready | completed
export const quizzes = pgTable(
  "quizzes",
  {
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
  },
  (t) => [index("quizzes_username_idx").on(t.username)]
);

/**
 * Curated exam question banks (CIPLE prep, the new civics test), seeded from
 * content/civica/banco-*.md by scripts/seed-prova.ts. Unlike `quizzes` (one
 * per-user AI-generated attempt), these are canonical rows: the civics test is
 * a fixed body of facts, so questions are authored once, fact-checked, and
 * served deterministically — no generation cost, no hallucination risk.
 * status follows the draft → published workflow; only published rows are ever
 * shown to a learner.
 */
export const examQuestions = pgTable(
  "exam_questions",
  {
    id: serial("id").primaryKey(),
    bank: text("bank").notNull(), // ciple | civica
    section: text("section").notNull(), // historia | estado | simbolos | direitos | cultura | geografia
    /** Q001… — stable identity inside its source file, so re-seeding updates in place. */
    qnum: text("qnum").notNull(),
    sourceFile: text("source_file").notNull(),
    promptPt: text("prompt_pt").notNull(),
    options: jsonb("options").notNull(), // string[4]
    correctIndex: integer("correct_index").notNull(),
    explanation: text("explanation").notNull().default(""),
    source: text("source").notNull().default(""),
    status: text("status").notNull().default("draft"), // draft | published
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("exam_questions_file_qnum").on(t.bank, t.sourceFile, t.qnum),
  ]
);

// kind: star (golden star for an achievement) | note (encouragement message)
export const kudos = pgTable(
  "kudos",
  {
    id: serial("id").primaryKey(),
    fromUser: text("from_user").notNull(),
    toUser: text("to_user").notNull(),
    kind: text("kind").notNull().default("note"),
    message: text("message").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("kudos_to_user_created_idx").on(t.toUser, t.createdAt)]
);

// One row per AI call, so each person can see what they've actually spent.
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    kind: text("kind").notNull(), // tutor | quiz | grade | homework | lesson | reference | suggest
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    // Micro-dollars (USD × 1e6) — integers avoid float drift on tiny amounts.
    costMicroUsd: integer("cost_micro_usd").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // The budget gate and the spend meter both run on nearly every request.
  (t) => [index("ai_usage_user_created_idx").on(t.username, t.createdAt)]
);

// Spaced-repetition cards (FSRS). Shared content, per-user memory:
// kind: entry (from the phrasebook) | mistake (from graded errors) | verb.
// `fsrs` holds the serialized ts-fsrs Card; due/state are denormalized for queries.
export const cards = pgTable(
  "cards",
  {
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
  },
  // (username, state, due) is the due-queue shape; (username, kind) the
  // mistake-dedup lookup every graded answer makes.
  (t) => [
    index("cards_user_state_due_idx").on(t.username, t.state, t.due),
    index("cards_user_kind_idx").on(t.username, t.kind),
  ]
);

export const reviewLogs = pgTable(
  "review_logs",
  {
    id: serial("id").primaryKey(),
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // The card_id index also pays for the ON DELETE CASCADE from cards, which
  // otherwise scans this table once per deleted card.
  (t) => [
    index("review_logs_user_created_idx").on(t.username, t.createdAt),
    index("review_logs_card_idx").on(t.cardId),
  ]
);

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
  /**
   * Which voice actually spoke each speaker: {"Ana": "pt-PT-FernandaNeural"}.
   *
   * Without this the repair could not be OBSERVED. diagnoseClips had to guess
   * what the audio was made with by recomputing the old order-of-appearance
   * formula, which returns the same answer forever — so a clip stayed
   * "wrong-gender" no matter how many times it was correctly re-voiced, and
   * every check invited another paid re-synthesis of audio that was already
   * fine. Null on clips generated before this column existed; those still fall
   * back to the guess.
   */
  voices: jsonb("voices"),
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
export const unitItems = pgTable(
  "unit_items",
  {
    id: serial("id").primaryKey(),
    unitId: integer("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    refId: integer("ref_id"),
    config: jsonb("config"),
    titlePt: text("title_pt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("unit_items_unit_idx").on(t.unitId)]
);

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

export const activity = pgTable(
  "activity",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    xp: integer("xp").notNull().default(5),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // The busiest table in the app: streaks, XP, the family feed and the
  // placement breadcrumb all filter it on every dashboard render.
  (t) => [
    index("activity_user_created_idx").on(t.username, t.createdAt),
    index("activity_created_idx").on(t.createdAt),
  ]
);

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
  /**
   * "zone" — a place a learner can pick.
   * "reference" — cross-country knowledge (accents, bureaucracy, transport)
   * that never appears in the picker but is offered to the generators that
   * invent real-world situations.
   */
  kind: text("kind").notNull().default("zone"),
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
  // There is no free plan; a household exists because someone subscribed.
  plan: text("plan").notNull().default("family"),
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
/**
 * Pro is an ADD-ON on a seat, not a plan.
 *
 * A family buys it for the adult sitting the CIPLE exam, not for the
 * six-year-old — which is the whole reason it is affordable. `proUntil` is the
 * instant the extra allowance stops: Pro is live while now < proUntil, so it
 * is month-scoped by construction and unused capacity CANNOT roll over. That
 * matters: banked credits would let somebody save three months and spend them
 * in one, and the monthly guarantee would stop being monthly.
 */
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
    /** Null or past = base allowance. Future = proTier's multiplier applies. */
    proUntil: timestamp("pro_until"),
    /** Which add-on: "boost" (2x) or "pro" (5x). See lib/plans.ts proTiers(). */
    proTier: text("pro_tier"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("memberships_account_username").on(t.accountId, t.username),
    // Tenancy resolves session → household by username on every request.
    index("memberships_username_idx").on(t.username),
  ]
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
  // active | trialing | past_due | canceled | incomplete | refund_requested | none
  status: text("status").notNull().default("none"),
  /** Last instant the money-back guarantee can still be claimed. */
  guaranteeEndsAt: timestamp("guarantee_ends_at"),
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
  /**
   * Invites only: the household role the INVITER chose — "parent" | "child".
   * It lives on the token row because the invitee must never pick their own
   * role; whatever the accept form sends is ignored in favour of this. Never
   * "owner": a household has exactly one, made at signup. Null for magic links.
   */
  role: text("role"),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * A spoken conversation with Sandra, kept so it survives leaving the page.
 *
 * The conversation used to live entirely in React state: navigate away and the
 * whole exchange was gone, which made Sandra the one part of the app with no
 * memory of you. It is also where the step's XP accumulates, and progress you
 * cannot leave and come back to is not progress.
 *
 * One OPEN row per learner per topic; finishing sets status to "done" so the
 * next visit starts fresh rather than resuming a conversation that already
 * earned its completion.
 */
export const conversas = pgTable(
  "conversas",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    topic: text("topic").notNull().default(""),
    /** Pinned per session so Sandra does not change voice mid-conversation. */
    voice: text("voice").notNull().default(""),
    cefr: text("cefr").notNull().default("A2"),
    /** The unit path item this fulfils, when it was opened from a course. */
    unitItemId: integer("unit_item_id"),
    /** Msg[] — role, pt, en. Audio is NOT stored; it is regenerated on demand. */
    messages: jsonb("messages").notNull(),
    /** Earned across the learner's turns, judged on quality. 100 completes. */
    xp: integer("xp").notNull().default(0),
    // open | done
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("conversas_user_status_idx").on(t.username, t.status)]
);

/**
 * How a household wants the app to speak to it.
 *
 * Both settings live on the ACCOUNT rather than the user because they are
 * decisions a family makes together — a parent turning immersion on for a
 * nine-year-old, or turning English glosses on because two of the three
 * learners are beginners. Any owner or parent can set them; a member can
 * still override immersion for themselves in Perfil.
 *
 * Separate table rather than columns on accounts: this will grow (accent,
 * reminder time, weekly challenge), and accounts is joined on nearly every
 * request. Keeping it apart keeps that row narrow.
 */
export const householdSettings = pgTable("household_settings", {
  accountId: integer("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  /** total = Sandra never uses English. ajuda = she explains when needed. */
  immersion: text("immersion").notNull().default("ajuda"),
  /** English shown beside the Portuguese throughout the interface. */
  bilingual: boolean("bilingual").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Verbs a learner added themselves.
 *
 * The curated table in lib/verbs.ts is hand-checked European Portuguese and
 * stays that way — it is the reference. This is the household's own shelf
 * beside it: type "estacionar", get the paradigm, keep it. Conjugations are
 * stored rather than regenerated so a saved verb reads the same tomorrow, and
 * so a hand-corrected irregular can overwrite what the pattern guessed.
 *
 * Scoped by addedBy like every other user-authored row — one family's verbs
 * are not another's.
 */
export const userVerbs = pgTable(
  "user_verbs",
  {
    id: serial("id").primaryKey(),
    inf: text("inf").notNull(),
    en: text("en").notNull().default(""),
    /** Partial<Record<Tense, (string | null)[]>> — same shape as Verb.forms. */
    forms: jsonb("forms").notNull(),
    /** "auto" when generated from the regular pattern, "hand" once corrected. */
    source: text("source").notNull().default("auto"),
    addedBy: text("added_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_verbs_owner_inf").on(t.addedBy, t.inf)]
);
