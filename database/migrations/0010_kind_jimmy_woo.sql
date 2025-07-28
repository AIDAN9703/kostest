ALTER TABLE "booking" RENAME COLUMN "start_date" TO "start_datetime";--> statement-breakpoint
ALTER TABLE "booking" RENAME COLUMN "end_date" TO "end_datetime";--> statement-breakpoint
DROP INDEX "booking_date_idx";--> statement-breakpoint
CREATE INDEX "booking_datetime_idx" ON "booking" USING btree ("start_datetime","end_datetime");--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "end_time";



UPDATE "booking"
SET
    "new_start_datetime" = to_timestamp(
        CAST(DATE("start_date") AS text) || ' ' ||
        (CASE WHEN LENGTH("start_time") = 5 THEN "start_time" || ':00' ELSE "start_time" END),
        'YYYY-MM-DD HH24:MI:SS'
    ) AT TIME ZONE 'America/New_York' AT TIME ZONE 'UTC',
    "new_end_datetime" = CASE
        WHEN "end_date" IS NOT NULL AND "end_time" IS NOT NULL THEN
            to_timestamp(
                CAST(DATE("end_date") AS text) || ' ' ||
                (CASE WHEN LENGTH("end_time") = 5 THEN "end_time" || ':00' ELSE "end_time" END),
                'YYYY-MM-DD HH24:MI:SS'
            ) AT TIME ZONE 'America/New_York' AT TIME ZONE 'UTC'
        ELSE NULL
    END
WHERE
    "start_date" IS NOT NULL AND "start_time" IS NOT NULL;

ALTER TABLE "booking" DROP COLUMN IF EXISTS "start_date";
ALTER TABLE "booking" DROP COLUMN IF EXISTS "end_date";
ALTER TABLE "booking" DROP COLUMN IF EXISTS "start_time";
ALTER TABLE "booking" DROP COLUMN IF EXISTS "end_time";

ALTER TABLE "booking" RENAME COLUMN "new_start_datetime" TO "start_datetime";
ALTER TABLE "booking" RENAME COLUMN "new_end_datetime" TO "end_datetime";

ALTER TABLE "booking" ALTER COLUMN "start_datetime" SET NOT NULL;

DROP INDEX IF EXISTS "booking_date_idx";
CREATE INDEX "booking_datetime_idx" ON "booking" USING btree ("start_datetime","end_datetime");