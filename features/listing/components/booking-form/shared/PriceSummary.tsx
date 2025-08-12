"use client";

import { Boat } from "@/shared/types/types";
import { calculateServiceFee, TAX_RATE } from "@/shared/constants";

interface PriceSummaryProps {
  boat: Boat;
  selectedPricingTier?: any;
  needsCaptain: boolean;
  totalPrice: number;
  isRequest?: boolean;
  show?: boolean;
}

export function PriceSummary({ boat, selectedPricingTier, totalPrice, show = true }: PriceSummaryProps) {
  if (!selectedPricingTier || !show) return null;

  const basePrice = selectedPricingTier.price;
  const cleaningFee = boat.cleaningFee || 0;
  const subtotal = basePrice + cleaningFee;
  const serviceFee = calculateServiceFee(subtotal);

  return (
    <div className="pt-2">
      <div className="text-sm font-semibold text-gray-900 mb-2">Price Breakdown</div>
      
      <div className="space-y-2">
        {/* Base Price */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{selectedPricingTier.hours}hr Charter</span>
          <span className="font-medium text-gray-900">${basePrice.toFixed(2)}</span>
        </div>
        
        {/* Captain Service - Included */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Crew Selection</span>
          <span className="font-medium text-emerald-600">Included</span>
        </div>
        
        {/* Cleaning Fee */}
        {cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cleaning Fee</span>
            <span className="font-medium text-gray-900">${cleaningFee.toFixed(2)}</span>
          </div>
        )}
        
        {/* Service Fee */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Processing Fee (3.5%)</span>
          <span className="font-medium text-gray-900">${serviceFee.toFixed(2)}</span>
        </div>
        
        
        
        {/* Total */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Amount</span>
            <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 