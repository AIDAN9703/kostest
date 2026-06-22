CREATE TYPE "public"."InquiryLeadType" AS ENUM('GENERAL_QUOTE', 'BOAT_REQUEST', 'TERM_CHARTER', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."InquirySource" AS ENUM('HOME_PAGE', 'BOAT_PAGE', 'CONTACT_PAGE', 'TERM_CHARTER_PAGE', 'PHONE', 'INSTAGRAM', 'WHATSAPP', 'ADMIN', 'BROKER', 'OTHER');--> statement-breakpoint
ALTER TYPE "public"."InquiryEventType" ADD VALUE 'ASSIGNED';--> statement-breakpoint
ALTER TYPE "public"."InquiryStage" ADD VALUE 'NEW' BEFORE 'CONTACTED';--> statement-breakpoint
ALTER TYPE "public"."InquiryStage" ADD VALUE 'CLAIMED' BEFORE 'CONTACTED';--> statement-breakpoint
ALTER TYPE "public"."InquiryStage" ADD VALUE 'QUALIFIED' BEFORE 'CONVERTED';--> statement-breakpoint
ALTER TYPE "public"."InquiryStage" ADD VALUE 'OFFER_SENT' BEFORE 'CONVERTED';--> statement-breakpoint
ALTER TYPE "public"."InquiryStage" ADD VALUE 'COLD';--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "lead_type" "InquiryLeadType" DEFAULT 'GENERAL_QUOTE' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "source" "InquirySource" DEFAULT 'HOME_PAGE' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "boat_id" uuid;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "pricing_tier_id" uuid;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "requested_start_datetime" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "requested_end_datetime" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "needs_captain" boolean;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "estimated_total_cents" bigint;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "budget_cents" bigint;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "converted_booking_id" uuid;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_pricing_tier_id_boat_pricing_tier_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."boat_pricing_tier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_converted_booking_id_booking_id_fk" FOREIGN KEY ("converted_booking_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiry_lead_type_idx" ON "inquiry" USING btree ("lead_type");--> statement-breakpoint
CREATE INDEX "inquiry_source_idx" ON "inquiry" USING btree ("source");--> statement-breakpoint
CREATE INDEX "inquiry_boat_idx" ON "inquiry" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "inquiry_assigned_to_idx" ON "inquiry" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "inquiry_converted_booking_idx" ON "inquiry" USING btree ("converted_booking_id");