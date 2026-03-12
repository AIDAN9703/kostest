import { relations } from 'drizzle-orm';
import { reviews } from '../tables/reviews.table';
import { bookings } from '../tables/bookings.table';
import { users } from '../tables/users.table';
import { boats } from '../tables/boats.table';

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
  reviewedCaptain: one(users, {
    fields: [reviews.reviewedCaptainUserId],
    references: [users.id],
    relationName: 'reviewedCaptainReviews',
  }),
}));

