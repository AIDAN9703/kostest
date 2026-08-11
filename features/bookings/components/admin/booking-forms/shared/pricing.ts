/**
 * Shared pricing math for the booking/proposal forms — one place for the
 * tier lookup and the summary-sidebar preview row (was copy-pasted across
 * the single, group, and proposal forms).
 */

import type { BookingAddOnInput } from "@/features/bookings/booking.types";
import type { BookingSectionData, PricingTierOption } from "../types";

export interface BookingPreviewRow {
  name: string;
  basePrice: number;
  cleaningFee: number;
  addOnsTotal: number;
  total: number;
  depositAmount: number | null;
}

export function groupTiersByBoat(
  pricingTiers: PricingTierOption[]
): Record<string, PricingTierOption[]> {
  return pricingTiers.reduce<Record<string, PricingTierOption[]>>((acc, tier) => {
    if (!acc[tier.boatId]) acc[tier.boatId] = [];
    acc[tier.boatId].push(tier);
    return acc;
  }, {});
}

export function buildSectionPreview(
  section: BookingSectionData,
  lineItems: BookingAddOnInput[],
  pricingTiers: PricingTierOption[],
  fallbackName = "Boat"
): BookingPreviewRow {
  const boat = section.boat;
  const tier = section.pricingTierId
    ? pricingTiers.find((t) => t.id === section.pricingTierId)
    : null;
  const basePrice = section.basePrice > 0 ? section.basePrice : (tier?.price ?? 0);
  const cleaningFee = boat?.cleaningFee ?? 0;
  const addOnsTotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const depositAmount =
    section.depositAmount != null && section.depositAmount >= 0
      ? section.depositAmount
      : (boat?.depositAmount ?? null);
  return {
    name: boat?.name ?? fallbackName,
    basePrice,
    cleaningFee,
    addOnsTotal,
    total: basePrice + cleaningFee + addOnsTotal,
    depositAmount,
  };
}
