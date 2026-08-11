ALTER TABLE "accounts" ALTER COLUMN "plan" SET DEFAULT 'family';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "guarantee_ends_at" timestamp;--> statement-breakpoint
-- No free plan exists any more. Nothing is on it today, but a row left saying
-- 'free' would resolve through planById()'s fallback to Família and quietly
-- grant the largest AI allowance against no revenue at all.
UPDATE "accounts" SET "plan" = 'family' WHERE "plan" NOT IN ('individual', 'family');
