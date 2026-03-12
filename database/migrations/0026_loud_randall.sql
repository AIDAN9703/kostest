ALTER TYPE "public"."BookingStatus" ADD VALUE 'DRAFT' BEFORE 'PENDING';--> statement-breakpoint
CREATE TABLE "booking_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"notes" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "booking_group_id" uuid;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "public_token" uuid;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "allow_payment" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "payment_type" text DEFAULT 'FULL_PAYMENT';--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "accepted_customer_note" text;--> statement-breakpoint
ALTER TABLE "booking_group" ADD CONSTRAINT "booking_group_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_group_created_by_idx" ON "booking_group" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "booking_group_created_at_idx" ON "booking_group" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_booking_group_id_booking_group_id_fk" FOREIGN KEY ("booking_group_id") REFERENCES "public"."booking_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_group_idx" ON "booking" USING btree ("booking_group_id");--> statement-breakpoint
CREATE INDEX "booking_public_token_idx" ON "booking" USING btree ("public_token");--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_public_token_unique" UNIQUE("public_token");