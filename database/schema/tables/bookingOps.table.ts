import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";

/**
 * Booking Ops - Operational/admin fields from the legacy Excel workflow.
 * Duration, agent, balance_client removed (redundant with booking times, assigned admin, payment section).
 */
export const bookingOps = pgTable("booking_ops", {
  bookingId: uuid("booking_id")
    .notNull()
    .primaryKey()
    .references(() => bookings.id, { onDelete: "cascade" }),

  // Financial (all in cents)
  expenseCents: bigint("expense_cents", { mode: "number" }),
  revenueCents: bigint("revenue_cents", { mode: "number" }),
  balanceOwnerCents: bigint("balance_owner_cents", { mode: "number" }),

  // Crew/captain name (free text)
  crewName: text("crew_name"),

  // Checkboxes
  contractSigned: boolean("contract_signed"),
  captainPaid: boolean("captain_paid"),

  commissionCents: bigint("commission_cents", { mode: "number" }),

  // Source (Getmyboat, Boatsetter, Direct, Website, etc.)
  sourceOverride: text("source_override"),

  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});
