"use client";

import { Boat } from "@/lib/types/types";

interface PriceSummaryProps {
  boat: Boat;
  selectedPricingTier?: any;
  needsCaptain: boolean;
  totalPrice: number;
  isRequest?: boolean;
}

export function PriceSummary({ boat, selectedPricingTier, totalPrice, isRequest = false }: PriceSummaryProps) {
  if (!selectedPricingTier) return null;

  const basePrice = selectedPricingTier.price;
  const cleaningFee = boat.cleaningFee || 0;
  const subtotal = basePrice + cleaningFee;
  const taxAmount = subtotal * 0.08; // 8% tax

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm font-semibold text-gray-900 mb-3">Price Breakdown</div>
      
      <div className="space-y-2">
        {/* Base Price */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{selectedPricingTier.hours}hr Charter</span>
          <span className="font-medium text-gray-900">${basePrice.toFixed(2)}</span>
        </div>
        
        {/* Captain Service - Included */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Captain Service</span>
          <span className="font-medium text-emerald-600">Included</span>
        </div>
        
        {/* Cleaning Fee */}
        {cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cleaning Fee</span>
            <span className="font-medium text-gray-900">${cleaningFee.toFixed(2)}</span>
          </div>
        )}
        
        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-medium text-gray-900">${taxAmount.toFixed(2)}</span>
        </div>
        
        {/* Request Disclaimer */}
        {isRequest && (
          <div className="bg-gold-50 border border-gold-200 rounded-lg p-2 mt-2">
            <div className="text-sm text-gold-700 font-medium text-center">
              You won't be charged - this is just a request
            </div>
          </div>
        )}
        
        {/* Total */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Amount</span>
            <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 