import { pgEnum } from "drizzle-orm/pg-core";

export const blockingTypeEnum = pgEnum("BlockingType", [
  "MAINTENANCE",    // Boat maintenance/repairs
  "OWNER_USE",      // Owner personal use
  "WEATHER",        // Weather-related blocking
  "ADMIN_BLOCK",    // Admin manual blocking
  "HOLIDAY",        // Holiday/event blocking
  "SEASONAL",       // Seasonal availability
  "CUSTOM"          // Custom reason
]);

// External calendar enums
export const calendarSourceEnum = pgEnum("CalendarSource", [
  "GOOGLE",         // Google Calendar iCal
  "MANUAL",         // Manual admin entry
  "BOOKING"         // Created from booking
]);

export const calendarOwnerTypeEnum = pgEnum("CalendarOwnerType", [
  "ADMIN",          // Admin-managed calendar
  "OWNER"           // Boat owner's calendar
]);

export const calendarSyncStatusEnum = pgEnum("CalendarSyncStatus", [
  "PENDING",        // Sync scheduled but not run
  "SUCCESS",        // Last sync successful
  "FAILED"          // Last sync failed
]); 