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