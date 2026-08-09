ALTER TABLE "listening_clips" ALTER COLUMN "audio_b64" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ls_sessions" ALTER COLUMN "audio_b64" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tts_audio" ALTER COLUMN "audio_b64" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listening_clips" ADD COLUMN IF NOT EXISTS "audio_key" text;--> statement-breakpoint
ALTER TABLE "ls_sessions" ADD COLUMN IF NOT EXISTS "audio_key" text;--> statement-breakpoint
ALTER TABLE "tts_audio" ADD COLUMN IF NOT EXISTS "audio_key" text;