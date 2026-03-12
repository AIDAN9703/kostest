import { pgTable, uuid, text, boolean, integer, timestamp, index, unique, doublePrecision } from "drizzle-orm/pg-core";
import { boats } from "@/database/schema/tables";


export const boatPricingTiers = pgTable("boat_pricing_tier", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
    
    // Pricing Details
    hours: integer("hours").notNull(),
    price: doublePrecision("price").notNull(),
    name: text("name"), // Optional name for the tier (e.g., "Half Day", "Full Day")
    description: text("description"), // Optional description
    isActive: boolean("is_active").default(true).notNull(),
    isDefault: boolean("is_default").default(false),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  }, (table) => {
    return [
      index("boat_pricing_boat_idx").on(table.boatId),
      index("boat_pricing_hours_idx").on(table.hours),
      // Enforce uniqueness of hours per boat instead of a plain index
      unique("boat_pricing_unique_idx").on(table.boatId, table.hours)
    ]
  });  