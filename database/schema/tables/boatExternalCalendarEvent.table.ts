import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { boatExternalCalendars } from "./boatExternalCalendar.table";

/**
 * A single busy block imported from an external iCal feed. These are the
 * expanded occurrences (recurring events are flattened into individual rows
 * within the sync window) and are treated as availability conflicts exactly
 * like manual `boat_blocking` rows.
 *
 * Rows are owned by their calendar: a re-sync deletes and re-inserts the full
 * set for that calendar, so no stale events linger.
 */
export const boatExternalCalendarEvents = pgTable(
  "boat_external_calendar_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalCalendarId: uuid("external_calendar_id")
      .notNull()
      .references(() => boatExternalCalendars.id, { onDelete: "cascade" }),
    // Denormalized for fast availability lookups by boat.
    boatId: uuid("boat_id")
      .notNull()
      .references(() => boats.id, { onDelete: "cascade" }),

    // Source iCal UID (not unique — recurring events share a UID across rows).
    uid: text("uid"),
    summary: text("summary"),

    startTime: timestamp("start_time", { mode: "date", withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { mode: "date", withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("boat_external_calendar_event_boat_time_idx").on(
      table.boatId,
      table.startTime,
      table.endTime
    ),
    index("boat_external_calendar_event_calendar_idx").on(table.externalCalendarId),
  ]
);
