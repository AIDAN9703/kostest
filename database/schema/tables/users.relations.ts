import { relations } from 'drizzle-orm';
import { users } from './users.table';
import { boats } from './boats.table';
import { captains } from './captains.table';
import { bookings } from './bookings.table';
import { reviews } from './reviews.table';
import { notifications } from './notifications.table';
import { verifications } from './verifications.table';
import { generalInquiries } from './generalInquiries.table';
import { boatGoogleCalendars } from './boatGoogleCalendars.table';
import { boatBlocking } from './boatBlocking.table';

// Relations for users table
export const usersRelations = relations(users, ({ one, many }) => ({
  ownedBoats: many(boats),
  captainProfile: one(captains, {
    fields: [users.id],
    references: [captains.userId],
  }),
  bookings: many(bookings, {
    relationName: 'userBookings',
  }),
  boatOwnerBookings: many(bookings, {
    relationName: 'boatOwnerBookings',
  }),
  reviewedBookings: many(bookings, {
    relationName: 'reviewedBookings',
  }),
  assignedBookings: many(bookings, {
    relationName: 'assignedBookings',
  }),
  cancelledBookings: many(bookings, {
    relationName: 'cancelledBookings',
  }),
  reviewsAsReviewer: many(reviews, {
    relationName: 'reviewerReviews',
  }),
  reviewsAsReviewed: many(reviews, {
    relationName: 'reviewedUserReviews',
  }),
  notifications: many(notifications),
  verifications: many(verifications),
  assignedInquiries: many(generalInquiries),
  ownedCalendars: many(boatGoogleCalendars),
  createdBlockings: many(boatBlocking),
}));

