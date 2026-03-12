CREATE TYPE "public"."ContactMethod" AS ENUM('EMAIL', 'PHONE', 'SMS', 'IN_PERSON', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."InquiryEventType" AS ENUM('CREATED', 'STATUS_CHANGE', 'NOTE', 'CONTACT_ATTEMPT', 'CONVERSATION');--> statement-breakpoint
CREATE TYPE "public"."InquiryStatus" AS ENUM('NEEDS_CONTACT', 'CONTACTED', 'CONVERTED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "inquiry_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"event_type" "InquiryEventType" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"content" text,
	"previous_status" "InquiryStatus",
	"new_status" "InquiryStatus",
	"contact_method" "ContactMethod",
	"metadata" jsonb
);
--> statement-breakpoint
-- Migrate status: add temp column, map values, swap
ALTER TABLE "general_inquiry" ADD COLUMN "status_new" "InquiryStatus";--> statement-breakpoint
UPDATE "general_inquiry" SET "status_new" = 
  CASE 
    WHEN "status" = 'PENDING' THEN 'NEEDS_CONTACT'::"InquiryStatus"
    WHEN "status" = 'CONTACTED' THEN 'CONTACTED'::"InquiryStatus"
    WHEN "status" = 'RESOLVED' THEN 'CONVERTED'::"InquiryStatus"
    WHEN "status" = 'ARCHIVED' THEN 'ARCHIVED'::"InquiryStatus"
    ELSE 'NEEDS_CONTACT'::"InquiryStatus"
  END;--> statement-breakpoint
ALTER TABLE "general_inquiry" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "general_inquiry" RENAME COLUMN "status_new" TO "status";--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "status" SET DEFAULT 'NEEDS_CONTACT';--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD CONSTRAINT "inquiry_event_inquiry_id_general_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."general_inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD CONSTRAINT "inquiry_event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiry_event_inquiry_idx" ON "inquiry_event" USING btree ("inquiry_id");--> statement-breakpoint
CREATE INDEX "inquiry_event_created_idx" ON "inquiry_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiry_event_type_idx" ON "inquiry_event" USING btree ("event_type");--> statement-breakpoint
ALTER TABLE "general_inquiry" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "general_inquiry" DROP COLUMN "contacted_at";--> statement-breakpoint
ALTER TABLE "general_inquiry" DROP COLUMN "resolved_at";