ALTER TABLE "public"."inquiry_event" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
-- Migrate CONVERSATION events to CONTACT_ATTEMPT before dropping enum
UPDATE "inquiry_event"
SET "event_type" = 'CONTACT_ATTEMPT',
    "contact_method" = COALESCE("contact_method", 'OTHER')
WHERE "event_type" = 'CONVERSATION';--> statement-breakpoint
DROP TYPE "public"."InquiryEventType";--> statement-breakpoint
CREATE TYPE "public"."InquiryEventType" AS ENUM('CREATED', 'STAGE_CHANGE', 'OUTCOME_CHANGE', 'NOTE', 'CONTACT_ATTEMPT');--> statement-breakpoint
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "event_type" SET DATA TYPE "public"."InquiryEventType" USING "event_type"::"public"."InquiryEventType";