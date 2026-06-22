import { relations } from "drizzle-orm";
import { inquiry } from "../tables/inquiry";
import { inquiryEvents } from "../tables/inquiryEvents.table";
import { users } from "../tables/users.table";
import { bookings } from "../tables/bookings.table";
import { boats } from "../tables/boats.table";
import { boatPricingTiers } from "../tables/boatPricingTiers.table";

export const inquiryRelations = relations(inquiry, ({ one, many }) => ({
  assignedToUser: one(users, {
    fields: [inquiry.assignedTo],
    references: [users.id],
  }),
  boat: one(boats, {
    fields: [inquiry.boatId],
    references: [boats.id],
  }),
  pricingTier: one(boatPricingTiers, {
    fields: [inquiry.pricingTierId],
    references: [boatPricingTiers.id],
  }),
  convertedBooking: one(bookings, {
    fields: [inquiry.convertedBookingId],
    references: [bookings.id],
    relationName: "inquiryConvertedBooking",
  }),
  events: many(inquiryEvents),
  /** Booking that references this inquiry via booking.inquiry_id */
  booking: one(bookings, {
    fields: [inquiry.id],
    references: [bookings.inquiryId],
    relationName: "inquirySourceBooking",
  }),
}));
