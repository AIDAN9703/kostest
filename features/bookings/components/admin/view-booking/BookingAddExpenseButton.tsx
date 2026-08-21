"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { BookingExpensesModal } from "@/features/bookings/components/admin/BookingExpensesModal";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";

interface BookingAddExpenseButtonProps {
  bookingId: string;
  totalAmountCents: number | null;
  serviceFeeCents: number | null;
  opsGmvCents: number | null;
  currency: string;
  initialLines: BookingExpenseLine[];
}

/** "Add expense" affordance + the expense-breakdown editor it opens. */
export function BookingAddExpenseButton({
  bookingId,
  totalAmountCents,
  serviceFeeCents,
  opsGmvCents,
  currency,
  initialLines,
}: BookingAddExpenseButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        // Header-pill style: soft fill, no border, gold text — same as Edit page.
        className="shrink-0 gap-1.5 rounded-full border-0 bg-foreground/10 px-4 text-primary-strong hover:bg-foreground/15 hover:text-primary-strong"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add expense
      </Button>
      <BookingExpensesModal
        open={open}
        onOpenChange={setOpen}
        bookingId={bookingId}
        totalAmountCents={totalAmountCents}
        serviceFeeCents={serviceFeeCents}
        opsGmvCents={opsGmvCents}
        currency={currency}
        initialLines={initialLines}
      />
    </>
  );
}
