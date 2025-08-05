CREATE TYPE "public"."BlockingType" AS ENUM('MAINTENANCE', 'OWNER_USE', 'WEATHER', 'ADMIN_BLOCK', 'HOLIDAY', 'SEASONAL', 'CUSTOM');--> statement-breakpoint
CREATE TABLE "boat_blocking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"blocking_type" "BlockingType" NOT NULL,
	"reason" text,
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "boat_owner_id" uuid;--> statement-breakpoint
ALTER TABLE "boat_blocking" ADD CONSTRAINT "boat_blocking_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_blocking_boat_id_idx" ON "boat_blocking" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_blocking_time_range_idx" ON "boat_blocking" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE INDEX "boat_blocking_type_idx" ON "boat_blocking" USING btree ("blocking_type");--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_owner_id_user_id_fk" FOREIGN KEY ("boat_owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "booking_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."BookingType";--> statement-breakpoint
CREATE TYPE "public"."BookingType" AS ENUM('REQUEST', 'INSTANT_BOOK', 'EXTERNAL_BOOKING');--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "booking_type" SET DATA TYPE "public"."BookingType" USING "booking_type"::"public"."BookingType";