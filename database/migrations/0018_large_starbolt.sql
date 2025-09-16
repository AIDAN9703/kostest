CREATE TABLE "boat_google_calendars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"calendar_id" text NOT NULL,
	"calendar_name" text NOT NULL,
	"owner_type" "CalendarOwnerType" NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_sync_status" "CalendarSyncStatus",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_google_calendar_sync_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"event_id" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"source" "CalendarSource" NOT NULL,
	"booking_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "boat_availability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "boat_calendars" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "availability_holds" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "boat_availability" CASCADE;--> statement-breakpoint
DROP TABLE "boat_calendars" CASCADE;--> statement-breakpoint
DROP TABLE "availability_holds" CASCADE;--> statement-breakpoint
ALTER TABLE "boat_blocking" ALTER COLUMN "start_time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boat_blocking" ALTER COLUMN "end_time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boat_blocking" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boat_blocking" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "boat_google_calendars" ADD CONSTRAINT "boat_google_calendars_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_google_calendars" ADD CONSTRAINT "boat_google_calendars_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" ADD CONSTRAINT "external_google_calendar_sync_events_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" ADD CONSTRAINT "external_google_calendar_sync_events_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_calendars_boat_idx" ON "boat_google_calendars" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_calendars_owner_idx" ON "boat_google_calendars" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "boat_calendars_boat_owner_idx" ON "boat_google_calendars" USING btree ("boat_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "boat_availability_boat_idx" ON "external_google_calendar_sync_events" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_availability_booking_idx" ON "external_google_calendar_sync_events" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "boat_availability_event_idx" ON "external_google_calendar_sync_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "boat_availability_time_idx" ON "external_google_calendar_sync_events" USING btree ("start_time","end_time");