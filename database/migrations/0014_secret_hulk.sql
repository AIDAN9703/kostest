ALTER TABLE "booking" ALTER COLUMN "payment_status" SET DEFAULT 'AWAITING_PAYMENT';--> statement-breakpoint
CREATE INDEX "idx_bookings_availability" ON "booking" USING btree ("boat_id","booking_status","start_datetime","end_datetime");--> statement-breakpoint
CREATE INDEX "idx_bookings_boat_status" ON "booking" USING btree ("boat_id","booking_status");--> statement-breakpoint
CREATE INDEX "idx_bookings_date_range" ON "booking" USING btree ("start_datetime","end_datetime");--> statement-breakpoint
CREATE INDEX "idx_boat_blocking_availability" ON "boat_blocking" USING btree ("boat_id","start_time","end_time");