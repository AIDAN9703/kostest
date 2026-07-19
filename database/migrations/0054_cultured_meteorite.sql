-- Unify deals: booking hub gains the INQUIRY phase (docs/UNIFIED_BOOKINGS_PLAN.md).
-- Hand-hardened to be idempotent: the live DBs have drifted from the migration
-- journal (values like BookingType.TERM_CHARTER already exist), so every
-- statement guards against already-present objects. Purely additive — no drops.
DO $$ BEGIN
  CREATE TYPE "public"."InboundEmailParseStatus" AS ENUM('PENDING', 'PARSED', 'FALLBACK_LLM', 'FAILED', 'IGNORED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'HOME_PAGE';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'BOAT_PAGE';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'CONTACT_PAGE';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'TERM_CHARTER_PAGE';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'PHONE';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'INSTAGRAM';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'WHATSAPP';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'BOATSETTER';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'GETMYBOAT';--> statement-breakpoint
ALTER TYPE "public"."BookingSource" ADD VALUE IF NOT EXISTS 'OTHER';--> statement-breakpoint
ALTER TYPE "public"."BookingStatus" ADD VALUE IF NOT EXISTS 'INQUIRY' BEFORE 'DRAFT';--> statement-breakpoint
ALTER TYPE "public"."BookingType" ADD VALUE IF NOT EXISTS 'GENERAL_QUOTE';--> statement-breakpoint
ALTER TYPE "public"."BookingType" ADD VALUE IF NOT EXISTS 'BOAT_REQUEST';--> statement-breakpoint
ALTER TYPE "public"."BookingType" ADD VALUE IF NOT EXISTS 'TERM_CHARTER';--> statement-breakpoint
ALTER TYPE "public"."BookingType" ADD VALUE IF NOT EXISTS 'MANUAL';--> statement-breakpoint
ALTER TYPE "public"."BookingType" ADD VALUE IF NOT EXISTS 'MARKETPLACE';--> statement-breakpoint
ALTER TYPE "public"."InquiryLeadType" ADD VALUE IF NOT EXISTS 'MARKETPLACE';--> statement-breakpoint
ALTER TYPE "public"."InquirySource" ADD VALUE IF NOT EXISTS 'BOATSETTER' BEFORE 'OTHER';--> statement-breakpoint
ALTER TYPE "public"."InquirySource" ADD VALUE IF NOT EXISTS 'GETMYBOAT' BEFORE 'OTHER';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inbound_email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text,
	"subject" text,
	"raw_html" text,
	"raw_text" text,
	"parse_status" "InboundEmailParseStatus" DEFAULT 'PENDING' NOT NULL,
	"deal_id" uuid,
	"inquiry_id" uuid,
	"error" text,
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbound_email_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "boat_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "customer_phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "is_multi_day" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "start_datetime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "number_of_passengers" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "customer_message" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "preferred_date" date;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "preferred_time_of_day" "PreferredTimeOfDay";--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "requested_duration_days" integer;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "destination" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "budget_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "estimated_value_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "sms_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "terms_accepted" boolean;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "first_contacted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "cold_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "legacy_inquiry_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "inbound_email" ADD CONSTRAINT "inbound_email_deal_id_booking_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "inbound_email" ADD CONSTRAINT "inbound_email_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inbound_email_parse_status_idx" ON "inbound_email" USING btree ("parse_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inbound_email_inquiry_idx" ON "inbound_email" USING btree ("inquiry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_archived_idx" ON "booking" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_created_idx" ON "booking" USING btree ("created_at");
