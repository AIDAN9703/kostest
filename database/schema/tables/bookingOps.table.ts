import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";

/**
 * Booking Ops - Operational/admin fields from the legacy Excel workflow.
 * Trimmed set: duration, expense, revenue, balances, crew, checkboxes, agent, source.
 * All fields nullable - existing bookings have no ops data.
 */
export const bookingOps = pgTable("booking_ops", {
  bookingId: uuid("booking_id")
    .notNull()
    .primaryKey()
    .references(() => bookings.id, { onDelete: "cascade" }),

  // Duration (hours, decimal - e.g. 3, 4.5, 2.75)
  durationHours: numeric("duration_hours", { precision: 6, scale: 2 }),

  // Financial (all in cents)
  expenseCents: bigint("expense_cents", { mode: "number" }),
  revenueCents: bigint("revenue_cents", { mode: "number" }),
  balanceOwnerCents: bigint("balance_owner_cents", { mode: "number" }),
  balanceClientCents: bigint("balance_client_cents", { mode: "number" }),
  
  // Crew/captain name (free text)
  crewName: text("crew_name"),

  // Checkboxes
  contractSigned: boolean("contract_signed"),
  captainPaid: boolean("captain_paid"),

  // Commission / agent
  agentCode: text("agent_code"),
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
