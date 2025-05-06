ALTER TABLE "availability_holds" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "boat_availability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "boat_calendars" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "calendar_credentials" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "calendar_sync_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "availability_holds" CASCADE;--> statement-breakpoint
DROP TABLE "boat_availability" CASCADE;--> statement-breakpoint
DROP TABLE "boat_calendars" CASCADE;--> statement-breakpoint
DROP TABLE "calendar_credentials" CASCADE;--> statement-breakpoint
DROP TABLE "calendar_sync_logs" CASCADE;--> statement-breakpoint
CREATE INDEX "boat_search_name_idx" ON "boat" USING btree ("name");--> statement-breakpoint
CREATE INDEX "boat_search_make_model_idx" ON "boat" USING btree ("make","model");--> statement-breakpoint
CREATE INDEX "booking_search_customer_idx" ON "booking" USING btree ("customer_name","customer_email");--> statement-breakpoint
CREATE INDEX "user_search_name_idx" ON "user" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "user_search_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "has_calendar";--> statement-breakpoint
DROP TYPE "public"."CalendarOwnerType";--> statement-breakpoint
DROP TYPE "public"."CalendarSource";--> statement-breakpoint
DROP TYPE "public"."CalendarSyncStatus";