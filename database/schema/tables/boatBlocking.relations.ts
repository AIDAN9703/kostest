import { relations } from 'drizzle-orm';
import { boatBlocking } from './boatBlocking.table';
import { boats } from './boats.table';
import { users } from './users.table';

// Relations for boatBlocking table
export const boatBlockingRelations = relations(boatBlocking, ({ one }) => ({
  boat: one(boats, {
    fields: [boatBlocking.boatId],
    references: [boats.id],
  }),
  createdByUser: one(users, {
    fields: [boatBlocking.createdBy],
    references: [users.id],
  }),
}));


