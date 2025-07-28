ALTER TABLE "message" DROP CONSTRAINT "message_parent_message_id_message_id_fk";
--> statement-breakpoint
DROP INDEX "message_parent_idx";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "parent_message_id";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "thread_count";