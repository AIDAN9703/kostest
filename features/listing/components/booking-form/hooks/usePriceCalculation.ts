"use client";

import { useMemo } from 'react';
import { Boat, PricingTier } from '@/shared/types/types';

interface UsePriceCalculationProps {
  boat: Boat;
  selectedPricingTierId: string;
}

interface PriceBreakdown {
  basePrice: number;
  captainFee: number;
  cleaningFee: number;
  subtotal: number;
  taxAmount: number;
  totalPrice: number;
  selectedPricingTier: PricingTier | null;
}

// Centralized tax rate - move to config later if needed
const TAX_RATE = 0.08; // 8%

export const usePriceCalculation = ({ 
  boat, 
  selectedPricingTierId
}: UsePriceCalculationProps): PriceBreakdown => {
  
  return useMemo(() => {
    // Find the selected pricing tier
    const selectedPricingTier = boat.pricingTiers?.find(
      tier => tier.id === selectedPricingTierId
    ) || null;
    
    // If no pricing tier is selected, return zero values
    if (!selectedPricingTier) {
      return {
        basePrice: 0,
        captainFee: 0,
        cleaningFee: 0,
        subtotal: 0,
        taxAmount: 0,
        totalPrice: 0,
        selectedPricingTier: null,
      };
    }
    
    // Calculate individual fees - captain fee is included in base price
    const basePrice = selectedPricingTier.price;
    const captainFee = 0; // Captain service is included in base price
    const cleaningFee = boat.cleaningFee || 0;
    const subtotal = basePrice + captainFee + cleaningFee;
    const taxAmount = subtotal * TAX_RATE;
    const totalPrice = subtotal + taxAmount;
    
    return {
      basePrice,
      captainFee,
      cleaningFee,
      subtotal,
      taxAmount,
      totalPrice,
      selectedPricingTier,
    };
  }, [boat.pricingTiers, boat.cleaningFee, selectedPricingTierId]);
};

// Helper hook for getting active pricing tiers
export const useActivePricingTiers = (boat: Boat) => {
  return useMemo(() => {
    return boat.pricingTiers
      ?.filter(tier => tier.isActive)
      .sort((a, b) => a.hours - b.hours) || [];
  }, [boat.pricingTiers]);
};
