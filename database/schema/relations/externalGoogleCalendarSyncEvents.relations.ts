import { relations } from 'drizzle-orm';
import { externalGoogleCalendarSyncEvents } from '../tables/externalGoogleCalendarSyncEvents.table';
import { boats } from '../tables/boats.table';
import { boatGoogleCalendars } from '../tables/boatGoogleCalendars.table';
import { bookings } from '../tables/bookings.table';

// Relations for externalGoogleCalendarSyncEvents table
export const externalGoogleCalendarSyncEventsRelations = relations(externalGoogleCalendarSyncEvents, ({ one }) => ({
  boat: one(boats, {
    fields: [externalGoogleCalendarSyncEvents.boatId],
    references: [boats.id],
  }),
  boatCalendar: one(boatGoogleCalendars, {
    fields: [externalGoogleCalendarSyncEvents.boatCalendarId],
    references: [boatGoogleCalendars.id],
  }),
  booking: one(bookings, {
    fields: [externalGoogleCalendarSyncEvents.bookingId],
    references: [bookings.id],
  }),
}));


