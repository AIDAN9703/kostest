import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { boatPricingTiers } from "./boatPricingTiers.table";
import { users } from "./users.table";
import {
  inquiryLeadTypeEnum,
  inquiryOutcomeEnum,
  inquirySourceEnum,
  inquiryStageEnum,
} from "@/database/schema/enums";

export const inquiry = pgTable(
  "inquiry",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),

    // Pipeline
    stage: inquiryStageEnum("stage").default("NEEDS_CONTACT").notNull(),
    outcome: inquiryOutcomeEnum("outcome").default("OPEN").notNull(),
    leadType: inquiryLeadTypeEnum("lead_type").default("GENERAL_QUOTE").notNull(),
    source: inquirySourceEnum("source").default("HOME_PAGE").notNull(),

    // Customer
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),

    // Trip preferences (legacy loose fields — keep for backward compat)
    date: timestamp("date", { mode: "date", withTimezone: true }),
    time: text("time"),
    budget: text("budget"),
    guests: integer("guests"),
    message: text("message"),

    // Structured request (boat-specific leads)
    boatId: uuid("boat_id").references(() => boats.id, { onDelete: "set null" }),
    pricingTierId: uuid("pricing_tier_id").references(() => boatPricingTiers.id, {
      onDelete: "set null",
    }),
    requestedStartDateTime: timestamp("requested_start_datetime", {
      mode: "date",
      withTimezone: true,
    }),
    requestedEndDateTime: timestamp("requested_end_datetime", {
      mode: "date",
      withTimezone: true,
    }),
    needsCaptain: boolean("needs_captain"),
    estimatedTotalCents: bigint("estimated_total_cents", { mode: "number" }),
    /** ISO 4217 code for `estimatedTotalCents` (snapshot at submit time). */
    currency: text("currency").default("USD"),
    budgetCents: bigint("budget_cents", { mode: "number" }),

    // Admin
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    termsAccepted: boolean("terms_accepted").default(true).notNull(),

    /** Booking created when this lead was converted (WON). FK enforced in migration. */
    convertedBookingId: uuid("converted_booking_id"),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inquiry_stage_idx").on(table.stage),
    index("inquiry_outcome_idx").on(table.outcome),
    index("inquiry_email_idx").on(table.email),
    index("inquiry_date_idx").on(table.createdAt),
    index("inquiry_lead_type_idx").on(table.leadType),
    index("inquiry_source_idx").on(table.source),
    index("inquiry_boat_idx").on(table.boatId),
    index("inquiry_assigned_to_idx").on(table.assignedTo),
    index("inquiry_converted_booking_idx").on(table.convertedBookingId),
  ]
);
