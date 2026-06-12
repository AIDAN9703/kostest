"use client";

import { Zap } from "lucide-react";

import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { SafeBoatData, PricingTier } from "@/features/bookings/booking.types";
import { calculateBookingPrice } from "@/shared/lib/utils/pricing-utils";
import { formatRateAsPercent } from "@/features/app-settings/app-settings.config";

export interface PricingSectionAddOn {
  name: string;
  quantity: number;
  /** Line total in dollars (0 when complimentary). */
  total: number;
  isComplimentary?: boolean;
}

interface BookingPricingSectionProps {
  boat: SafeBoatData;
  selectedTier: PricingTier;
  /** Decimal service fee rate (e.g. 0.035) from app settings, passed down from a server component. */
  serviceFeeRate: number;
  showHeading?: boolean;
  addOns?: PricingSectionAddOn[];
}

export default function BookingPricingSection({
  boat,
  selectedTier,
  serviceFeeRate,
  showHeading = true,
  addOns = [],
}: BookingPricingSectionProps) {
  const paidAddOnsTotal = addOns
    .filter((a) => !a.isComplimentary)
    .reduce((sum, a) => sum + a.total, 0);
  // Fold paid add-ons into the fee base so the service fee + total match the server.
  const priceBreakdown = calculateBookingPrice(
    selectedTier.price,
    (boat.cleaningFee || 0) + paidAddOnsTotal,
    0,
    serviceFeeRate,
  );
  const currency = boat.currency ?? "USD";
  const fmt = (amount: number) => formatCurrency(amount, currency);

  const lineItems = [
    {
      label: `${selectedTier.name || "Charter"} · ${selectedTier.hours}h`,
      amount: selectedTier.price,
      included: false,
    },
    {
      label: "Captain",
      amount: priceBreakdown.captainFee,
      included: true,
    },
    ...((boat.cleaningFee || 0) > 0
      ? [
          {
            label: "Cleaning fee",
            amount: boat.cleaningFee || 0,
            included: false,
          },
        ]
      : []),
    ...addOns.map((a) => ({
      label: a.quantity > 1 ? `${a.name} × ${a.quantity}` : a.name,
      amount: a.total,
      included: !!a.isComplimentary,
    })),
    {
      label: `Processing (${formatRateAsPercent(serviceFeeRate)}%)`,
      amount: priceBreakdown.serviceFee,
      included: false,
    },
  ];

  return (
    <div className="space-y-5">
      {showHeading && (
        <h3 className="text-sm font-medium text-foreground">Price details</h3>
      )}

      <ul className="space-y-3">
        {lineItems.map((item) => (
          <li key={item.label} className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
              {item.included ? (
                <span className="text-muted-foreground">Included</span>
              ) : (
                fmt(item.amount)
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between gap-4 pt-1">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
          {fmt(priceBreakdown.totalPrice)}
        </span>
      </div>

      {boat.instantBook && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 shrink-0" />
          Charged immediately after you confirm
        </p>
      )}
    </div>
  );
}

