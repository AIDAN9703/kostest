"use client";

import { Zap } from "lucide-react";

import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { SafeBoatData, PricingTier } from "@/features/bookings/booking.types";
import { calculateBookingPrice } from "@/shared/lib/utils/pricing-utils";
import { SERVICE_FEE_PERCENT_DISPLAY } from "@/shared/lib/constants/fees-constants";

interface BookingPricingSectionProps {
  boat: SafeBoatData;
  selectedTier: PricingTier;
  bookingData: {
    needsCaptain: boolean;
    numberOfPassengers: number;
  };
  showHeading?: boolean;
}

export default function BookingPricingSection({
  boat,
  selectedTier,
  showHeading = true,
}: BookingPricingSectionProps) {
  const priceBreakdown = calculateBookingPrice(
    selectedTier.price,
    boat.cleaningFee || 0,
    0,
  );
  const currency = boat.currency ?? "USD";
  const fmt = (amount: number) => formatCurrency(amount, currency);

  const lineItems = [
    {
      label: `${selectedTier.name || "Charter"} · ${selectedTier.hours}h`,
      amount: priceBreakdown.basePrice,
      included: false,
    },
    {
      label: "Captain",
      amount: priceBreakdown.captainFee,
      included: true,
    },
    ...(priceBreakdown.cleaningFee > 0
      ? [
          {
            label: "Cleaning fee",
            amount: priceBreakdown.cleaningFee,
            included: false,
          },
        ]
      : []),
    {
      label: `Processing (${SERVICE_FEE_PERCENT_DISPLAY}%)`,
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

