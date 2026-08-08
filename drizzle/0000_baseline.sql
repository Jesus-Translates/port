-- BASELINE. These 21 tables already existed in production when migrations
-- were introduced; this file records that state. Written idempotently so it
-- is a no-op against the live database and still builds a fresh one.
-- Foreign keys are added separately below, guarded, for the same reason.

CREATE TABLE IF NOT EXISTS "activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"kind" text NOT NULL,
	"summary" text NOT NULL,
	"xp" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"kind" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_micro_usd" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"kind" text DEFAULT 'entry' NOT NULL,
	"source_id" integer,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"note" text,
	"direction" text DEFAULT 'en-pt' NOT NULL,
	"fsrs" jsonb NOT NULL,
	"due" timestamp NOT NULL,
	"state" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_pt" text NOT NULL,
	"name_en" text NOT NULL,
	"emoji" text DEFAULT '📖' NOT NULL,
	"blurb_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" text DEFAULT 'seed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homework" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"title" text NOT NULL,
	"instructions" text NOT NULL,
	"items" jsonb,
	"lesson_id" integer,
	"source" text DEFAULT 'ai' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"response" text,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kudos" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user" text NOT NULL,
	"to_user" text NOT NULL,
	"kind" text DEFAULT 'note' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"level" text DEFAULT 'A2' NOT NULL,
	"description_en" text,
	"blocks" jsonb NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"created_by" text DEFAULT 'seed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listening_clips" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"cefr" text DEFAULT 'A2' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"transcript" jsonb NOT NULL,
	"audio_b64" text NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'ai' NOT NULL,
	"created_by" text DEFAULT 'ai' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ls_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"card_count" integer DEFAULT 0 NOT NULL,
	"audio_b64" text NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mission_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"username" text NOT NULL,
	"kind" text DEFAULT 'self' NOT NULL,
	"transcript" text,
	"feedback_md" text,
	"score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"prompt_pt" text NOT NULL,
	"prompt_en" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"cefr" text DEFAULT 'A2' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"created_by" text DEFAULT 'seed' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"tags" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"topic" text NOT NULL,
	"level" text DEFAULT 'A2' NOT NULL,
	"questions" jsonb NOT NULL,
	"answers" jsonb,
	"score" integer,
	"total" integer,
	"feedback" jsonb,
	"status" text DEFAULT 'ready' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ref_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"kind" text DEFAULT 'term' NOT NULL,
	"section" text DEFAULT 'Geral' NOT NULL,
	"pt" text NOT NULL,
	"en" text NOT NULL,
	"reply_pt" text,
	"reply_en" text,
	"note" text,
	"added_by" text DEFAULT 'seed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"username" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_title" text NOT NULL,
	"chapter" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"level" text DEFAULT 'A2' NOT NULL,
	"text_pt" text NOT NULL,
	"text_en" text NOT NULL,
	"glossary" jsonb NOT NULL,
	"questions" jsonb NOT NULL,
	"created_by" text DEFAULT 'seed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tts_audio" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"text" text NOT NULL,
	"voice" text NOT NULL,
	"audio_b64" text NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tts_audio_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unit_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"kind" text NOT NULL,
	"ref_id" integer,
	"config" jsonb,
	"title_pt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unit_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"unit_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"score" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"title_pt" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'communication' NOT NULL,
	"blurb_en" text DEFAULT '' NOT NULL,
	"note_prompt" text DEFAULT '' NOT NULL,
	"cefr" text DEFAULT 'A2' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"note_md" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text DEFAULT 'ai' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "units_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"cefr_level" text DEFAULT 'A2' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homework_lesson_id_lessons_id_fk') THEN
    ALTER TABLE "homework" ADD CONSTRAINT "homework_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mission_attempts_mission_id_missions_id_fk') THEN
    ALTER TABLE "mission_attempts" ADD CONSTRAINT "mission_attempts_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ref_entries_category_id_categories_id_fk') THEN
    ALTER TABLE "ref_entries" ADD CONSTRAINT "ref_entries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_logs_card_id_cards_id_fk') THEN
    ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unit_items_unit_id_units_id_fk') THEN
    ALTER TABLE "unit_items" ADD CONSTRAINT "unit_items_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unit_progress_unit_id_units_id_fk') THEN
    ALTER TABLE "unit_progress" ADD CONSTRAINT "unit_progress_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unit_progress_item_id_unit_items_id_fk') THEN
    ALTER TABLE "unit_progress" ADD CONSTRAINT "unit_progress_item_id_unit_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."unit_items"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unit_progress_user_item" ON "unit_progress" USING btree ("username","item_id");