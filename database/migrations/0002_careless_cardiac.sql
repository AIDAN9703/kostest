ALTER TABLE "events" ADD COLUMN "start_time" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "stripe_product_id" varchar(255);--> statement-breakpoint
ALTER TABLE "ticket_tiers" ADD COLUMN "stripe_price_id" varchar(255);--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "start_at";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "end_at";