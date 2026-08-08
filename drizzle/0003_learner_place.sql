ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lives_in_portugal" boolean;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locality" text;
--> statement-breakpoint
-- Every user that exists today IS the founding family, and they live near
-- Santa Cruz / Silveira. Backfilling them keeps their generated content
-- exactly as localised as it was before the town became a per-learner fact;
-- anyone who signs up later starts as NULL and gets asked.
UPDATE "users"
   SET "lives_in_portugal" = true,
       "locality" = 'Santa Cruz / Silveira, Torres Vedras'
 WHERE "lives_in_portugal" IS NULL;
