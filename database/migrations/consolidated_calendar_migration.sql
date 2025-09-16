-- Consolidated Calendar System Migration
-- This file combines all calendar-related changes into one clean migration
-- Run this directly in your Neon SQL editor

-- Step 1: Create new enum types (if they don't exist)
DO $$ BEGIN
    CREATE TYPE "CalendarOwnerType" AS ENUM('ADMIN', 'OWNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CalendarSource" AS ENUM('GOOGLE', 'MANUAL', 'BOOKING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CalendarSyncStatus" AS ENUM('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Drop old tables and indexes if they exist
DROP TABLE IF EXISTS "boat_availability" CASCADE;
DROP TABLE IF EXISTS "boat_calendars" CASCADE; 
DROP TABLE IF EXISTS "availability_holds" CASCADE;

-- Step 3: Update boat_blocking table to use proper timezone timestamps
ALTER TABLE "boat_blocking" 
ALTER COLUMN "start_time" SET DATA TYPE timestamp with time zone,
ALTER COLUMN "end_time" SET DATA TYPE timestamp with time zone,
ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone,
ALTER COLUMN "created_at" SET NOT NULL;

-- Step 4: Create new boat_google_calendars table
CREATE TABLE "boat_google_calendars" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "boat_id" uuid NOT NULL,
    "calendar_id" text NOT NULL,
    "calendar_name" text NOT NULL,
    "owner_type" "CalendarOwnerType" NOT NULL,
    "owner_user_id" uuid NOT NULL,
    "sync_enabled" boolean DEFAULT true NOT NULL,
    "last_sync_at" timestamp with time zone,
    "last_sync_status" "CalendarSyncStatus",
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Step 5: Create new external_google_calendar_sync_events table
CREATE TABLE "external_google_calendar_sync_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "boat_id" uuid NOT NULL,
    "boat_calendar_id" uuid NOT NULL,
    "event_id" text,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "source" "CalendarSource" NOT NULL,
    "booking_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_synced_at" timestamp with time zone
);

-- Step 6: Add foreign key constraints
ALTER TABLE "boat_google_calendars" 
ADD CONSTRAINT "boat_google_calendars_boat_id_boat_id_fk" 
FOREIGN KEY ("boat_id") REFERENCES "boat"("id") ON DELETE cascade;

ALTER TABLE "boat_google_calendars" 
ADD CONSTRAINT "boat_google_calendars_owner_user_id_user_id_fk" 
FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE no action;

ALTER TABLE "external_google_calendar_sync_events" 
ADD CONSTRAINT "external_google_calendar_sync_events_boat_id_boat_id_fk" 
FOREIGN KEY ("boat_id") REFERENCES "boat"("id") ON DELETE cascade;

ALTER TABLE "external_google_calendar_sync_events" 
ADD CONSTRAINT "external_google_calendar_sync_events_boat_calendar_id_boat_google_calendars_id_fk" 
FOREIGN KEY ("boat_calendar_id") REFERENCES "boat_google_calendars"("id") ON DELETE cascade;

ALTER TABLE "external_google_calendar_sync_events" 
ADD CONSTRAINT "external_google_calendar_sync_events_booking_id_booking_id_fk" 
FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE no action;

-- Step 7: Create indexes with correct names
-- Indexes for boat_google_calendars
CREATE INDEX "boat_google_calendars_boat_idx" ON "boat_google_calendars" USING btree ("boat_id");
CREATE INDEX "boat_google_calendars_owner_idx" ON "boat_google_calendars" USING btree ("owner_user_id");
CREATE INDEX "boat_google_calendars_boat_owner_idx" ON "boat_google_calendars" USING btree ("boat_id","owner_user_id");

-- Indexes for external_google_calendar_sync_events  
CREATE INDEX "external_google_calendar_sync_events_boat_idx" ON "external_google_calendar_sync_events" USING btree ("boat_id");
CREATE INDEX "external_google_calendar_sync_events_boat_calendar_idx" ON "external_google_calendar_sync_events" USING btree ("boat_calendar_id");
CREATE INDEX "external_google_calendar_sync_events_booking_idx" ON "external_google_calendar_sync_events" USING btree ("booking_id");
CREATE INDEX "external_google_calendar_sync_events_event_idx" ON "external_google_calendar_sync_events" USING btree ("event_id");
CREATE INDEX "external_google_calendar_sync_events_time_idx" ON "external_google_calendar_sync_events" USING btree ("start_time","end_time");

-- Step 8: Verify tables were created successfully
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('boat_google_calendars', 'external_google_calendar_sync_events')
ORDER BY table_name, ordinal_position;

-- Migration completed successfully!
-- Your calendar system now has:
-- 1. boat_google_calendars - for storing iCal URL configurations
-- 2. external_google_calendar_sync_events - for storing synced calendar events  
-- 3. boat_blocking - updated with proper timezone handling
-- 4. Proper indexes with descriptive names
-- 5. All foreign key relationships established
