DROP TABLE "events" CASCADE;--> statement-breakpoint
DROP TABLE "ticket_tiers" CASCADE;--> statement-breakpoint
DROP TABLE "event_ticket_purchases" CASCADE;--> statement-breakpoint
DROP TABLE "event_tickets" CASCADE;--> statement-breakpoint
ALTER TABLE "public"."payment" ALTER COLUMN "payable_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."PayableType";--> statement-breakpoint
CREATE TYPE "public"."PayableType" AS ENUM('BOOKING');--> statement-breakpoint
ALTER TABLE "public"."payment" ALTER COLUMN "payable_type" SET DATA TYPE "public"."PayableType" USING "payable_type"::"public"."PayableType";