"use client";

import { Boat } from "@/lib/types/types";

interface PriceSummaryProps {
  boat: Boat;
  selectedPricingTier?: any;
  needsCaptain: boolean;
  totalPrice: number;
  isRequest?: boolean;
}

export function PriceSummary({ boat, selectedPricingTier, needsCaptain, totalPrice, isRequest = false }: PriceSummaryProps) {
  if (!selectedPricingTier) {
    return null;
  }

  // Calculate individual fees
  const basePrice = selectedPricingTier.price;
  const captainFee = (needsCaptain || boat.crewRequired) ? 100 : 0;
  const cleaningFee = boat.cleaningFee || 0;
  const subtotal = basePrice + captainFee + cleaningFee;
  const taxAmount = subtotal * 0.08; // 8% tax

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg p-2 border border-navy-200 shadow-sm">
      <div className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-2">💰 Price Breakdown</div>
      
      <div className="space-y-1">
        {/* Base Price */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-700">{selectedPricingTier.hours}hr Charter</span>
          <span className="font-semibold text-navy-900">${basePrice.toFixed(2)}</span>
        </div>
        
        {/* Captain Fee */}
        {(needsCaptain || boat.crewRequired) && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-700">Captain</span>
            <span className="font-semibold text-navy-900">${captainFee.toFixed(2)}</span>
          </div>
        )}
        
        {/* Cleaning Fee */}
        {cleaningFee > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-700">Cleaning Fee</span>
            <span className="font-semibold text-navy-900">${cleaningFee.toFixed(2)}</span>
          </div>
        )}
        
        {/* Tax */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-700">Tax (8%)</span>
          <span className="font-semibold text-navy-900">${taxAmount.toFixed(2)}</span>
        </div>
        
        {/* Request Disclaimer */}
        {isRequest && (
          <div className="bg-blue-50 border border-blue-200 rounded p-1.5 mt-1.5">
            <div className="text-xs text-blue-700 font-medium text-center">
              💳 You won't be charged - this is just a request
            </div>
          </div>
        )}
        
        {/* Total */}
        <div className="border-t border-navy-300/50 pt-1.5 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-navy-900 text-sm">Total</span>
            <span className="text-base font-bold text-coral-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 