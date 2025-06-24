"use client";

import { useMemo } from 'react';
import { Boat } from '@/lib/types/types';

interface UsePriceCalculationProps {
  boat: Boat;
  selectedPricingTierId?: string;
  needsCaptain?: boolean;
}

interface PriceBreakdown {
  basePrice: number;
  captainFee: number;
  cleaningFee: number;
  subtotal: number;
  taxAmount: number;
  totalPrice: number;
  selectedPricingTier?: any;
}

export const usePriceCalculation = ({ 
  boat, 
  selectedPricingTierId, 
  needsCaptain 
}: UsePriceCalculationProps): PriceBreakdown => {
  
  return useMemo(() => {
    // Find the selected pricing tier
    const selectedPricingTier = boat.pricingTiers?.find(
      tier => tier.id === selectedPricingTierId
    );
    
    // If no pricing tier is selected, return zero values
    if (!selectedPricingTier) {
      return {
        basePrice: 0,
        captainFee: 0,
        cleaningFee: 0,
        subtotal: 0,
        taxAmount: 0,
        totalPrice: 0,
        selectedPricingTier: undefined,
      };
    }
    
    // Calculate individual fees - captain fee is now included in base price
    const basePrice = selectedPricingTier.price;
    const captainFee = 0; // Captain service is included in base price
    const cleaningFee = boat.cleaningFee || 0;
    const subtotal = basePrice + captainFee + cleaningFee;
    const taxAmount = subtotal * 0.08; // 8% tax
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
  }, [boat, selectedPricingTierId]); // Removed needsCaptain dependency since it's no longer used
};

// Helper hook for getting active pricing tiers
export const useActivePricingTiers = (boat: Boat) => {
  return useMemo(() => {
    return boat.pricingTiers
      ?.filter(tier => tier.isActive)
      .sort((a, b) => a.hours - b.hours) || [];
  }, [boat.pricingTiers]);
};
