CREATE TYPE "public"."PreferredTimeOfDay" AS ENUM('MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE');--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "preferred_date" date;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "preferred_time_of_day" "PreferredTimeOfDay";--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "requested_duration_days" integer;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "destination" text;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "sms_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_boat_request_requires_boat" CHECK ("inquiry"."lead_type" <> 'BOAT_REQUEST' OR "inquiry"."boat_id" IS NOT NULL);