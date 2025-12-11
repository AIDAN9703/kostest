import { relations } from 'drizzle-orm';
import { verifications } from './verifications.table';
import { users } from './users.table';

// Relations for verifications table
export const verificationsRelations = relations(verifications, ({ one }) => ({
  user: one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}));


