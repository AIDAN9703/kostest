import { integer, pgTable, timestamp, uuid, text, boolean, index } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/tables";

export const generalInquiries = pgTable("general_inquiry", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    status: text("status").default("PENDING").notNull(), // PENDING, CONTACTED, RESOLVED, ARCHIVED
    
    // Customer Information
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    
    // Inquiry Details
    date: timestamp("date", { mode: "date" }),
    time: text("time"),
    budget: text("budget"),
    guests: integer("guests"),
    message: text("message"),
    
    // Admin fields
    assignedTo: uuid("assigned_to").references(() => users.id),
    notes: text("notes"),
    termsAccepted: boolean("terms_accepted").default(true).notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    contactedAt: timestamp("contacted_at", { mode: "date", withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { mode: "date", withTimezone: true }),
  }, (table) => [
    index("inquiry_status_idx").on(table.status),
    index("inquiry_email_idx").on(table.email),
    index("inquiry_date_idx").on(table.createdAt),
  ]);