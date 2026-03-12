ALTER TABLE "proposal_selection_boat_option" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "proposal_selection_line_item" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "proposal_selection_boat_option" CASCADE;--> statement-breakpoint
DROP TABLE "proposal_selection_line_item" CASCADE;--> statement-breakpoint
ALTER TABLE "proposal_selection" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "proposal_selection" CASCADE;--> statement-breakpoint
ALTER TABLE "proposal_line_item" DROP CONSTRAINT "proposal_line_item_applies_to_boat_option_id_proposal_boat_option_id_fk";
--> statement-breakpoint
DROP INDEX "proposal_converted_booking_idx";--> statement-breakpoint
DROP INDEX "proposal_line_item_boat_option_idx";--> statement-breakpoint
ALTER TABLE "proposal" ADD COLUMN "accepted_customer_note" text;--> statement-breakpoint
ALTER TABLE "proposal" DROP COLUMN "accepted_option_id";--> statement-breakpoint
ALTER TABLE "proposal" DROP COLUMN "converted_to_booking_id";--> statement-breakpoint
ALTER TABLE "proposal" DROP COLUMN "converted_at";--> statement-breakpoint
ALTER TABLE "proposal_line_item" DROP COLUMN "applies_to_boat_option_id";