CREATE TABLE "app_setting" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"service_fee_bps" integer DEFAULT 350 NOT NULL,
	"booking_hold_minutes" integer DEFAULT 10 NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_setting_singleton" CHECK ("app_setting"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "app_setting" ADD CONSTRAINT "app_setting_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;