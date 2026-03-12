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

export interface LineItemInput {
  name: string;
  description?: string | null;
  unitPrice: number;
  quantity: number;
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
  userId: string;
  startDateTime: string;
  endDateTime: string;
}

/** Resolved payload sent to createBookingsAction */
export interface ResolvedBookingPayload {
  boatId: string;
  pricingTierId: string | null;
  basePrice: number;
  depositAmount: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  userId: string | null;
  startDateTime: string;
  endDateTime: string | null;
}

export interface InquiryPrefill {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
  numberOfPassengers?: number;
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
  userId: "",
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
