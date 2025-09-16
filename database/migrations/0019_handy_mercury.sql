DROP INDEX "boat_calendars_boat_idx";--> statement-breakpoint
DROP INDEX "boat_calendars_owner_idx";--> statement-breakpoint
DROP INDEX "boat_calendars_boat_owner_idx";--> statement-breakpoint
DROP INDEX "boat_availability_boat_idx";--> statement-breakpoint
DROP INDEX "boat_availability_booking_idx";--> statement-breakpoint
DROP INDEX "boat_availability_event_idx";--> statement-breakpoint
DROP INDEX "boat_availability_time_idx";--> statement-breakpoint
CREATE INDEX "boat_google_calendars_boat_idx" ON "boat_google_calendars" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_google_calendars_owner_idx" ON "boat_google_calendars" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "boat_google_calendars_boat_owner_idx" ON "boat_google_calendars" USING btree ("boat_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_boat_idx" ON "external_google_calendar_sync_events" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_booking_idx" ON "external_google_calendar_sync_events" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_event_idx" ON "external_google_calendar_sync_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_time_idx" ON "external_google_calendar_sync_events" USING btree ("start_time","end_time");