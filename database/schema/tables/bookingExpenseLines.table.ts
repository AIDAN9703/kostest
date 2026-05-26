import {
  pgTable,
  uuid,
  bigint,
  text,
  smallint,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import {
  bookingExpenseCategoryEnum,
  bookingExpenseLineSourceEnum,
} from "../enums/bookingExpense.enums";

export const bookingExpenseLines = pgTable(
  "booking_expense_line",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    category: bookingExpenseCategoryEnum("category").notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    label: text("label"),
    sortOrder: smallint("sort_order").default(0).notNull(),
    source: bookingExpenseLineSourceEnum("source").default("MANUAL").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("booking_expense_line_booking_id_idx").on(table.bookingId)]
);
