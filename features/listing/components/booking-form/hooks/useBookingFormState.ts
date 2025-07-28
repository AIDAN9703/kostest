import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { parseISODateTime, calculateEndTime } from "@/shared/utils/booking-utils";
import { Boat, PricingTier } from "@/shared/types/types";

interface UseBookingFormStateProps {
  form: UseFormReturn<BookingRequest>;
  boat: Boat;
}

interface PriceBreakdown {
  basePrice: number;
  captainFee: number;
  cleaningFee: number;
  subtotal: number;
  taxAmount: number;
  totalPrice: number;
}

interface BookingFormState {
  // Raw watched values
  selectedPricingTierId: string;
  selectedStartDateTime: string;
  needsCaptain: boolean;
  
  // Computed values
  parsedDateTime: {
    date: Date | null;
    time: string;
  };
  selectedPricingTier: PricingTier | null;
  endTime: string;
  
  // Price breakdown
  priceBreakdown: PriceBreakdown;
  
  // Validation helpers
  hasValidDateTime: boolean;
  hasValidPricingTier: boolean;
  isFormValid: boolean;
}

// Centralized tax rate
const TAX_RATE = 0.08; // 8%

/**
 * Comprehensive booking form state management
 * Handles form watching, price calculations, and validation in one place
 */
export function useBookingFormState({ 
  form, 
  boat 
}: UseBookingFormStateProps): BookingFormState {
  
  // Single source of truth for watched values
  const selectedPricingTierId = form.watch("pricingTierId");
  const selectedStartDateTime = form.watch("startDateTime");
  const needsCaptain = form.watch("needsCaptain");
  
  // Memoized parsed datetime
  const parsedDateTime = useMemo(() => 
    parseISODateTime(selectedStartDateTime || ""), 
    [selectedStartDateTime]
  );
  
  // Memoized pricing tier lookup
  const selectedPricingTier = useMemo(() => 
    boat.pricingTiers?.find(tier => tier.id === selectedPricingTierId) || null,
    [boat.pricingTiers, selectedPricingTierId]
  );
  
  // Memoized price calculation
  const priceBreakdown = useMemo(() => {
    if (!selectedPricingTier) {
      return {
        basePrice: 0,
        captainFee: 0,
        cleaningFee: 0,
        subtotal: 0,
        taxAmount: 0,
        totalPrice: 0,
      };
    }
    
    const basePrice = selectedPricingTier.price;
    const captainFee = 0; // Captain service included in base price
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
    };
  }, [selectedPricingTier, boat.cleaningFee]);
  
  // Memoized end time calculation
  const endTime = useMemo(() => {
    if (!selectedStartDateTime || !selectedPricingTier) return "";
    
    const { time: startTime } = parsedDateTime;
    return startTime ? calculateEndTime(startTime, selectedPricingTier.hours) : "";
  }, [selectedStartDateTime, selectedPricingTier, parsedDateTime]);
  
  // Validation helpers
  const hasValidDateTime = useMemo(() => 
    !!selectedStartDateTime && !!parsedDateTime.date && !!parsedDateTime.time,
    [selectedStartDateTime, parsedDateTime]
  );
  
  const hasValidPricingTier = useMemo(() => 
    !!selectedPricingTierId && !!selectedPricingTier,
    [selectedPricingTierId, selectedPricingTier]
  );
  
  const isFormValid = useMemo(() => 
    form.formState.isValid && hasValidDateTime && hasValidPricingTier,
    [form.formState.isValid, hasValidDateTime, hasValidPricingTier]
  );
  
  return {
    // Raw values
    selectedPricingTierId,
    selectedStartDateTime,
    needsCaptain,
    
    // Computed values
    parsedDateTime,
    selectedPricingTier,
    endTime,
    
    // Price breakdown
    priceBreakdown,
    
    // Validation
    hasValidDateTime,
    hasValidPricingTier,
    isFormValid,
  };
} 