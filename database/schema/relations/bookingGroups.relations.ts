import { relations } from "drizzle-orm";
import { bookingGroups } from "../tables/bookingGroups.table";
import { bookings } from "../tables/bookings.table";
import { users } from "../tables/users.table";

export const bookingGroupsRelations = relations(
  bookingGroups,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [bookingGroups.createdById],
      references: [users.id],
    }),
    bookings: many(bookings),
  })
);
