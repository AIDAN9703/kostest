import { pgTable, uuid, text, boolean, doublePrecision, timestamp, index, json, integer } from "drizzle-orm/pg-core";
import { users, boats, captains, boatPricingTiers } from "@/database/schema/tables";
import { bookingStatusEnum, paymentStatusEnum, bookingTypeEnum } from "@/database/schema/enums";




export const bookings = pgTable("booking", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    bookingType: bookingTypeEnum("booking_type").default("EXTERNAL_BOOKING").notNull(),
    bookingStatus: bookingStatusEnum("booking_status").default("PENDING").notNull(),
    
    // User Information
    userId: uuid("user_id").references(() => users.id), // Renamed from renterId, optional for non-logged in requests
    boatOwnerId: uuid("boat_owner_id").references(() => users.id), // The owner of the boat - NEW!
    boatId: uuid("boat_id").notNull().references(() => boats.id),
    captainId: uuid("captain_id").references(() => captains.id),
    pricingTierId: uuid("pricing_tier_id").references(() => boatPricingTiers.id),
    // promoCodeId removed
    
    // Customer Information (needed even when userId exists)
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    
    // Booking Configuration
    isMultiDay: boolean("is_multi_day").notNull(),
    needsCaptain: boolean("needs_captain").default(false),
    
    // Dates and Times (simplified for day rentals)
    startDateTime: timestamp("start_datetime", { mode: "date", withTimezone: true }).notNull(),
    endDateTime: timestamp("end_datetime", { mode: "date", withTimezone: true }), // Nullable for single-day bookings
    numberOfPassengers: integer("number_of_passengers").notNull(),
    
    // Location Details
    pickupLocation: text("pickup_location"),
    dropoffLocation: text("dropoff_location"),
    
    // Pricing
    captainFee: doublePrecision("captain_fee"),
    cleaningFee: doublePrecision("cleaning_fee"),
    serviceFee: doublePrecision("service_fee"),
    taxAmount: doublePrecision("tax_amount"),
    discountAmount: doublePrecision("discount_amount").default(0), // Promo code discount
    totalAmount: doublePrecision("total_amount").notNull(),
    depositAmount: doublePrecision("deposit_amount"),
    currency: text("currency").default("USD").notNull(),
    
    // Payment Information
    paymentStatus: paymentStatusEnum("payment_status").default("AWAITING_PAYMENT"),
    paymentMethod: text("payment_method"),
    paymentDueDate: timestamp("payment_due_date", { mode: "date" }),
    depositPaid: boolean("deposit_paid").default(false),
    refundAmount: doublePrecision("refund_amount"),
    refundStatus: text("refund_status"),
    
    // Stripe Integration
    stripeCustomerId: text("stripe_customer_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripePaymentLinkId: text("stripe_payment_link_id"),
    
    // Special Requests & Add-ons
    specialRequests: text("special_requests"),
    occasionType: text("occasion_type"),
    addOns: json("add_ons"),
    
    // Status Management (keep minimal admin fields)
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { mode: "date" }),
    reviewNotes: text("review_notes"),
    
    // Cancellation
    cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    cancelledBy: uuid("cancelled_by").references(() => users.id),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }), // When a request or payment link expires
  }, (table) => [
    // Indexes for common queries
    index("booking_type_idx").on(table.bookingType),
    index("booking_status_idx").on(table.bookingStatus),
    index("booking_user_idx").on(table.userId),
    index("booking_boat_idx").on(table.boatId),
    index("booking_captain_idx").on(table.captainId),
    index("booking_datetime_idx").on(table.startDateTime, table.endDateTime),
    // Search-specific indexes
    index("booking_search_customer_idx").on(table.customerName, table.customerEmail),
  ]);