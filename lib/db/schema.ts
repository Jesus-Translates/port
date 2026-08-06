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
export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
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

export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  kind: text("kind").notNull(),
  summary: text("summary").notNull(),
  xp: integer("xp").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
