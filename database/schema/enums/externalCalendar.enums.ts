import { pgEnum } from "drizzle-orm/pg-core";

// Result of the most recent external (iCal) calendar sync attempt.
export const externalCalendarSyncStatusEnum = pgEnum("ExternalCalendarSyncStatus", [
  "PENDING", // Added but not yet synced
  "SUCCESS", // Last fetch + parse succeeded
  "ERROR", // Last fetch or parse failed (see lastSyncError)
]);
