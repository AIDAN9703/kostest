import { relations } from 'drizzle-orm';
import { verifications } from '../tables/verifications.table';
import { users } from '../tables/users.table';

// Relations for verifications table
export const verificationsRelations = relations(verifications, ({ one }) => ({
  user: one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}));


