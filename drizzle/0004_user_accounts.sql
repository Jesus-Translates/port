ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mode" text DEFAULT 'simple' NOT NULL;
--> statement-breakpoint
-- One case-insensitive email per account, but plenty of accounts may have none.
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique_ci"
    ON "users" (lower("email")) WHERE "email" IS NOT NULL;--> statement-breakpoint
-- Freeze today's env-derived roles into the rows, so the admin panel edits a
-- real value instead of silently disagreeing with ADMIN_USERS/TEACHER_USERS.
UPDATE "users" SET "role" = 'admin'   WHERE "role" IS NULL AND lower("username") = 'robert';--> statement-breakpoint
UPDATE "users" SET "role" = 'teacher' WHERE "role" IS NULL AND lower("username") = 'kelly';--> statement-breakpoint
UPDATE "users" SET "role" = 'student' WHERE "role" IS NULL;--> statement-breakpoint
-- Everyone already using the app keeps the full surface they know; 'simple'
-- is the default for accounts created from here on.
UPDATE "users" SET "mode" = 'full';
