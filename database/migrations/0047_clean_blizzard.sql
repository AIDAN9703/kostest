CREATE TYPE "public"."AddOnCategory" AS ENUM('FOOD_BEVERAGE', 'WATER_TOYS', 'FISHING', 'GEAR', 'SERVICES', 'OTHER');--> statement-breakpoint
CREATE TABLE "add_on" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "AddOnCategory" DEFAULT 'OTHER' NOT NULL,
	"default_price_cents" bigint,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boat_add_on" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"add_on_id" uuid NOT NULL,
	"price_cents" bigint,
	"is_complimentary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boat_add_on_unique_idx" UNIQUE("boat_id","add_on_id")
);
--> statement-breakpoint
ALTER TABLE "boat_add_on" ADD CONSTRAINT "boat_add_on_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_add_on" ADD CONSTRAINT "boat_add_on_add_on_id_add_on_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_on"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "add_on_active_idx" ON "add_on" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "boat_add_on_boat_idx" ON "boat_add_on" USING btree ("boat_id");