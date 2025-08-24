import { pgTable, uuid, text, integer, boolean, timestamp, index, unique, doublePrecision } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/tables";

export const promoCodes = pgTable("promo_code", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  code: text("code").notNull(),
  name: text("name"), // Display name for admin (e.g., "Summer 2024 Discount")
  description: text("description"), // Public description shown to users
  
  // Discount Configuration
  type: text("type").notNull(), // 'percentage', 'fixed_amount', 'free_hours'
  value: doublePrecision("value").notNull(), // 10 (for 10%), 50 (for $50), 2 (for 2 hours)
  
  // Conditions
  minimumAmount: doublePrecision("minimum_amount"), // Minimum booking amount required
  applicableBoats: uuid("applicable_boats").array(), // Specific boat IDs (empty = all boats)
  applicableCategories: text("applicable_categories").array(), // Boat categories
  
  // Usage Limits
  usageLimit: integer("usage_limit"), // Total times code can be used (null = unlimited)
  usageCount: integer("usage_count").default(0).notNull(),
  perUserLimit: integer("per_user_limit").default(1), // Times each user can use it
  
  // Validity Period
  validFrom: timestamp("valid_from", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp("valid_until", { mode: "date", withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  
  // Admin Fields
  createdBy: uuid("created_by").references(() => users.id),
  adminNotes: text("admin_notes"), // Internal notes for admin
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // Indexes for performance
  index("promo_code_type_idx").on(table.type),
  index("promo_code_active_idx").on(table.isActive),
  index("promo_code_valid_period_idx").on(table.validFrom, table.validUntil),
  // Ensure code uniqueness (case-insensitive)
  unique("promo_code_unique_idx").on(table.code),
]);
