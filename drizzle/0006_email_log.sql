CREATE TABLE IF NOT EXISTS "email_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"recipient" text NOT NULL,
	"ok" boolean NOT NULL,
	"provider_id" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
