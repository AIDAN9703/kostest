import { relations } from 'drizzle-orm';
import { captains } from './captains.table';
import { users } from './users.table';
import { boats } from './boats.table';
import { bookings } from './bookings.table';
import { reviews } from './reviews.table';

// Relations for captains table
export const captainsRelations = relations(captains, ({ one, many }) => ({
  user: one(users, {
    fields: [captains.userId],
    references: [users.id],
  }),
  primaryBoats: many(boats),
  bookings: many(bookings),
  reviews: many(reviews),
}));


