import { pgEnum } from "drizzle-orm/pg-core";

export const bookingExpenseCategoryEnum = pgEnum("BookingExpenseCategory", [
  "OWNER_PAYOUT",
  "CAPTAIN",
  "FUEL",
  "DOCKAGE",
  "CREW",
  "OTHER",
]);

export const bookingExpenseLineSourceEnum = pgEnum("BookingExpenseLineSource", [
  "MANUAL",
  "BOAT_DEFAULT",
]);
