import type {
  BookingExpenseCategory,
  BookingExpenseLineSource,
} from "@/database/types";

export interface BookingExpenseLine {
  id: string | null;
  bookingId: string;
  category: BookingExpenseCategory;
  amountCents: number;
  label: string | null;
  sortOrder: number;
  source: BookingExpenseLineSource;
  /** True when derived from legacy booking_ops.expense_cents (not yet persisted). */
  isSynthetic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingExpenseLineInput {
  id?: string | null;
  category: BookingExpenseCategory;
  amountCents: number;
  label?: string | null;
  sortOrder?: number;
  source?: BookingExpenseLineSource;
}

/** Editable row state in the expenses modal (amount as dollar string). */
export interface BookingExpenseLineDraft {
  key: string;
  category: BookingExpenseCategory;
  amountDollars: string;
  label: string;
  source: BookingExpenseLineSource;
}
