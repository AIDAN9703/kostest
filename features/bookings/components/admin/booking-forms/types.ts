/**
 * Shared types for admin booking create forms (single & group)
 */

import type { BoatForAdminSelect } from "@/features/boats/boat.types";

export interface PricingTierOption {
  id: string;
  boatId: string;
  hours: number;
  price: number;
  name: string | null;
  isDefault: boolean | null;
}

/** Single booking section - used by both single form and group form */
export interface BookingSectionData {
  boatId: string;
  usePricingTier: boolean;
  pricingTierId: string;
  boat?: BoatForAdminSelect | null;
  basePrice: number;
  depositAmount: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId: string | null;
  startDateTime: string;
  endDateTime: string;
}

export const createEmptyBookingSection = (): BookingSectionData => ({
  boatId: "",
  usePricingTier: true,
  pricingTierId: "",
  boat: undefined,
  basePrice: 0,
  depositAmount: null,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  userId: null,
  startDateTime: "",
  endDateTime: "",
});

