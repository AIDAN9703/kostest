CREATE TABLE "promo_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text,
	"description" text,
	"type" text NOT NULL,
	"value" double precision NOT NULL,
	"minimum_amount" double precision,
	"applicable_boats" uuid[],
	"applicable_categories" text[],
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"per_user_limit" integer DEFAULT 1,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_code_unique_idx" UNIQUE("code")
);
CREATE TABLE "promo_code_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"user_id" uuid,
	"discount_amount" double precision NOT NULL,
	"original_amount" double precision NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "booking" ADD COLUMN "promo_code_id" uuid;
ALTER TABLE "booking" ADD COLUMN "discount_amount" double precision DEFAULT 0;
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "promo_code_type_idx" ON "promo_code" USING btree ("type");
CREATE INDEX "promo_code_active_idx" ON "promo_code" USING btree ("is_active");
CREATE INDEX "promo_code_valid_period_idx" ON "promo_code" USING btree ("valid_from","valid_until");
CREATE INDEX "promo_usage_code_idx" ON "promo_code_usage" USING btree ("promo_code_id");
CREATE INDEX "promo_usage_user_idx" ON "promo_code_usage" USING btree ("user_id");
CREATE INDEX "promo_usage_booking_idx" ON "promo_code_usage" USING btree ("booking_id");
CREATE INDEX "promo_usage_date_idx" ON "promo_code_usage" USING btree ("used_at");
ALTER TABLE "booking" ADD CONSTRAINT "booking_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE no action ON UPDATE no action;