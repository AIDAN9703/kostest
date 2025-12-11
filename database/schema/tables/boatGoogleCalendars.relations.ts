import { relations } from 'drizzle-orm';
import { boatGoogleCalendars } from './boatGoogleCalendars.table';
import { boats } from './boats.table';
import { users } from './users.table';
import { externalGoogleCalendarSyncEvents } from './externalGoogleCalendarSyncEvents.table';

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


