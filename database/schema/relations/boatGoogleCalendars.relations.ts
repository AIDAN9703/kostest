import { relations } from 'drizzle-orm';
import { boatGoogleCalendars } from '../tables/boatGoogleCalendars.table';
import { boats } from '../tables/boats.table';
import { users } from '../tables/users.table';
import { externalGoogleCalendarSyncEvents } from '../tables/externalGoogleCalendarSyncEvents.table';

// Relations for boatGoogleCalendars table
export const boatGoogleCalendarsRelations = relations(boatGoogleCalendars, ({ one, many }) => ({
  boat: one(boats, {
    fields: [boatGoogleCalendars.boatId],
    references: [boats.id],
  }),
  owner: one(users, {
    fields: [boatGoogleCalendars.ownerUserId],
    references: [users.id],
  }),
  syncEvents: many(externalGoogleCalendarSyncEvents),
}));


