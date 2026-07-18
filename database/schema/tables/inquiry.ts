/**
 * @deprecated — absorbed into the `booking` hub (docs/UNIFIED_BOOKINGS_PLAN.md).
 * App code must not read or write this table; it exists only until the
 * backfill is verified, then drop-inquiry-tables.sql removes it (Wave 7).
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
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
  preferredTimeOfDayEnum,
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

    // Fuzzy trip preferences (home page / contact / term charter).
    // Plain DATE + enum, not fake-precision timestamps. A row uses the exact
    // requested* columns OR these — never both.
    preferredDate: date("preferred_date", { mode: "string" }),
    preferredTimeOfDay: preferredTimeOfDayEnum("preferred_time_of_day"),
    /** Term charters: requested length of the charter in days. */
    requestedDurationDays: integer("requested_duration_days"),
    /** Term charters: where they want to go (e.g. "Bahamas"). */
    destination: text("destination"),
    /** Explicit SMS/text-message consent (TCPA) — separate from terms. */
    smsConsent: boolean("sms_consent").default(false).notNull(),

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
    // Per-type integrity: single-table inheritance enforced at the DB level.
    // (No duration check for TERM_CHARTER — "Flexible" duration is legitimate.)
    check(
      "inquiry_boat_request_requires_boat",
      sql`${table.leadType} <> 'BOAT_REQUEST' OR ${table.boatId} IS NOT NULL`
    ),
  ]
);
