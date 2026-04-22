import { relations } from "drizzle-orm";
import { inquiryEvents } from "../tables/inquiryEvents.table";
import { inquiry } from "../tables/inquiry";
import { users } from "../tables/users.table";

export const inquiryEventsRelations = relations(inquiryEvents, ({ one }) => ({
  inquiry: one(inquiry, {
    fields: [inquiryEvents.inquiryId],
    references: [inquiry.id],
  }),
  createdByUser: one(users, {
    fields: [inquiryEvents.createdBy],
    references: [users.id],
  }),
}));
