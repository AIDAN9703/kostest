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

/** Group form: section 0 uses main customer; section i>0 can use same customer/dates */
export interface GroupSectionData extends BookingSectionData {
  sameUserAsAbove: boolean;
  sameAsFirstBooking: boolean;
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

export function createEmptyGroupSection(): GroupSectionData {
  return {
    ...createEmptyBookingSection(),
    sameUserAsAbove: false,
    sameAsFirstBooking: false,
  };
}
