-- Create the new VerificationChannel enum with exception handling
DO $$ 
BEGIN
    CREATE TYPE "VerificationChannel" AS ENUM ('SMS', 'CALL', 'EMAIL', 'WHATSAPP');
EXCEPTION
    WHEN duplicate_object THEN 
        NULL;
END $$;

-- Create the verification table
CREATE TABLE IF NOT EXISTS "verification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "type" "VerificationType" NOT NULL,
  "channel" "VerificationChannel" NOT NULL,
  "status" "VerificationStatus" DEFAULT 'PENDING' NOT NULL,
  "phone_number" TEXT,
  "email" TEXT,
  "code" TEXT NOT NULL,
  "code_hash" TEXT,
  "twilio_sid" TEXT,
  "twilio_status" TEXT,
  "attempts" INTEGER DEFAULT 0 NOT NULL,
  "max_attempts" INTEGER DEFAULT 3 NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "verified_at" TIMESTAMP WITH TIME ZONE,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "metadata" JSONB,
  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- Create indexes for the verification table
CREATE INDEX IF NOT EXISTS "verification_user_idx" ON "verification" ("user_id");
CREATE INDEX IF NOT EXISTS "verification_status_idx" ON "verification" ("status");
CREATE INDEX IF NOT EXISTS "verification_type_idx" ON "verification" ("type");
CREATE INDEX IF NOT EXISTS "verification_expires_idx" ON "verification" ("expires_at");

-- Add foreign key constraint
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create the notification table
CREATE TABLE IF NOT EXISTS "notification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "status" TEXT DEFAULT 'PENDING' NOT NULL,
  "twilio_sid" TEXT,
  "twilio_status" TEXT,
  "related_id" UUID,
  "related_type" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "sent_at" TIMESTAMP WITH TIME ZONE,
  "delivered_at" TIMESTAMP WITH TIME ZONE,
  "read_at" TIMESTAMP WITH TIME ZONE,
  "metadata" JSONB,
  CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- Create indexes for the notification table
CREATE INDEX IF NOT EXISTS "notification_user_idx" ON "notification" ("user_id");
CREATE INDEX IF NOT EXISTS "notification_status_idx" ON "notification" ("status");
CREATE INDEX IF NOT EXISTS "notification_type_idx" ON "notification" ("type");
CREATE INDEX IF NOT EXISTS "notification_related_idx" ON "notification" ("related_id", "related_type");

-- Add foreign key constraint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE; 