import { pgTable, uuid, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { generalInquiries } from "./generalInquiries.table";
import { users } from "./users.table";
import {
  inquiryEventTypeEnum,
  inquiryStageEnum,
  inquiryOutcomeEnum,
  contactMethodEnum,
} from "@/database/schema/enums";

/**
 * Inquiry Events Table
 *
 * Timeline/audit log for inquiries. Tracks who did what, when.
 * Powers the vertical timeline on the inquiry detail page.
 *
 * Event types:
 * - CREATED: System event when inquiry was submitted
 * - STAGE_CHANGE: Admin changed pipeline stage
 * - OUTCOME_CHANGE: Admin changed outcome (open/won/lost/abandoned)
 * - NOTE: Internal admin note
 * - CONTACT_ATTEMPT: Logged contact (call, email, conversation, etc.)
 */
export const inquiryEvents = pgTable(
  "inquiry_event",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),

    inquiryId: uuid("inquiry_id").notNull().references(() => generalInquiries.id, { onDelete: "cascade" }),

    eventType: inquiryEventTypeEnum("event_type").notNull(),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),

    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),

    // For NOTE, CONTACT_ATTEMPT
    content: text("content"),

    // For STAGE_CHANGE
    previousStage: inquiryStageEnum("previous_stage"),
    newStage: inquiryStageEnum("new_stage"),

    // For OUTCOME_CHANGE
    previousOutcome: inquiryOutcomeEnum("previous_outcome"),
    newOutcome: inquiryOutcomeEnum("new_outcome"),

    // For CONTACT_ATTEMPT
    contactMethod: contactMethodEnum("contact_method"),

    // Flexible extra data
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("inquiry_event_inquiry_idx").on(table.inquiryId),
    index("inquiry_event_created_idx").on(table.createdAt),
    index("inquiry_event_type_idx").on(table.eventType),
  ]
);
