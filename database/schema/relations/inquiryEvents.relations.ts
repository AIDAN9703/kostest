import { relations } from "drizzle-orm";
import { inquiryEvents } from "../tables/inquiryEvents.table";
import { generalInquiries } from "../tables/generalInquiries.table";
import { users } from "../tables/users.table";

export const inquiryEventsRelations = relations(inquiryEvents, ({ one }) => ({
  inquiry: one(generalInquiries, {
    fields: [inquiryEvents.inquiryId],
    references: [generalInquiries.id],
  }),
  createdByUser: one(users, {
    fields: [inquiryEvents.createdBy],
    references: [users.id],
  }),
}));
