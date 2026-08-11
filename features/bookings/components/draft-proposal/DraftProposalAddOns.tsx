"use client";

import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { DraftProposalBooking } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalAddOnsProps {
  bookings: DraftProposalBooking[];
}

/** Flat add-on rows — hairlines come from the page's divide-y container. */
export function DraftProposalAddOns({ bookings }: DraftProposalAddOnsProps) {
  const allAddOns = bookings.flatMap((b) =>
    (b.addOns ?? []).map((a) => ({ ...a, boatName: b.boatName }))
  );

  if (allAddOns.length === 0) return null;

  return (
    <>
      {allAddOns.map((addOn, i) => (
        <div
          key={`${addOn.boatName}-${addOn.name}-${i}`}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary">{addOn.name}</p>
            <p className="text-xs text-slate-500">
              Add-on
              {addOn.quantity > 1 && ` × ${addOn.quantity}`}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-primary">
            {formatCentsAsCurrency(dollarsToCents(addOn.total))}
          </span>
        </div>
      ))}
    </>
  );
}
