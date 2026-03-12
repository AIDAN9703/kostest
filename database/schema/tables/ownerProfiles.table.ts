import { pgTable, text, integer, boolean, uuid, timestamp, index, doublePrecision } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/tables";
import { ownerBusinessTypeEnum } from "@/database/schema/enums";

/**
 * Owner Profiles - Profile extension for users who own/list boats
 * 
 * Key design decisions:
 * - userId IS the primary key (not a separate id) - this is a profile extension pattern
 * - References users.id directly - no indirection
 * - Contains owner-specific business/payout info and dashboard stats
 */
export const ownerProfiles = pgTable("owner_profile", {
  // Primary key IS the user ID (profile extension pattern)
  userId: uuid("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  
  // Business Information (for professional charters & tax purposes)
  businessName: text("business_name"),
  businessType: ownerBusinessTypeEnum("business_type").default("INDIVIDUAL").notNull(),
  taxId: text("tax_id"),                           // EIN for companies, SSN for individuals (encrypted)
  
  // Stripe Connect (for receiving payouts)
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectOnboarded: boolean("stripe_connect_onboarded").default(false),
  payoutsEnabled: boolean("payouts_enabled").default(false),
  
  // Admin notes (internal use only)
  adminNotes: text("admin_notes"),
  
  // Verification tracking
  verifiedAt: timestamp("verified_at", { mode: "date", withTimezone: true }),
  verifiedByUserId: uuid("verified_by_user_id").references(() => users.id, { onDelete: "set null" }),
  
  // ============================================
  // OWNER DASHBOARD STATS (updated by system)
  // These are denormalized for fast dashboard queries
  // ============================================
  
  // Fleet stats
  totalBoatsListed: integer("total_boats_listed").default(0),
  activeBoatsCount: integer("active_boats_count").default(0),
  
  // Booking stats
  totalBookings: integer("total_bookings").default(0),
  confirmedBookings: integer("confirmed_bookings").default(0),
  completedBookings: integer("completed_bookings").default(0),
  cancelledBookings: integer("cancelled_bookings").default(0),
  
  // Revenue stats (in cents for precision)
  totalRevenueCents: integer("total_revenue_cents").default(0),
  pendingPayoutCents: integer("pending_payout_cents").default(0),
  lifetimePayoutCents: integer("lifetime_payout_cents").default(0),
  
  // Current period stats (for dashboard widgets)
  currentMonthBookings: integer("current_month_bookings").default(0),
  currentMonthRevenueCents: integer("current_month_revenue_cents").default(0),
  previousMonthBookings: integer("previous_month_bookings").default(0),
  previousMonthRevenueCents: integer("previous_month_revenue_cents").default(0),
  
  // Performance metrics
  averageRating: doublePrecision("average_rating"),
  totalReviews: integer("total_reviews").default(0),
  responseRatePercent: integer("response_rate_percent"),       // 0-100
  responseTimeMinutes: integer("response_time_minutes"),       // Average response time
  bookingAcceptanceRatePercent: integer("booking_acceptance_rate_percent"), // 0-100
  
  // Calendar stats
  upcomingBookingsCount: integer("upcoming_bookings_count").default(0),
  nextBookingDate: timestamp("next_booking_date", { mode: "date", withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  statsUpdatedAt: timestamp("stats_updated_at", { mode: "date", withTimezone: true }), // When stats were last recalculated
}, (table) => [
  index("owner_profile_business_type_idx").on(table.businessType),
  index("owner_profile_stripe_idx").on(table.stripeConnectAccountId),
  index("owner_profile_payouts_idx").on(table.payoutsEnabled),
]);
