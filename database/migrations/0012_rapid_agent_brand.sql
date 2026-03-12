-- ============================================
-- Migration: Captain & Owner Profiles
-- This migration replaces the old 'captain' table with profile extensions
-- IMPORTANT: Operations ordered to preserve data!
-- ============================================

-- ============================================
-- STEP 1: Create new enums
-- ============================================
CREATE TYPE "public"."CaptainStatus" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."OwnerBusinessType" AS ENUM('INDIVIDUAL', 'COMPANY');--> statement-breakpoint

-- ============================================
-- STEP 2: Create new profile tables
-- ============================================
CREATE TABLE "captain_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"status" "CaptainStatus" DEFAULT 'PENDING' NOT NULL,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"city" text,
	"state" text,
	"zip" text,
	"uscg_licensed" boolean DEFAULT false NOT NULL,
	"license_type" text,
	"license_number" text,
	"license_expiry" timestamp with time zone,
	"license_image_url" text,
	"years_experience" integer,
	"certifications" text[],
	"specialties" text[],
	"languages" text[],
	"bio" text,
	"max_passengers" integer,
	"preferred_boat_types" text[],
	"availability" jsonb,
	"agreement_signed" boolean DEFAULT false,
	"agreement_signed_at" timestamp with time zone,
	"admin_notes" text,
	"verified_at" timestamp with time zone,
	"verified_by_user_id" uuid,
	"total_trips_completed" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "owner_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"business_name" text,
	"business_type" "OwnerBusinessType" DEFAULT 'INDIVIDUAL' NOT NULL,
	"tax_id" text,
	"stripe_connect_account_id" text,
	"stripe_connect_onboarded" boolean DEFAULT false,
	"payouts_enabled" boolean DEFAULT false,
	"admin_notes" text,
	"verified_at" timestamp with time zone,
	"verified_by_user_id" uuid,
	"total_boats_listed" integer DEFAULT 0,
	"active_boats_count" integer DEFAULT 0,
	"total_bookings" integer DEFAULT 0,
	"confirmed_bookings" integer DEFAULT 0,
	"completed_bookings" integer DEFAULT 0,
	"cancelled_bookings" integer DEFAULT 0,
	"total_revenue_cents" integer DEFAULT 0,
	"pending_payout_cents" integer DEFAULT 0,
	"lifetime_payout_cents" integer DEFAULT 0,
	"current_month_bookings" integer DEFAULT 0,
	"current_month_revenue_cents" integer DEFAULT 0,
	"previous_month_bookings" integer DEFAULT 0,
	"previous_month_revenue_cents" integer DEFAULT 0,
	"average_rating" double precision,
	"total_reviews" integer DEFAULT 0,
	"response_rate_percent" integer,
	"response_time_minutes" integer,
	"booking_acceptance_rate_percent" integer,
	"upcoming_bookings_count" integer DEFAULT 0,
	"next_booking_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stats_updated_at" timestamp with time zone
);--> statement-breakpoint

-- ============================================
-- STEP 3: Migrate captain data BEFORE dropping table
-- ============================================
INSERT INTO "captain_profile" (
	"user_id",
	"status",
	"city",
	"state",
	"zip",
	"uscg_licensed",
	"license_type",
	"license_number",
	"license_expiry",
	"license_image_url",
	"years_experience",
	"certifications",
	"specialties",
	"languages",
	"bio",
	"max_passengers",
	"preferred_boat_types",
	"availability",
	"agreement_signed",
	"agreement_signed_at",
	"total_trips_completed",
	"created_at",
	"updated_at"
)
SELECT
	"user_id",
	CASE 
		WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"CaptainStatus"
		WHEN "status" = 'INACTIVE' THEN 'INACTIVE'::"CaptainStatus"
		WHEN "status" = 'SUSPENDED' THEN 'SUSPENDED'::"CaptainStatus"
		ELSE 'PENDING'::"CaptainStatus"
	END,
	"city",
	"state",
	"zip",
	"uscg_licensed",
	"license_type",
	"license_number",
	"license_expiry",
	"license_image",
	"years_experience",
	"certifications",
	"specialties",
	"languages",
	"description",
	"max_passengers",
	"preferred_boat_types",
	"availability",
	"agreement_signed",
	"agreement_date",
	"total_trips",
	"created_at",
	"updated_at"
FROM "captain"
WHERE "user_id" IS NOT NULL
ON CONFLICT ("user_id") DO NOTHING;--> statement-breakpoint

-- ============================================
-- STEP 4: Add new columns to referencing tables (BEFORE dropping old constraints)
-- ============================================
ALTER TABLE "boat" ADD COLUMN "primary_captain_user_id" uuid;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "captain_user_id" uuid;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "reviewed_captain_user_id" uuid;--> statement-breakpoint

-- ============================================
-- STEP 5: Migrate FK data from captain.id to user.id
-- ============================================
UPDATE "boat" b
SET "primary_captain_user_id" = c."user_id"
FROM "captain" c
WHERE b."primary_captain_id" = c."id";--> statement-breakpoint

