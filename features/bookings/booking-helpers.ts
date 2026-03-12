/**
 * Shared helpers for booking operations
 * Centralizes boat + tier fetching to avoid duplication
 */

import { db } from "@/database/db";
import { boats, boatPricingTiers } from "@/database/schema";
import { eq } from "drizzle-orm";

export type BoatForBooking = {
  id: string;
  ownerId: string;
  cleaningFee: number | null;
  depositAmount: number | null;
  crewRequired: boolean;
};

export type TierForBooking = {
  id: string;
  price: number;
  hours: number;
};

/**
 * Fetch boat and pricing tier by IDs - used across createAdminBooking,
 * createDraftBookings, createBookingRequest, createInstantBooking, webhooks
 */
export async function fetchBoatAndTier(
  boatId: string,
  pricingTierId: string | null
): Promise<{
  boat: BoatForBooking;
  tier: TierForBooking | null;
}> {
  const [boat] = await db
    .select({
      id: boats.id,
      ownerId: boats.ownerId,
      cleaningFee: boats.cleaningFee,
      depositAmount: boats.depositAmount,
      crewRequired: boats.crewRequired,
    })
    .from(boats)
    .where(eq(boats.id, boatId))
    .limit(1);

  if (!boat) throw new Error(`Boat not found: ${boatId}`);

  let tier: TierForBooking | null = null;
  if (pricingTierId) {
    const [tierRow] = await db
      .select({
        id: boatPricingTiers.id,
        price: boatPricingTiers.price,
        hours: boatPricingTiers.hours,
      })
      .from(boatPricingTiers)
      .where(eq(boatPricingTiers.id, pricingTierId))
      .limit(1);
    if (tierRow) tier = tierRow;
    else throw new Error(`Pricing tier not found: ${pricingTierId}`);
  }

  return {
    boat: {
      id: boat.id,
      ownerId: boat.ownerId,
      cleaningFee: boat.cleaningFee,
      depositAmount: boat.depositAmount,
      crewRequired: boat.crewRequired ?? false,
    },
    tier,
  };
}
