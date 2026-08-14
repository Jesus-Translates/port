ALTER TABLE "auth_tokens" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "family_step_at" timestamp;