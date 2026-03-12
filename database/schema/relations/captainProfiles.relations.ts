import { relations } from 'drizzle-orm';
import { captainProfiles } from '../tables/captainProfiles.table';
import { users } from '../tables/users.table';

// Relations for captainProfiles table
export const captainProfilesRelations = relations(captainProfiles, ({ one }) => ({
  user: one(users, {
    fields: [captainProfiles.userId],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [captainProfiles.verifiedByUserId],
    references: [users.id],
    relationName: 'captainVerifications',
  }),
}));