UPDATE "booking" bk
SET "captain_user_id" = c."user_id"
FROM "captain" c
WHERE bk."captain_id" = c."id";--> statement-breakpoint

UPDATE "review" r
SET "reviewed_captain_user_id" = c."user_id"
FROM "captain" c
WHERE r."reviewed_captain_id" = c."id";--> statement-breakpoint

-- ============================================
-- STEP 6: Drop old constraints and indexes
-- ============================================
ALTER TABLE "boat" DROP CONSTRAINT IF EXISTS "boat_primary_captain_id_captain_id_fk";--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT IF EXISTS "booking_captain_id_captain_id_fk";--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT IF EXISTS "review_reviewed_captain_id_captain_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "boat_captain_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "booking_captain_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "review_captain_idx";--> statement-breakpoint

-- ============================================
-- STEP 7: Drop old columns
-- ============================================
ALTER TABLE "boat" DROP COLUMN IF EXISTS "primary_captain_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN IF EXISTS "captain_id";--> statement-breakpoint
ALTER TABLE "review" DROP COLUMN IF EXISTS "reviewed_captain_id";--> statement-breakpoint

-- ============================================
-- STEP 8: Now safe to drop captain table
-- ============================================
ALTER TABLE "captain" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "captain" CASCADE;--> statement-breakpoint

-- ============================================
-- STEP 9: Add FK constraints to new profile tables
-- ============================================
ALTER TABLE "captain_profile" ADD CONSTRAINT "captain_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captain_profile" ADD CONSTRAINT "captain_profile_verified_by_user_id_user_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_profile" ADD CONSTRAINT "owner_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_profile" ADD CONSTRAINT "owner_profile_verified_by_user_id_user_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- ============================================
-- STEP 10: Add FK constraints to referencing tables (now pointing to users)
-- ============================================
ALTER TABLE "boat" ADD CONSTRAINT "boat_primary_captain_user_id_user_id_fk" FOREIGN KEY ("primary_captain_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_captain_user_id_user_id_fk" FOREIGN KEY ("captain_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_captain_user_id_user_id_fk" FOREIGN KEY ("reviewed_captain_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- ============================================
-- STEP 11: Create indexes
-- ============================================
CREATE INDEX "captain_profile_status_idx" ON "captain_profile" USING btree ("status");--> statement-breakpoint
CREATE INDEX "captain_profile_location_idx" ON "captain_profile" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "captain_profile_license_expiry_idx" ON "captain_profile" USING btree ("license_expiry");--> statement-breakpoint
CREATE INDEX "owner_profile_business_type_idx" ON "owner_profile" USING btree ("business_type");--> statement-breakpoint
CREATE INDEX "owner_profile_stripe_idx" ON "owner_profile" USING btree ("stripe_connect_account_id");--> statement-breakpoint
CREATE INDEX "owner_profile_payouts_idx" ON "owner_profile" USING btree ("payouts_enabled");--> statement-breakpoint
CREATE INDEX "boat_captain_idx" ON "boat" USING btree ("primary_captain_user_id");--> statement-breakpoint
CREATE INDEX "booking_captain_idx" ON "booking" USING btree ("captain_user_id");--> statement-breakpoint
CREATE INDEX "review_captain_idx" ON "review" USING btree ("reviewed_captain_user_id");--> statement-breakpoint

-- ============================================
-- STEP 12: Create owner profiles for existing boat owners
-- ============================================
INSERT INTO "owner_profile" ("user_id", "created_at", "updated_at")
SELECT DISTINCT "owner_id", NOW(), NOW()
FROM "boat"
WHERE "owner_id" IS NOT NULL
ON CONFLICT ("user_id") DO NOTHING;--> statement-breakpoint

-- ============================================
-- STEP 13: Role to isAdmin migration (if not already done)
-- These use IF EXISTS/IF NOT EXISTS for idempotency
-- ============================================

-- Add is_admin column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'is_admin') THEN
        ALTER TABLE "user" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;
    END IF;
END $$;--> statement-breakpoint

-- Migrate role data to is_admin if role column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user' AND column_name = 'role') THEN
        UPDATE "user" SET "is_admin" = true WHERE "role" = 'ADMIN';
    END IF;
END $$;--> statement-breakpoint

-- Drop role index if it exists
DROP INDEX IF EXISTS "role_idx";--> statement-breakpoint

-- Create is_admin index if it doesn't exist
CREATE INDEX IF NOT EXISTS "is_admin_idx" ON "user" USING btree ("is_admin");--> statement-breakpoint

-- Drop role column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user' AND column_name = 'role') THEN
        ALTER TABLE "user" DROP COLUMN "role";
    END IF;
END $$;--> statement-breakpoint

-- Drop UserRole type if it exists
DROP TYPE IF EXISTS "public"."UserRole";