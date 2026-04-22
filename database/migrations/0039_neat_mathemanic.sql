ALTER TABLE "general_inquiry" RENAME TO "inquiry";--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_inquiry_id_general_inquiry_id_fk";
--> statement-breakpoint
ALTER TABLE "inquiry" DROP CONSTRAINT "general_inquiry_assigned_to_user_id_fk";
--> statement-breakpoint
ALTER TABLE "inquiry_event" DROP CONSTRAINT "inquiry_event_inquiry_id_general_inquiry_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_event" ADD CONSTRAINT "inquiry_event_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;