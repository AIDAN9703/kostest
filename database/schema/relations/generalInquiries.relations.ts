import { relations } from "drizzle-orm";
import { generalInquiries } from "../tables/generalInquiries.table";
import { inquiryEvents } from "../tables/inquiryEvents.table";
import { users } from "../tables/users.table";
import { bookings } from "../tables/bookings.table";

// Relations for generalInquiries table
export const generalInquiriesRelations = relations(
  generalInquiries,
  ({ one, many }) => ({
    assignedToUser: one(users, {
      fields: [generalInquiries.assignedTo],
      references: [users.id],
    }),
    events: many(inquiryEvents),
    booking: one(bookings, {
      fields: [generalInquiries.id],
      references: [bookings.inquiryId],
    }),
  })
);


