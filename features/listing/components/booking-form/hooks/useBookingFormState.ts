import { useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { parseDateTimeInBoatTimezone, calculateEndDateTime, createDateTimeISO } from "@/shared/utils/date-helpers";
import { Boat, PricingTier } from "@/shared/types/types";
import { calculateBookingPrice, BookingPriceBreakdown } from "@/shared/utils/pricing-utils";
import { getActivePricingTiers } from "./usePriceCalculation";

interface UseBookingFormStateProps {
  form: UseFormReturn<BookingRequest>;
  boat: Boat;
}



interface BookingFormState {
  // Raw watched values
  selectedPricingTierId: string;
  selectedStartDateTime: string;
  needsCaptain: boolean;
  
  // Computed values
  parsedDateTime: {
    date: Date | null;
    time: string; // Always a string (empty if invalid)
  };
  selectedPricingTier: PricingTier | null;
  endDateTime: Date | null;
  activePricingTiers: PricingTier[];
  uiDate: Date | null;
  
  // Price breakdown
  priceBreakdown: BookingPriceBreakdown;
  
  // Validation helpers
  hasValidDateTime: boolean;
  hasValidPricingTier: boolean;
  isFormValid: boolean;

  // Actions for dumb components (optional usage)
  setDate?: (date: Date) => void;
  setTime?: (time: string) => void;
}



/**
 * Comprehensive booking form state management
 * Handles form watching, price calculations, and validation in one place
 */
export function useBookingFormState({ 
  form, 
  boat 
}: UseBookingFormStateProps): BookingFormState {
  
  // Transient date selection before confirming time
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  // Single source of truth for watched values
  const selectedPricingTierId = form.watch("pricingTierId");
  const selectedStartDateTime = form.watch("startDateTime");
  const needsCaptain = form.watch("needsCaptain");
  
  // Memoized parsed datetime in boat's timezone
  const parsedDateTime = useMemo(() => 
    parseDateTimeInBoatTimezone(selectedStartDateTime || "", boat), 
    [selectedStartDateTime, boat]
  );
  
  // Memoized pricing tier lookup
  const selectedPricingTier = useMemo(() => 
    boat.pricingTiers?.find(tier => tier.id === selectedPricingTierId) || null,
    [boat.pricingTiers, selectedPricingTierId]
  );
  
  // Memoized price calculation using universal function
  const priceBreakdown = useMemo(() => {
    if (!selectedPricingTier) {
      return {
        basePrice: 0,
        captainFee: 0,
        cleaningFee: 0,
        subtotal: 0,
        serviceFee: 0,
        taxAmount: 0,
        totalPrice: 0,
      };
    }
    
    // SINGLE SOURCE OF TRUTH for pricing
    return calculateBookingPrice(
      selectedPricingTier.price,
      boat.cleaningFee || 0,
      0 // Captain fee is included in base price
    );
  }, [selectedPricingTier, boat.cleaningFee]);
  


  // Full end Date object derived from startDateTime + duration
  const endDateTime = useMemo(() => {
    if (!selectedStartDateTime || !selectedPricingTier) return null;
    const start = new Date(selectedStartDateTime);
    return calculateEndDateTime(start, selectedPricingTier.hours);
  }, [selectedStartDateTime, selectedPricingTier]);

  // Single, centralized active tiers list
  const activePricingTiers = useMemo(() => getActivePricingTiers(boat), [boat.pricingTiers]);

  // UI date to display in components (pending date if not yet committed)
  const uiDate = useMemo(() => pendingDate || parsedDateTime.date, [pendingDate, parsedDateTime.date]);
  
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

  // Step 1: capture date only; do not set form.value until time chosen
  const setDate = (date: Date) => {
    setPendingDate(date);
  };

  // Step 2: on time selection, combine with pending date or existing date and commit
  const setTime = (time: string) => {
    const dateForCommit = pendingDate || parsedDateTime.date;
    if (!dateForCommit) return;
    // CRITICAL: Pass boat timezone to ensure correct time conversion
    const iso = createDateTimeISO(dateForCommit, time, boat);
    form.setValue("startDateTime", iso, { shouldValidate: true, shouldDirty: true });
    setPendingDate(null);
  };
  
  return {
    // Raw values
    selectedPricingTierId,
    selectedStartDateTime,
    needsCaptain,
    
    // Computed values
    parsedDateTime,
    selectedPricingTier,
    endDateTime,
    activePricingTiers,
    uiDate,
    
    // Price breakdown
    priceBreakdown,
    
    // Validation
    hasValidDateTime,
    hasValidPricingTier,
    isFormValid,
    setDate,
    setTime,
  };
} 