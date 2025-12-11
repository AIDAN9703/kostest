import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { boats } from "./boats.table";
import { users } from "./users.table";
import { blockingTypeEnum } from "../enums/availability.enums";

export const boatBlocking = pgTable("boat_blocking", {
  id: uuid("id").primaryKey().defaultRandom(),
  boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  
  // Blocking period
  startTime: timestamp("start_time", { mode: "date", withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { mode: "date", withTimezone: true }).notNull(),
  
  // Blocking details
  blockingType: blockingTypeEnum("blocking_type").notNull(),
  reason: text("reason"),
  
  // Recurring blocking
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: text("recurrence_pattern"), // JSON string for recurrence rules
  
  // Metadata
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }), // User ID who created the blocking
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  
  // Indexes for performance
}, (table) => [
  index("boat_blocking_boat_id_idx").on(table.boatId),
  index("boat_blocking_created_by_idx").on(table.createdBy),
  index("boat_blocking_time_range_idx").on(table.startTime, table.endTime),
  index("boat_blocking_type_idx").on(table.blockingType),
]);  