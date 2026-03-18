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
 * Maps to: Expense, GMV, REV, PAID, Balance Owner, Balance Client, Crew, Note,
 * Contract?, Connected?, C PAID? (Client), All Paid?, Sheets?, Agent,
 * Commission Agent, Commission KOS, Source.
 */
export const bookingOps = pgTable("booking_ops", {
  bookingId: uuid("booking_id")
    .notNull()
    .primaryKey()
    .references(() => bookings.id, { onDelete: "cascade" }),

  // Financial (all in cents)
  expenseCents: bigint("expense_cents", { mode: "number" }),
  gmvCents: bigint("gmv_cents", { mode: "number" }),
  revenueCents: bigint("revenue_cents", { mode: "number" }),
  paidCents: bigint("paid_cents", { mode: "number" }),
  balanceOwnerCents: bigint("balance_owner_cents", { mode: "number" }),
  balanceClientCents: bigint("balance_client_cents", { mode: "number" }),

  // Crew/captain name (free text)
  crewName: text("crew_name"),

  // Ops note (separate from booking.adminNotes if needed for ops-specific notes)
  opsNote: text("ops_note"),

  // Checkboxes
  contractSigned: boolean("contract_signed"),
  connected: boolean("connected"),
  clientPaid: boolean("client_paid"),
  captainPaid: boolean("captain_paid"),
  allPaid: boolean("all_paid"),
  sheetsSent: boolean("sheets_sent"),

  // Agent (free text - agent name/code)
  agentCode: text("agent_code"),

  // Commission split (cents)
  commissionAgentCents: bigint("commission_agent_cents", { mode: "number" }),
  commissionKosCents: bigint("commission_kos_cents", { mode: "number" }),
  commissionCents: bigint("commission_cents", { mode: "number" }), // legacy/total

  // Source (Getmyboat, Boatsetter, Direct, Website, etc.)
  sourceOverride: text("source_override"),

  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});
