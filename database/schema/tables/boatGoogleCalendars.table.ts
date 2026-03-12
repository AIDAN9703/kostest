import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { users } from "./users.table";
import { calendarOwnerTypeEnum, calendarSyncStatusEnum } from "../enums/availability.enums";

export const boatGoogleCalendars = pgTable("boat_google_calendars", {
  id: uuid("id").primaryKey().defaultRandom(),
  boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  
  // Calendar identification
  calendarId: text("calendar_id").notNull(), // iCal URL or Google Calendar ID
  calendarName: text("calendar_name").notNull(), // Display name
  
  // Ownership
  ownerType: calendarOwnerTypeEnum("owner_type").notNull(), // ADMIN or OWNER
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "restrict" }), // Can't delete user if owns calendar
  
  // Sync configuration
  syncEnabled: boolean("sync_enabled").default(true).notNull(),
  lastSyncAt: timestamp("last_sync_at", { mode: "date", withTimezone: true }),
  lastSyncStatus: calendarSyncStatusEnum("last_sync_status"),
  
  // Metadata
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  
}, (table) => [
  index("boat_google_calendars_boat_idx").on(table.boatId),
  index("boat_google_calendars_owner_idx").on(table.ownerUserId),
  index("boat_google_calendars_boat_owner_idx").on(table.boatId, table.ownerUserId),
]);
