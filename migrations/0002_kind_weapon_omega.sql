CREATE TYPE "public"."VerificationChannel" AS ENUM('SMS', 'CALL', 'EMAIL', 'WHATSAPP');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"twilio_sid" text,
	"twilio_status" text,
	"related_id" uuid,
	"related_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "VerificationType" NOT NULL,
	"channel" "VerificationChannel" NOT NULL,
	"status" "VerificationStatus" DEFAULT 'PENDING' NOT NULL,
	"phone_number" text,
	"email" text,
	"code" text NOT NULL,
	"code_hash" text,
	"twilio_sid" text,
	"twilio_status" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"ip_address" text,
	"user_agent" text,
	"metadata" json
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_status_idx" ON "notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_related_idx" ON "notification" USING btree ("related_id","related_type");--> statement-breakpoint
CREATE INDEX "verification_user_idx" ON "verification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_status_idx" ON "verification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "verification_type_idx" ON "verification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "verification" USING btree ("expires_at");