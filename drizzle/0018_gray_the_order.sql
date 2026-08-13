CREATE INDEX "activity_user_created_idx" ON "activity" USING btree ("username","created_at");--> statement-breakpoint
CREATE INDEX "activity_created_idx" ON "activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_user_created_idx" ON "ai_usage" USING btree ("username","created_at");--> statement-breakpoint
CREATE INDEX "cards_user_state_due_idx" ON "cards" USING btree ("username","state","due");--> statement-breakpoint
CREATE INDEX "cards_user_kind_idx" ON "cards" USING btree ("username","kind");--> statement-breakpoint
CREATE INDEX "conversas_user_status_idx" ON "conversas" USING btree ("username","status");--> statement-breakpoint
CREATE INDEX "homework_user_status_idx" ON "homework" USING btree ("username","status");--> statement-breakpoint
CREATE INDEX "kudos_to_user_created_idx" ON "kudos" USING btree ("to_user","created_at");--> statement-breakpoint
CREATE INDEX "memberships_username_idx" ON "memberships" USING btree ("username");--> statement-breakpoint
CREATE INDEX "notes_username_idx" ON "notes" USING btree ("username");--> statement-breakpoint
CREATE INDEX "quizzes_username_idx" ON "quizzes" USING btree ("username");--> statement-breakpoint
CREATE INDEX "ref_entries_category_idx" ON "ref_entries" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "ref_entries_added_by_idx" ON "ref_entries" USING btree ("added_by");--> statement-breakpoint
CREATE INDEX "review_logs_user_created_idx" ON "review_logs" USING btree ("username","created_at");--> statement-breakpoint
CREATE INDEX "review_logs_card_idx" ON "review_logs" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "unit_items_unit_idx" ON "unit_items" USING btree ("unit_id");