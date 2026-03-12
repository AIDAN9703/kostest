CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"user_id" uuid,
	"boat_id" uuid NOT NULL,
	"boat_owner_id" uuid,
	"pricing_tier_id" uuid,
	"start_datetime" timestamp with time zone NOT NULL,
	"end_datetime" timestamp with time zone,
	"number_of_passengers" integer NOT NULL,
	"pickup_location" text,
	"dropoff_location" text,
	"special_requests" text,
	"includes_captain" boolean DEFAULT false,
	"includes_fuel" boolean DEFAULT false,
	"includes_insurance" boolean DEFAULT true,
	"base_price" double precision NOT NULL,
	"captain_fee" double precision,
	"cleaning_fee" double precision,
	"service_fee" double precision,
	"tax_amount" double precision,
	"discount_amount" double precision DEFAULT 0,
	"total_amount" double precision NOT NULL,
	"deposit_amount" double precision,
	"expires_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"converted_to_booking_id" uuid,
	"admin_notes" text,
	"customer_notes" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_boat_owner_id_user_id_fk" FOREIGN KEY ("boat_owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_pricing_tier_id_boat_pricing_tier_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."boat_pricing_tier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quote_status_idx" ON "quote" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_customer_email_idx" ON "quote" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "quote_boat_id_idx" ON "quote" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "quote_expires_at_idx" ON "quote" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "quote_created_at_idx" ON "quote" USING btree ("created_at");