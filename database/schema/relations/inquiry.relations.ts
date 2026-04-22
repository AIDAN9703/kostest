import { relations } from "drizzle-orm";
import { inquiry } from "../tables/inquiry";
import { inquiryEvents } from "../tables/inquiryEvents.table";
import { users } from "../tables/users.table";
import { bookings } from "../tables/bookings.table";

export const inquiryRelations = relations(inquiry, ({ one, many }) => ({
  assignedToUser: one(users, {
    fields: [inquiry.assignedTo],
    references: [users.id],
  }),
  events: many(inquiryEvents),
  booking: one(bookings, {
    fields: [inquiry.id],
    references: [bookings.inquiryId],
  }),
}));
