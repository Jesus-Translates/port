CREATE TABLE "exam_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank" text NOT NULL,
	"section" text NOT NULL,
	"qnum" text NOT NULL,
	"source_file" text NOT NULL,
	"prompt_pt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "exam_questions_file_qnum" ON "exam_questions" USING btree ("bank","source_file","qnum");