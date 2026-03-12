CREATE TYPE "public"."InquiryOutcome" AS ENUM('OPEN', 'WON', 'LOST', 'ABANDONED');--> statement-breakpoint
CREATE TYPE "public"."InquiryStage" AS ENUM('NEEDS_CONTACT', 'CONTACTED', 'PROPOSAL_SENT');--> statement-breakpoint
DROP INDEX IF EXISTS "inquiry_status_idx";--> statement-breakpoint
ALTER TABLE "general_inquiry" ADD COLUMN "stage" "InquiryStage";--> statement-breakpoint
ALTER TABLE "general_inquiry" ADD COLUMN "outcome" "InquiryOutcome";--> statement-breakpoint
-- Migrate status -> stage + outcome
UPDATE "general_inquiry" SET
  "stage" = CASE
    WHEN "status" = 'NEEDS_CONTACT' THEN 'NEEDS_CONTACT'::"InquiryStage"
    WHEN "status" = 'CONTACTED' THEN 'CONTACTED'::"InquiryStage"
    WHEN "status" = 'CONVERTED' THEN 'CONTACTED'::"InquiryStage"
    WHEN "status" = 'ARCHIVED' THEN 'CONTACTED'::"InquiryStage"
    ELSE 'NEEDS_CONTACT'::"InquiryStage"
  END,
  "outcome" = CASE
    WHEN "status" = 'NEEDS_CONTACT' THEN 'OPEN'::"InquiryOutcome"
    WHEN "status" = 'CONTACTED' THEN 'OPEN'::"InquiryOutcome"
    WHEN "status" = 'CONVERTED' THEN 'WON'::"InquiryOutcome"
    WHEN "status" = 'ARCHIVED' THEN 'ABANDONED'::"InquiryOutcome"
    ELSE 'OPEN'::"InquiryOutcome"
  END;--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "stage" SET DEFAULT 'NEEDS_CONTACT';--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "stage" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "outcome" SET DEFAULT 'OPEN';--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "outcome" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "general_inquiry" DROP COLUMN "status";--> statement-breakpoint
CREATE INDEX "inquiry_stage_idx" ON "general_inquiry" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "inquiry_outcome_idx" ON "general_inquiry" USING btree ("outcome");--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD COLUMN "previous_stage" "InquiryStage";--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD COLUMN "new_stage" "InquiryStage";--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD COLUMN "previous_outcome" "InquiryOutcome";--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD COLUMN "new_outcome" "InquiryOutcome";--> statement-breakpoint
-- Convert event_type to text so we can migrate STATUS_CHANGE
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
-- Migrate STATUS_CHANGE events to STAGE_CHANGE or OUTCOME_CHANGE
UPDATE "inquiry_event" SET
  "event_type" = CASE
    WHEN "new_status" = 'CONVERTED' THEN 'OUTCOME_CHANGE'
    WHEN "new_status" = 'ARCHIVED' THEN 'OUTCOME_CHANGE'
    ELSE 'STAGE_CHANGE'
  END,
  "previous_stage" = CASE
    WHEN "previous_status" = 'NEEDS_CONTACT' THEN 'NEEDS_CONTACT'::"InquiryStage"
    WHEN "previous_status" = 'CONTACTED' THEN 'CONTACTED'::"InquiryStage"
    WHEN "previous_status" = 'CONVERTED' THEN 'CONTACTED'::"InquiryStage"
    WHEN "previous_status" = 'ARCHIVED' THEN 'CONTACTED'::"InquiryStage"
    ELSE 'NEEDS_CONTACT'::"InquiryStage"
  END,
  "new_stage" = CASE
    WHEN "new_status" = 'NEEDS_CONTACT' THEN 'NEEDS_CONTACT'::"InquiryStage"
    WHEN "new_status" = 'CONTACTED' THEN 'CONTACTED'::"InquiryStage"
    WHEN "new_status" = 'CONVERTED' THEN 'CONTACTED'::"InquiryStage"
    WHEN "new_status" = 'ARCHIVED' THEN 'CONTACTED'::"InquiryStage"
    ELSE 'CONTACTED'::"InquiryStage"
  END,
  "previous_outcome" = CASE
    WHEN "new_status" IN ('CONVERTED', 'ARCHIVED') THEN 'OPEN'::"InquiryOutcome"
    ELSE NULL
  END,
  "new_outcome" = CASE
    WHEN "new_status" = 'CONVERTED' THEN 'WON'::"InquiryOutcome"
    WHEN "new_status" = 'ARCHIVED' THEN 'ABANDONED'::"InquiryOutcome"
    ELSE NULL
  END
WHERE "event_type" = 'STATUS_CHANGE';--> statement-breakpoint
DROP TYPE "public"."InquiryEventType";--> statement-breakpoint
CREATE TYPE "public"."InquiryEventType" AS ENUM('CREATED', 'STAGE_CHANGE', 'OUTCOME_CHANGE', 'NOTE', 'CONTACT_ATTEMPT', 'CONVERSATION');--> statement-breakpoint
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "event_type" SET DATA TYPE "public"."InquiryEventType" USING "event_type"::"public"."InquiryEventType";--> statement-breakpoint
ALTER TABLE "inquiry_event" DROP COLUMN "previous_status";--> statement-breakpoint
ALTER TABLE "inquiry_event" DROP COLUMN "new_status";--> statement-breakpoint
DROP TYPE "public"."InquiryStatus";
