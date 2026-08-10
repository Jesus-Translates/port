CREATE TABLE "household_settings" (
	"account_id" integer PRIMARY KEY NOT NULL,
	"immersion" text DEFAULT 'ajuda' NOT NULL,
	"bilingual" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "household_settings" ADD CONSTRAINT "household_settings_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;