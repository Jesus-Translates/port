CREATE TABLE "conversas" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"voice" text DEFAULT '' NOT NULL,
	"cefr" text DEFAULT 'A2' NOT NULL,
	"unit_item_id" integer,
	"messages" jsonb NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
