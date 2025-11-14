ALTER TABLE "conversation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversation_participant" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "conversation" CASCADE;--> statement-breakpoint
DROP TABLE "message" CASCADE;--> statement-breakpoint
DROP TABLE "conversation_participant" CASCADE;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "assigned_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "contacted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_assigned_admin_id_user_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_assigned_admin_idx" ON "booking" USING btree ("assigned_admin_id");--> statement-breakpoint
DROP TYPE "public"."ConversationStatus";--> statement-breakpoint
DROP TYPE "public"."ConversationType";--> statement-breakpoint
DROP TYPE "public"."MessageStatus";--> statement-breakpoint
DROP TYPE "public"."MessageType";