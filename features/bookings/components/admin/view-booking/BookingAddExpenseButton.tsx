"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { BookingExpensesModal } from "@/features/bookings/components/admin/BookingExpensesModal";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";

interface BookingAddExpenseButtonProps {
  bookingId: string;
  totalAmountCents: number | null;
  opsGmvCents: number | null;
  currency: string;
  initialLines: BookingExpenseLine[];
}

/** "Add expense" affordance + the expense-breakdown editor it opens. */
export function BookingAddExpenseButton({
  bookingId,
  totalAmountCents,
  opsGmvCents,
  currency,
  initialLines,
}: BookingAddExpenseButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add expense
      </Button>
      <BookingExpensesModal
        open={open}
        onOpenChange={setOpen}
        bookingId={bookingId}
        totalAmountCents={totalAmountCents}
        opsGmvCents={opsGmvCents}
        currency={currency}
        initialLines={initialLines}
      />
    </>
  );
}
