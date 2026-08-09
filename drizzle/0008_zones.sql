CREATE TABLE IF NOT EXISTS "zone_places" (
	"id" serial PRIMARY KEY NOT NULL,
	"zone_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"prompt_context" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_pt" text NOT NULL,
	"name_en" text NOT NULL,
	"emoji" text DEFAULT '📍' NOT NULL,
	"blurb_en" text,
	"prompt_context" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "zones_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "zone_slug" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "place_slug" text;--> statement-breakpoint
ALTER TABLE "zone_places" ADD CONSTRAINT "zone_places_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "zone_places_zone_slug" ON "zone_places" USING btree ("zone_id","slug");