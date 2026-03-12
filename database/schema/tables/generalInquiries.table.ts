import { integer, pgTable, timestamp, uuid, text, boolean, index } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/tables";
import { inquiryStageEnum, inquiryOutcomeEnum } from "@/database/schema/enums";

export const generalInquiries = pgTable("general_inquiry", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    stage: inquiryStageEnum("stage").default("NEEDS_CONTACT").notNull(),
    outcome: inquiryOutcomeEnum("outcome").default("OPEN").notNull(),

    // Customer Information
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    
    // Inquiry Details
    date: timestamp("date", { mode: "date", withTimezone: true }),
    time: text("time"),
    budget: text("budget"),
    guests: integer("guests"),
    message: text("message"),
    
    // Admin fields
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    termsAccepted: boolean("terms_accepted").default(true).notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  }, (table) => [
    index("inquiry_stage_idx").on(table.stage),
    index("inquiry_outcome_idx").on(table.outcome),
    index("inquiry_email_idx").on(table.email),
    index("inquiry_date_idx").on(table.createdAt),
  ]);