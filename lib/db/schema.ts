import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  // A1 | A2 | B1 | B2 — set by the placement quiz, filters default to level ±1.
  cefrLevel: text("cefr_level").notNull().default("A2"),
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
export const ttsAudio = pgTable("tts_audio", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  text: text("text").notNull(),
  voice: text("voice").notNull(),
  audioB64: text("audio_b64").notNull(),
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
  audioB64: text("audio_b64").notNull(),
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
export const unitProgress = pgTable("unit_progress", {
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
});

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
  audioB64: text("audio_b64").notNull(),
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
