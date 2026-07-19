import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { inboundEmailParseStatusEnum } from "@/database/schema/enums";

/**
 * Raw marketplace notification emails received via the Resend inbound webhook
 * (leads@in.kosyachts.com). Every email is stored before parsing so nothing is
 * ever silently dropped and rows can be reprocessed when parsers improve.
 */
export const inboundEmails = pgTable(
  "inbound_email",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),

    /** RFC 5322 Message-ID — idempotency key for webhook redeliveries. */
    messageId: text("message_id").notNull().unique(),
    fromAddress: text("from_address").notNull(),
    toAddress: text("to_address"),
    subject: text("subject"),
    rawHtml: text("raw_html"),
    rawText: text("raw_text"),

    parseStatus: inboundEmailParseStatusEnum("parse_status")
      .default("PENDING")
      .notNull(),
    /** The deal (INQUIRY booking) this email produced, when parsing succeeded. */
    dealId: uuid("deal_id").references(() => bookings.id, { onDelete: "set null" }),
    error: text("error"),

    receivedAt: timestamp("received_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inbound_email_parse_status_idx").on(table.parseStatus),
  ]
);
