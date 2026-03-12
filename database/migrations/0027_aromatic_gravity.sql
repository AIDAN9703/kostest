DROP TABLE IF EXISTS "proposal_event" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "proposal_line_item" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "proposal_boat_option" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "proposal" CASCADE;--> statement-breakpoint
DROP INDEX IF EXISTS "booking_proposal_idx";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN IF EXISTS "proposal_id";--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "source" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
UPDATE "booking" SET source = 'ADMIN' WHERE source = 'PROPOSAL';--> statement-breakpoint
DROP TYPE IF EXISTS "public"."BookingSource";--> statement-breakpoint
CREATE TYPE "public"."BookingSource" AS ENUM('WEBSITE', 'ADMIN', 'BROKER');--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "source" SET DATA TYPE "public"."BookingSource" USING "source"::"public"."BookingSource";--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "source" SET DEFAULT 'WEBSITE';--> statement-breakpoint
DROP TYPE IF EXISTS "public"."ProposalEventType";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."ProposalStatus";
