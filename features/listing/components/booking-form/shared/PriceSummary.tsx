"use client";

import { Boat, PricingTier } from "@/shared/lib/types/types";
import { calculateBookingPrice } from "@/shared/lib/utils/pricing-utils";
import { SERVICE_FEE_PERCENT_DISPLAY } from "@/shared/lib/constants/fees-constants";
import { formatCurrency } from "@/shared/lib/utils/general-utils";

interface PriceSummaryProps {
  boat: Boat;
  selectedPricingTier?: PricingTier | null;
  show?: boolean;
}

export function PriceSummary({ boat, selectedPricingTier, show = true }: PriceSummaryProps) {
  if (!selectedPricingTier || !show) return null;

  const priceBreakdown = calculateBookingPrice(
    selectedPricingTier.price,
    boat.cleaningFee || 0,
    0 // Captain fee included in base price
  );
  const currency = boat.currency ?? "USD";
  const fmt = (amount: number) => formatCurrency(amount, currency, { showCents: true });

  return (
    <div className="pt-2">
      <div className="text-sm font-semibold text-gray-900 mb-2">Price Breakdown</div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{selectedPricingTier.hours}hr Charter</span>
          <span className="font-medium text-gray-900">{fmt(priceBreakdown.basePrice)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Crew Selection</span>
          <span className="font-medium text-emerald-600">Included</span>
        </div>

        {priceBreakdown.cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cleaning Fee</span>
            <span className="font-medium text-gray-900">{fmt(priceBreakdown.cleaningFee)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Card Processing Fee ({SERVICE_FEE_PERCENT_DISPLAY}%)</span>
          <span className="font-medium text-gray-900">{fmt(priceBreakdown.serviceFee)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Amount</span>
            <span className="text-xl font-bold text-primary">{fmt(priceBreakdown.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 