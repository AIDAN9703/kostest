import { relations } from 'drizzle-orm';
import { notifications } from '../tables/notifications.table';
import { users } from '../tables/users.table';

// Relations for notifications table
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));


