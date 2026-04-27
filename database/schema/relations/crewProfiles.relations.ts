import { relations } from "drizzle-orm";
import { crewProfiles } from "../tables/crewProfiles.table";
import { users } from "../tables/users.table";

export const crewProfilesRelations = relations(crewProfiles, ({ one }) => ({
  user: one(users, {
    fields: [crewProfiles.userId],
    references: [users.id],
  }),
}));
