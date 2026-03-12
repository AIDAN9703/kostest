import { pgEnum } from "drizzle-orm/pg-core";


export const notificationPreferenceEnum = pgEnum("NotificationPreference", [
    "ALL",
    "IMPORTANT_ONLY",
    "NONE"
  ]);