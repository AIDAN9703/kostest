ALTER TABLE "booking" ADD COLUMN "inquiry_id" uuid;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_inquiry_id_general_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."general_inquiry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_inquiry_idx" ON "booking" USING btree ("inquiry_id");