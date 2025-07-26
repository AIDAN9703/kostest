import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { bookings, users, boats, captains } from "@/database/schema/tables";




export const reviews = pgTable("review", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    type: text("type").notNull(), // BOAT, CAPTAIN, RENTER
    status: text("status").default("PUBLISHED").notNull(),
    
    // Relationships
    bookingId: uuid("booking_id").references(() => bookings.id),
    reviewerId: uuid("reviewer_id").notNull().references(() => users.id),
    reviewedUserId: uuid("reviewed_user_id").references(() => users.id),
    reviewedBoatId: uuid("reviewed_boat_id").references(() => boats.id),
    reviewedCaptainId: uuid("reviewed_captain_id").references(() => captains.id),
    
    // Review Content
    rating: integer("rating").notNull(),
    title: text("title"),
    content: text("content"),
    response: text("response"),
    responseDate: timestamp("response_date", { mode: "date", withTimezone: true }),
    
    // Media
    photos: text("photos").array(),
    
    // Flags
    isVerified: boolean("is_verified").default(false),
    isFeatured: boolean("is_featured").default(false),
    isReported: boolean("is_reported").default(false),
    reportReason: text("report_reason"),
    
    // Metrics
    helpfulCount: integer("helpful_count").default(0),
    unhelpfulCount: integer("unhelpful_count").default(0),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  }, (table) => [
    index("review_type_idx").on(table.type),
    index("review_booking_idx").on(table.bookingId),
    index("review_reviewer_idx").on(table.reviewerId),
    index("review_boat_idx").on(table.reviewedBoatId),
    index("review_captain_idx").on(table.reviewedCaptainId),
    index("review_user_idx").on(table.reviewedUserId)
  ]);