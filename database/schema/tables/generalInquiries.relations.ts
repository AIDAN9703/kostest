import { relations } from 'drizzle-orm';
import { generalInquiries } from './generalInquiries.table';
import { users } from './users.table';

// Relations for generalInquiries table
export const generalInquiriesRelations = relations(generalInquiries, ({ one }) => ({
  assignedToUser: one(users, {
    fields: [generalInquiries.assignedTo],
    references: [users.id],
  }),
}));


