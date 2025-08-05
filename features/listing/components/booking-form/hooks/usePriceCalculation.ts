"use client";

import { useMemo } from 'react';
import { boatPricingTiers } from '@/database/schema';
import { Boat } from '@/shared/types/types';

export interface PriceBreakdown {
  basePrice: number;
  cleaningFee: number;
  totalPrice: number;
  pricePerHour: number;
  duration: number;
}

export const usePriceCalculation = (
  selectedTier: typeof boatPricingTiers.$inferSelect | null,
  boat: any
): PriceBreakdown => {
  return useMemo(() => {
    if (!selectedTier || !boat) {
      return {
        basePrice: 0,
        cleaningFee: boat?.cleaningFee || 0,
        totalPrice: 0,
        pricePerHour: 0,
        duration: 0
      };
    }

    const basePrice = selectedTier.price;
    const cleaningFee = boat.cleaningFee || 0;
    const totalPrice = basePrice + cleaningFee;
    const pricePerHour = selectedTier.hours > 0 ? basePrice / selectedTier.hours : 0;

    return {
      basePrice,
      cleaningFee,
      totalPrice,
      pricePerHour,
      duration: selectedTier.hours
    };
  }, [selectedTier, boat]);
};

// Helper hook for getting active pricing tiers
export const useActivePricingTiers = (boat: Boat) => {
  return useMemo(() => {
    return boat.pricingTiers
      ?.filter((tier: any) => tier.isActive)
      .sort((a: any, b: any) => a.hours - b.hours) || [];
  }, [boat.pricingTiers]);
};
