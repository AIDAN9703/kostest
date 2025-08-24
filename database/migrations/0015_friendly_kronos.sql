CREATE TYPE "public"."timezone" AS ENUM('America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'America/Nassau', 'America/Jamaica', 'America/Santo_Domingo', 'America/Barbados', 'America/Cancun', 'America/Toronto', 'America/Vancouver');

ALTER TABLE "boat" ADD COLUMN "timezone" timezone;