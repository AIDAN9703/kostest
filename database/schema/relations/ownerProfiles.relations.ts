import { relations } from 'drizzle-orm';
import { ownerProfiles } from '../tables/ownerProfiles.table';
import { users } from '../tables/users.table';

// Relations for ownerProfiles table
export const ownerProfilesRelations = relations(ownerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [ownerProfiles.userId],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [ownerProfiles.verifiedByUserId],
    references: [users.id],
    relationName: 'ownerVerifications',
  }),
}));
