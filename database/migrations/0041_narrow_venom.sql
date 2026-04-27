CREATE TYPE "public"."CrewStatus" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED');--> statement-breakpoint
CREATE TABLE "crew_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"status" "CrewStatus" DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_crew" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crew_profile" ADD CONSTRAINT "crew_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_crew" ADD CONSTRAINT "booking_crew_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_crew" ADD CONSTRAINT "booking_crew_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crew_profile_status_idx" ON "crew_profile" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_crew_booking_user_unique" ON "booking_crew" USING btree ("booking_id","user_id");--> statement-breakpoint
CREATE INDEX "booking_crew_booking_id_idx" ON "booking_crew" USING btree ("booking_id");