import { relations } from 'drizzle-orm';
import { boatBlocking } from '../tables/boatBlocking.table';
import { boats } from '../tables/boats.table';
import { users } from '../tables/users.table';

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


