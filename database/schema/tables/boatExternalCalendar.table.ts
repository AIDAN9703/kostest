import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { externalCalendarSyncStatusEnum } from "../enums/externalCalendar.enums";

/**
 * An external iCal feed subscribed to a boat (e.g. the owner's Google Calendar
 * "secret address in iCal format"). We poll the URL on a schedule and import
 * its busy events as availability blocks so the website never double-books a
 * slot that's already taken in the owner's own calendar.
 */
export const boatExternalCalendars = pgTable(
  "boat_external_calendar",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boatId: uuid("boat_id")
      .notNull()
      .references(() => boats.id, { onDelete: "cascade" }),

    // Human label for the feed (e.g. "Google — CT Pontoon").
    name: text("name").notNull(),
    // The iCal (.ics) URL to poll.
    icalUrl: text("ical_url").notNull(),

    syncEnabled: boolean("sync_enabled").default(true).notNull(),

    // Last sync bookkeeping.
    lastSyncedAt: timestamp("last_synced_at", { mode: "date", withTimezone: true }),
    lastSyncStatus: externalCalendarSyncStatusEnum("last_sync_status"),
    lastSyncError: text("last_sync_error"),
    lastEventCount: integer("last_event_count"),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("boat_external_calendar_boat_idx").on(table.boatId)]
);
