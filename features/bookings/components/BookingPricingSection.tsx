"use client";

import React from "react";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { SafeBoatData, PricingTier } from "@/features/bookings/booking.types";
import { calculateBookingPrice } from "@/shared/lib/utils/pricing-utils";

interface BookingPricingSectionProps {
  boat: SafeBoatData;
  selectedTier: PricingTier;
  bookingData: {
    needsCaptain: boolean;
    numberOfPassengers: number;
  };
}

export default function BookingPricingSection({ 
  boat, 
  selectedTier, 
  bookingData 
}: BookingPricingSectionProps) {
  // Use universal pricing function for consistency
  const priceBreakdown = calculateBookingPrice(
    selectedTier.price,
    boat.cleaningFee || 0,
    0 // Captain fee included in base price
  );

  const priceItems = [
    {
      label: `${selectedTier.name || 'Charter'} (${selectedTier.hours}h)`,
      amount: priceBreakdown.basePrice,
      description: `Charter package`
    },
    {
      label: "Captain service",
      amount: priceBreakdown.captainFee,
      description: "Professional licensed captain",
      isIncluded: true
    },
    ...(priceBreakdown.cleaningFee > 0 ? [{
      label: "Cleaning fee",
      amount: priceBreakdown.cleaningFee,
      description: "One-time cleaning charge",
      isIncluded: false
    }] : []),
    {
      label: "Card processing fee",
      amount: priceBreakdown.serviceFee,
      description: "Card processing fee (3.5%)",
      isIncluded: false
    }
  ];

  return (
    <div className="space-y-2">
      
      <div className="space-y-3 mb-6">
        {priceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <p className="text-sm font-semibold ml-3">
              {item.isIncluded ? (
                <span className="text-emerald-600">Included</span>
              ) : (
                <span className="text-gray-900">{formatCurrency(item.amount)}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">Total</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(priceBreakdown.totalPrice)}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Final price includes all fees and taxes
        </p>
      </div>

      {boat.instantBook && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-emerald-800">Instant booking</p>
          </div>
          <p className="text-xs text-emerald-700">
            Your card will be charged immediately after confirmation
          </p>
        </div>
      )}
    </div>
  );
}
