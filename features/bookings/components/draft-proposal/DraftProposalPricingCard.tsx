"use client";

import { Plus } from "lucide-react";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { DraftProposalBooking } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalPricingCardProps {
  bookings: DraftProposalBooking[];
}

export function DraftProposalPricingCard({ bookings }: DraftProposalPricingCardProps) {
  const grandTotalCents = bookings.reduce((sum, b) => sum + b.totalCents, 0);
  const subtotalCents = bookings.reduce((sum, b) => sum + b.totalCents - b.serviceFeeCents, 0);
  const totalServiceFeeCents = bookings.reduce((sum, b) => sum + b.serviceFeeCents, 0);
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
                <span className="text-gray-700">{booking.boatName}</span>
                <span className="font-medium text-gray-900">
                  {formatCentsAsCurrency(booking.basePriceCents)}
                </span>
              </div>
              {booking.cleaningFeeCents > 0 && (
                <div className="flex justify-between pl-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    Cleaning fee
                  </span>
                  <span>{formatCentsAsCurrency(booking.cleaningFeeCents)}</span>
                </div>
              )}
              {(booking.addOns ?? []).map((addOn, i) => (
                <div
                  key={i}
                  className="flex justify-between pl-3 text-sm text-gray-600"
                >
                  <span className="flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    {addOn.name}
                    {addOn.quantity > 1 ? ` × ${addOn.quantity}` : ""}
                  </span>
                  <span>{formatCentsAsCurrency(dollarsToCents(addOn.total))}</span>
                </div>
              ))}
            </div>
          );
        })}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCentsAsCurrency(subtotalCents)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Card processing fee{feePercentLabel}
            </span>
            <span className="font-medium text-gray-900">
              {formatCentsAsCurrency(totalServiceFeeCents)}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-primary">
              {formatCentsAsCurrency(grandTotalCents)}
            </span>
          </div>
        </div>
      </div>
  );
}
