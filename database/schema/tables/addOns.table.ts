import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { addOnCategoryEnum } from "../enums/addOn.enums";

/**
 * Add-on catalog — reusable, fleet-wide add-on definitions (e.g. Ice, Cooler,
 * Snorkel gear). Boats opt into these and set their own price via boat_add_on.
 */
export const addOns = pgTable(
  "add_on",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    category: addOnCategoryEnum("category").default("OTHER").notNull(),
    /** Suggested price (USD cents). Per-boat price can override this. */
    defaultPriceCents: bigint("default_price_cents", { mode: "number" }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("add_on_active_idx").on(table.isActive)]
);
