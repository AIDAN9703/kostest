CREATE TYPE "public"."CalendarOwnerType" AS ENUM('ADMIN', 'OWNER');--> statement-breakpoint
CREATE TYPE "public"."CalendarSource" AS ENUM('GOOGLE', 'MANUAL', 'BOOKING');--> statement-breakpoint
CREATE TYPE "public"."CalendarSyncStatus" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TABLE "boat_availability" (
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
CREATE TABLE "boat_calendars" (
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
CREATE TABLE "availability_holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boat_availability" ADD CONSTRAINT "boat_availability_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_availability" ADD CONSTRAINT "boat_availability_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_calendars" ADD CONSTRAINT "boat_calendars_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_calendars" ADD CONSTRAINT "boat_calendars_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_holds" ADD CONSTRAINT "availability_holds_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_holds" ADD CONSTRAINT "availability_holds_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_availability_boat_idx" ON "boat_availability" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_availability_booking_idx" ON "boat_availability" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "boat_availability_event_idx" ON "boat_availability" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "boat_availability_time_idx" ON "boat_availability" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE INDEX "boat_calendars_boat_idx" ON "boat_calendars" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_calendars_owner_idx" ON "boat_calendars" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "boat_calendars_boat_owner_idx" ON "boat_calendars" USING btree ("boat_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "availability_holds_boat_idx" ON "availability_holds" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "availability_holds_user_idx" ON "availability_holds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "availability_holds_expires_idx" ON "availability_holds" USING btree ("expires_at");