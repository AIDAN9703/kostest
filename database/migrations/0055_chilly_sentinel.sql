-- Retire the inquiry tables/columns/enums now that the deal lifecycle lives
-- entirely on `booking` (docs/UNIFIED_BOOKINGS_PLAN.md). Idempotent: the live
-- DBs have drifted (DROP TABLE ... CASCADE auto-removes FKs), so every
-- statement guards with IF EXISTS. Backfill data is preserved in the
-- backup_inquiry_* tables (their enum columns are converted to text below so
-- the enum types can be dropped while the backups remain readable).
DROP TABLE IF EXISTS "inquiry_event" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "inquiry" CASCADE;--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT IF EXISTS "booking_inquiry_id_inquiry_id_fk";--> statement-breakpoint
ALTER TABLE "inbound_email" DROP CONSTRAINT IF EXISTS "inbound_email_inquiry_id_inquiry_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "booking_inquiry_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "inbound_email_inquiry_idx";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN IF EXISTS "inquiry_id";--> statement-breakpoint
ALTER TABLE "inbound_email" DROP COLUMN IF EXISTS "inquiry_id";--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.backup_inquiry_20260718') IS NOT NULL THEN
    ALTER TABLE "backup_inquiry_20260718"
      ALTER COLUMN "lead_type" TYPE text USING "lead_type"::text,
      ALTER COLUMN "outcome"   TYPE text USING "outcome"::text,
      ALTER COLUMN "source"    TYPE text USING "source"::text,
      ALTER COLUMN "stage"     TYPE text USING "stage"::text;
  END IF;
  IF to_regclass('public.backup_inquiry_event_20260718') IS NOT NULL THEN
    ALTER TABLE "backup_inquiry_event_20260718"
      ALTER COLUMN "event_type"       TYPE text USING "event_type"::text,
      ALTER COLUMN "new_outcome"      TYPE text USING "new_outcome"::text,
      ALTER COLUMN "new_stage"        TYPE text USING "new_stage"::text,
      ALTER COLUMN "previous_outcome" TYPE text USING "previous_outcome"::text,
      ALTER COLUMN "previous_stage"   TYPE text USING "previous_stage"::text;
  END IF;
END $$;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."InquiryEventType";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."InquiryLeadType";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."InquiryOutcome";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."InquirySource";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."InquiryStage";
