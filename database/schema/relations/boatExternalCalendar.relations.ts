import { relations } from "drizzle-orm";
import { boats } from "../tables/boats.table";
import { boatExternalCalendars } from "../tables/boatExternalCalendar.table";
import { boatExternalCalendarEvents } from "../tables/boatExternalCalendarEvent.table";

export const boatExternalCalendarRelations = relations(
  boatExternalCalendars,
  ({ one, many }) => ({
    boat: one(boats, {
      fields: [boatExternalCalendars.boatId],
      references: [boats.id],
    }),
    events: many(boatExternalCalendarEvents),
  })
);

export const boatExternalCalendarEventRelations = relations(
  boatExternalCalendarEvents,
  ({ one }) => ({
    calendar: one(boatExternalCalendars, {
      fields: [boatExternalCalendarEvents.externalCalendarId],
      references: [boatExternalCalendars.id],
    }),
    boat: one(boats, {
      fields: [boatExternalCalendarEvents.boatId],
      references: [boats.id],
    }),
  })
);
