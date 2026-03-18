"use client";

import { Package } from "lucide-react";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { DraftProposalBooking } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalAddOnsProps {
  bookings: DraftProposalBooking[];
}

export function DraftProposalAddOns({ bookings }: DraftProposalAddOnsProps) {
  const allAddOns = bookings.flatMap((b) =>
    (b.addOns ?? []).map((a) => ({ ...a, boatName: b.boatName }))
  );

  if (allAddOns.length === 0) return null;

  return (
    <div className="space-y-3">
        {allAddOns.map((addOn, i) => (
          <div
            key={`${addOn.boatName}-${addOn.name}-${i}`}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-gray-900">{addOn.name}</p>
                <p className="text-xs text-gray-500">
                  {addOn.boatName}
                  {addOn.quantity > 1 && ` × ${addOn.quantity}`}
                </p>
              </div>
            </div>
            <span className="font-semibold text-primary">
              {formatCentsAsCurrency(dollarsToCents(addOn.total))}
            </span>
          </div>
        ))}
      </div>
  );
}
