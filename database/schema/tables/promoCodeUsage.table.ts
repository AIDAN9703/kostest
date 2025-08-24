import { pgTable, uuid, timestamp, index, doublePrecision } from "drizzle-orm/pg-core";
import { promoCodes } from "./promoCodes.table";
import { bookings, users } from "@/database/schema/tables";

export const promoCodeUsage = pgTable("promo_code_usage", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  
  // Relationships
  promoCodeId: uuid("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id), // Optional for guest bookings
  
  // Usage Details
  discountAmount: doublePrecision("discount_amount").notNull(), // Actual discount applied
  originalAmount: doublePrecision("original_amount").notNull(), // Booking amount before discount
  
  // Timestamp
  usedAt: timestamp("used_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // Indexes for common queries
  index("promo_usage_code_idx").on(table.promoCodeId),
  index("promo_usage_user_idx").on(table.userId),
  index("promo_usage_booking_idx").on(table.bookingId),
  index("promo_usage_date_idx").on(table.usedAt),
]);
