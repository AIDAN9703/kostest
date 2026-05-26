import type { BookingExpenseCategory } from "@/database/types";

export const EXPENSE_CATEGORY_LABELS: Record<BookingExpenseCategory, string> = {
  OWNER_PAYOUT: "Owner payout",
  CAPTAIN: "Captain",
  FUEL: "Fuel",
  DOCKAGE: "Dockage",
  CREW: "Crew",
  OTHER: "Other",
};

export const EXPENSE_CATEGORIES = Object.keys(
  EXPENSE_CATEGORY_LABELS
) as BookingExpenseCategory[];
