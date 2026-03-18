import { pgTable, uuid, text, boolean, timestamp, index, json, integer, unique } from "drizzle-orm/pg-core";
import { users, boats, boatPricingTiers, generalInquiries, bookingGroups } from "@/database/schema/tables";
import { bookingStatusEnum, bookingTypeEnum, bookingSourceEnum } from "@/database/schema/enums";

export const bookings = pgTable(
  "booking",
  {
    // ==========================================================================
    // CORE BOOKING INFORMATION
    // ==========================================================================
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    bookingType: bookingTypeEnum("booking_type").default("EXTERNAL_BOOKING").notNull(),
    bookingStatus: bookingStatusEnum("booking_status").default("PENDING").notNull(),
    source: bookingSourceEnum("source").default("WEBSITE"),

    // ==========================================================================
    // RELATIONSHIPS
    // ==========================================================================
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    boatOwnerId: uuid("boat_owner_id").references(() => users.id, { onDelete: "set null" }),
    boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "restrict" }),
    captainUserId: uuid("captain_user_id").references(() => users.id, { onDelete: "set null" }),
    pricingTierId: uuid("pricing_tier_id").references(() => boatPricingTiers.id, { onDelete: "set null" }),
    bookingGroupId: uuid("booking_group_id").references(() => bookingGroups.id, { onDelete: "set null" }),
    inquiryId: uuid("inquiry_id").references(() => generalInquiries.id, { onDelete: "set null" }),
    assignedAdminId: uuid("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),

    // ==========================================================================
    // CUSTOMER INFORMATION
    // ==========================================================================
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),

    // ==========================================================================
    // BOOKING DETAILS
    // ==========================================================================
    isMultiDay: boolean("is_multi_day").notNull(),
    needsCaptain: boolean("needs_captain").default(false),
    startDateTime: timestamp("start_datetime", { mode: "date", withTimezone: true }).notNull(),
    endDateTime: timestamp("end_datetime", { mode: "date", withTimezone: true }),
    numberOfPassengers: integer("number_of_passengers").notNull(),
    pickupLocation: text("pickup_location"),
    dropoffLocation: text("dropoff_location"),
    specialRequests: text("special_requests"),
    occasionType: text("occasion_type"),
    addOns: json("add_ons"),
    adminNotes: text("admin_notes"),

    // ==========================================================================
    // DRAFT FLOW (sent to customer, awaiting acceptance)
    // ==========================================================================
    publicToken: uuid("public_token"), // Shareable link; set when "sent to customer"
    allowPayment: boolean("allow_payment").default(false).notNull(),
    paymentType: text("payment_type").default("FULL_PAYMENT"), // "DEPOSIT_ONLY" | "FULL_PAYMENT"
    publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { mode: "date", withTimezone: true }),
    acceptedCustomerNote: text("accepted_customer_note"),

    // ==========================================================================
    // CANCELLATION
    // ==========================================================================
    cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    cancelledBy: uuid("cancelled_by").references(() => users.id, { onDelete: "set null" }),

    // ==========================================================================
    // TIMESTAMPS
    // ==========================================================================
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    unique("booking_public_token_unique").on(table.publicToken),
    index("booking_type_idx").on(table.bookingType),
    index("booking_status_idx").on(table.bookingStatus),
    index("booking_source_idx").on(table.source),
    index("booking_user_idx").on(table.userId),
    index("booking_boat_idx").on(table.boatId),
    index("booking_captain_idx").on(table.captainUserId),
    index("booking_group_idx").on(table.bookingGroupId),
    index("booking_public_token_idx").on(table.publicToken),
    index("booking_inquiry_idx").on(table.inquiryId),
    index("booking_datetime_idx").on(table.startDateTime, table.endDateTime),
    index("booking_assigned_admin_idx").on(table.assignedAdminId),
    index("booking_search_customer_idx").on(table.customerName, table.customerEmail),
  ]
);
