import { relations } from 'drizzle-orm';
import { reviews } from './reviews.table';
import { bookings } from './bookings.table';
import { users } from './users.table';
import { boats } from './boats.table';
import { captains } from './captains.table';

// Relations for reviews table
export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: 'reviewerReviews',
  }),
  reviewedUser: one(users, {
    fields: [reviews.reviewedUserId],
    references: [users.id],
    relationName: 'reviewedUserReviews',
  }),
  reviewedBoat: one(boats, {
    fields: [reviews.reviewedBoatId],
    references: [boats.id],
  }),
  reviewedCaptain: one(captains, {
    fields: [reviews.reviewedCaptainId],
    references: [captains.id],
  }),
}));

