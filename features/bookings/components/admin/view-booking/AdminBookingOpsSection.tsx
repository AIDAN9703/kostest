"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  OpsRowContent,
  type OpsRowContentProps,
} from "@/features/bookings/components/admin/OpsRowContent";
import { BookingExpensesModal } from "@/features/bookings/components/admin/BookingExpensesModal";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";

export interface AdminBookingOpsSectionProps extends OpsRowContentProps {
  expenseLines: BookingExpenseLine[];
  pricingTierId?: string | null;
}

/**
 * Same ops field layout as Admin → All (inline cells + status flags).
 */
export function AdminBookingOpsSection({
  expenseLines,
  pricingTierId: _pricingTierId,
  ...opsProps
}: AdminBookingOpsSectionProps) {
  void _pricingTierId;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card id="ops" className="rounded-2xl border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg">Ops</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              Edit breakdown
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <OpsRowContent {...opsProps} density="comfortable" />
        </CardContent>
      </Card>

      <BookingExpensesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bookingId={opsProps.bookingId}
        totalAmountCents={opsProps.totalAmountCents}
        opsGmvCents={opsProps.opsGmvCents}
        currency={opsProps.currency}
        initialLines={expenseLines}
      />
    </>
  );
}
