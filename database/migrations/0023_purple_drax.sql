ALTER TABLE "proposal_boat_option" DROP CONSTRAINT "proposal_boat_option_pricing_tier_id_boat_pricing_tier_id_fk";
--> statement-breakpoint
DROP INDEX "proposal_boat_option_tier_idx";--> statement-breakpoint
ALTER TABLE "proposal_boat_option" DROP COLUMN "pricing_tier_id";--> statement-breakpoint
ALTER TABLE "proposal_boat_option" DROP COLUMN "tier_name";--> statement-breakpoint
ALTER TABLE "proposal_boat_option" DROP COLUMN "tier_hours";