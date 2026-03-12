ALTER TABLE "public"."general_inquiry" ALTER COLUMN "stage" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."general_inquiry" ALTER COLUMN "stage" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "previous_stage" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "new_stage" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."InquiryStage";--> statement-breakpoint
CREATE TYPE "public"."InquiryStage" AS ENUM('NEEDS_CONTACT', 'CONTACTED', 'CONVERTED');--> statement-breakpoint
UPDATE "public"."general_inquiry" SET "stage" = 'CONTACTED' WHERE "stage" = 'PROPOSAL_SENT';--> statement-breakpoint
UPDATE "public"."inquiry_event" SET "previous_stage" = 'CONTACTED' WHERE "previous_stage" = 'PROPOSAL_SENT';--> statement-breakpoint
UPDATE "public"."inquiry_event" SET "new_stage" = 'CONTACTED' WHERE "new_stage" = 'PROPOSAL_SENT';--> statement-breakpoint
ALTER TABLE "public"."general_inquiry" ALTER COLUMN "stage" SET DATA TYPE "public"."InquiryStage" USING "stage"::"public"."InquiryStage";--> statement-breakpoint
ALTER TABLE "public"."general_inquiry" ALTER COLUMN "stage" SET DEFAULT 'NEEDS_CONTACT'::"public"."InquiryStage";--> statement-breakpoint
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "previous_stage" SET DATA TYPE "public"."InquiryStage" USING "previous_stage"::"public"."InquiryStage";--> statement-breakpoint
ALTER TABLE "public"."inquiry_event" ALTER COLUMN "new_stage" SET DATA TYPE "public"."InquiryStage" USING "new_stage"::"public"."InquiryStage";