import {
  pgTable,
  integer,
  uuid,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.table";

/**
 * Global app settings — a single-row table (id is always 1).
 *
 * Holds business configuration that admins can change at runtime without a
 * deploy. Rates are stored as integer basis points (350 bps = 3.50%) to avoid
 * floating-point drift. Bookings snapshot the fees they were charged with at
 * creation time (booking_pricing), so changing a setting only affects FUTURE
 * bookings — historical records are never recalculated.
 *
 * Per-entity config (boat deposit, pricing tiers, captain fee) stays on the
 * entity tables; secrets stay in env vars.
 */
export const appSettings = pgTable(
  "app_setting",
  {
    id: integer("id").primaryKey().default(1),
    /** Card processing / service fee applied to booking subtotals, in basis points (350 = 3.5%). */
    serviceFeeBps: integer("service_fee_bps").default(350).notNull(),
    /** How long the checkout hold timer runs on the booking details page. */
    bookingHoldMinutes: integer("booking_hold_minutes").default(10).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [check("app_setting_singleton", sql`${table.id} = 1`)]
);
