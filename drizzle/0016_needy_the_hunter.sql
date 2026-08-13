CREATE TABLE "user_verbs" (
	"id" serial PRIMARY KEY NOT NULL,
	"inf" text NOT NULL,
	"en" text DEFAULT '' NOT NULL,
	"forms" jsonb NOT NULL,
	"source" text DEFAULT 'auto' NOT NULL,
	"added_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_verbs_owner_inf" ON "user_verbs" USING btree ("added_by","inf");