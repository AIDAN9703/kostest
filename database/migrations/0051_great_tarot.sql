CREATE TYPE "public"."ExternalCalendarSyncStatus" AS ENUM('PENDING', 'SUCCESS', 'ERROR');--> statement-breakpoint
CREATE TABLE "boat_external_calendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"name" text NOT NULL,
	"ical_url" text NOT NULL,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_sync_status" "ExternalCalendarSyncStatus",
	"last_sync_error" text,
	"last_event_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boat_external_calendar_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_calendar_id" uuid NOT NULL,
	"boat_id" uuid NOT NULL,
	"uid" text,
	"summary" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boat_external_calendar" ADD CONSTRAINT "boat_external_calendar_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_external_calendar_event" ADD CONSTRAINT "boat_external_calendar_event_external_calendar_id_boat_external_calendar_id_fk" FOREIGN KEY ("external_calendar_id") REFERENCES "public"."boat_external_calendar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_external_calendar_event" ADD CONSTRAINT "boat_external_calendar_event_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_external_calendar_boat_idx" ON "boat_external_calendar" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_external_calendar_event_boat_time_idx" ON "boat_external_calendar_event" USING btree ("boat_id","start_time","end_time");--> statement-breakpoint
CREATE INDEX "boat_external_calendar_event_calendar_idx" ON "boat_external_calendar_event" USING btree ("external_calendar_id");