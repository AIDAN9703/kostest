import {
  pgTable,
  uuid,
  bigint,
  boolean,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { addOns } from "./addOns.table";

/**
 * Per-boat add-on offering. A boat opts into a catalog add-on, optionally
 * overrides the price, and can mark it complimentary (free/included).
 */
export const boatAddOns = pgTable(
  "boat_add_on",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    boatId: uuid("boat_id")
      .notNull()
      .references(() => boats.id, { onDelete: "cascade" }),
    addOnId: uuid("add_on_id")
      .notNull()
      .references(() => addOns.id, { onDelete: "cascade" }),
    /** Per-boat price override (USD cents). Null = use catalog default. */
    priceCents: bigint("price_cents", { mode: "number" }),
    /** When true, offered free/included — shown as "Included", never charged. */
    isComplimentary: boolean("is_complimentary").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("boat_add_on_boat_idx").on(table.boatId),
    unique("boat_add_on_unique_idx").on(table.boatId, table.addOnId),
  ]
);
