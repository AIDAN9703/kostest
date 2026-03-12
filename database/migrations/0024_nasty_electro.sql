CREATE TYPE "public"."ProposalEventType" AS ENUM('CREATED', 'STATUS_CHANGE', 'NOTE', 'CUSTOMER_NOTE', 'INVOICE_SENT', 'PAYMENT_RECEIVED');--> statement-breakpoint
CREATE TABLE "proposal_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"event_type" "ProposalEventType" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"content" text,
	"previous_status" "ProposalStatus",
	"new_status" "ProposalStatus",
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "proposal_event" ADD CONSTRAINT "proposal_event_proposal_id_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_event" ADD CONSTRAINT "proposal_event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "proposal_event_proposal_idx" ON "proposal_event" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposal_event_created_idx" ON "proposal_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "proposal_event_type_idx" ON "proposal_event" USING btree ("event_type");