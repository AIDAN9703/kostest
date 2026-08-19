-- Charter times are entered and displayed in the BOAT's local timezone, but the
-- `timezone` enum only carried Americas values — so the 24 Mykonos boats and the
-- Singapore boat could not be set at all and silently fell back to
-- America/New_York (7 and 12 hours wrong).
--
-- ALTER TYPE ... ADD VALUE is idempotent-safe via IF NOT EXISTS and cannot be
-- rolled back inside a transaction, so each runs standalone.

ALTER TYPE "public"."timezone" ADD VALUE IF NOT EXISTS 'Europe/Athens';
--> statement-breakpoint
ALTER TYPE "public"."timezone" ADD VALUE IF NOT EXISTS 'Asia/Singapore';
