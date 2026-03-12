"use client";

import { useMemo } from 'react';
import { boatPricingTiers } from '@/database/schema';
import { Boat } from '@/shared/lib/types/types';
import { PricingTier } from '@/shared/lib/types/types';

/**
 * Boat type with pricing tiers - required for price calculations
 */
type BoatWithPricingTiers = Boat & {
  pricingTiers?: PricingTier[] | null;
};

export interface PriceBreakdown {
  basePrice: number;
  cleaningFee: number;
  totalPrice: number;
  pricePerHour: number;
  duration: number;
}

export const usePriceCalculation = (
  selectedTier: typeof boatPricingTiers.$inferSelect | null,
  boat: BoatWithPricingTiers | null
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

// Pure helper for active pricing tiers (filter + sort)
export function getActivePricingTiers(boat: BoatWithPricingTiers): PricingTier[] {
  return (
    boat.pricingTiers
      ?.filter((tier: PricingTier) => tier.isActive)
      .sort((a: PricingTier, b: PricingTier) => a.hours - b.hours) || []
  );
}

// Hook wrapper around the helper for React consumers
export const useActivePricingTiers = (boat: BoatWithPricingTiers) => {
  return useMemo(() => getActivePricingTiers(boat), [boat.pricingTiers]);
};
