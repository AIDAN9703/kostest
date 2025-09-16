import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { boatGoogleCalendars } from "./boatGoogleCalendars.table";
import { bookings } from "./bookings.table";
import { calendarSourceEnum } from "../enums/availability.enums";

export const externalGoogleCalendarSyncEvents = pgTable("external_google_calendar_sync_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  
  // Which external calendar produced this event
  boatCalendarId: uuid("boat_calendar_id").notNull().references(() => boatGoogleCalendars.id, { onDelete: "cascade" }),
  
  // External event ID for deduplication
  eventId: text("event_id"), // External calendar event ID
  
  // Time period
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  
  // Availability status
  isAvailable: boolean("is_available").default(true).notNull(),
  
  // Source of this availability record
  source: calendarSourceEnum("source").notNull(),
  
  // Optional booking reference (if source is BOOKING)
  bookingId: uuid("booking_id").references(() => bookings.id),
  
  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  
}, (table) => [
  index("external_google_calendar_sync_events_boat_idx").on(table.boatId),
  index("external_google_calendar_sync_events_boat_calendar_idx").on(table.boatCalendarId),
  index("external_google_calendar_sync_events_booking_idx").on(table.bookingId),
  index("external_google_calendar_sync_events_event_idx").on(table.eventId),
  index("external_google_calendar_sync_events_time_idx").on(table.startTime, table.endTime),
]);
