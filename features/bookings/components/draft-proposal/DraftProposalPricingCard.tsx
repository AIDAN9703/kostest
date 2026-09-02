"use client";

import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { DraftProposalBooking } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalPricingCardProps {
  bookings: DraftProposalBooking[];
}

export function DraftProposalPricingCard({ bookings }: DraftProposalPricingCardProps) {
  const subtotalCents = bookings.reduce((sum, b) => sum + b.totalCents - b.serviceFeeCents, 0);
  const totalServiceFeeCents = bookings.reduce((sum, b) => sum + b.serviceFeeCents, 0);
  // Waived = settled off-card; the fee stays visible (struck) so the math is
  // transparent, and the total drops to the subtotal.
  const feeWaived = bookings.length > 0 && bookings.every((b) => b.serviceFeeWaived);
  const grandTotalCents = feeWaived ? subtotalCents : subtotalCents + totalServiceFeeCents;
  // Derived from this proposal's own pricing snapshot — stays correct even if
  // the global fee setting changes after the proposal was created.
  const feePercentLabel =
    subtotalCents > 0
      ? ` (${String(Number(((totalServiceFeeCents / subtotalCents) * 100).toFixed(2)))}%)`
      : "";

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        return (
          <div key={booking.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{booking.boatName}</span>
              <span className="font-medium text-primary">
                {formatCentsAsCurrency(booking.basePriceCents)}
              </span>
            </div>
            {booking.cleaningFeeCents > 0 && (
              <div className="flex justify-between pl-3 text-sm text-slate-500">
                <span>Cleaning fee</span>
                <span>{formatCentsAsCurrency(booking.cleaningFeeCents)}</span>
              </div>
            )}
            {(booking.addOns ?? []).map((addOn, i) => (
              <div key={i} className="flex justify-between pl-3 text-sm text-slate-500">
                <span>
                  {addOn.name}
                  {addOn.quantity > 1 ? ` × ${addOn.quantity}` : ""}
                </span>
                <span>{formatCentsAsCurrency(dollarsToCents(addOn.total))}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div className="space-y-2 border-t border-border/60 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-primary">
            {formatCentsAsCurrency(subtotalCents)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            Card processing fee{feePercentLabel}
            {feeWaived ? <span className="ml-2 text-xs font-medium text-emerald-700">waived · paid off-card</span> : null}
          </span>
          <span className={feeWaived ? "text-slate-400 line-through" : "font-medium text-primary"}>
            {formatCentsAsCurrency(totalServiceFeeCents)}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-2">
          <span className="text-sm font-semibold text-primary">Total</span>
          <span className="text-lg font-bold text-primary">
            {formatCentsAsCurrency(grandTotalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}
