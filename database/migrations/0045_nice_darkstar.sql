CREATE TYPE "public"."BookingExpenseCategory" AS ENUM('OWNER_PAYOUT', 'CAPTAIN', 'FUEL', 'DOCKAGE', 'CREW', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."BookingExpenseLineSource" AS ENUM('MANUAL', 'BOAT_DEFAULT');--> statement-breakpoint
CREATE TABLE "booking_expense_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"category" "BookingExpenseCategory" NOT NULL,
	"amount_cents" bigint NOT NULL,
	"label" text,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"source" "BookingExpenseLineSource" DEFAULT 'MANUAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "boat_pricing_tier" ADD COLUMN "owner_payout_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking_expense_line" ADD CONSTRAINT "booking_expense_line_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_expense_line_booking_id_idx" ON "booking_expense_line" USING btree ("booking_id");