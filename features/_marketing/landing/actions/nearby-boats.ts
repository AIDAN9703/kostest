"use server";

import { db } from "@/database/db";
import { boats, boatPricingTiers } from "@/database/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import type { ActionResponse } from "@/shared/lib/types/types";
import type { BoatWithTiers } from "@/features/boats/boat.types";

const DEFAULT_RADIUS_MILES = 50;
const METERS_PER_MILE = 1609.34;

/**
 * Find active boats within a radius of a given lat/lng using PostGIS ST_DWithin.
 * Returns boats sorted by distance (closest first).
 */
export async function getNearbyBoats(
  lat: number,
  lng: number,
  radiusMiles: number = DEFAULT_RADIUS_MILES
): Promise<ActionResponse<BoatWithTiers[]>> {
  try {
    const radiusMeters = radiusMiles * METERS_PER_MILE;

    // Find boats within radius using PostGIS geography cast for accurate distance
    const nearbyBoats = await db
      .select()
      .from(boats)
      .where(
        and(
          eq(boats.active, true),
          sql`${boats.location} IS NOT NULL`,
          sql`ST_DWithin(
            ${boats.location}::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusMeters}
          )`
        )
      )
      .orderBy(
        sql`ST_Distance(
          ${boats.location}::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) ASC`
      )
      .limit(12);

    if (nearbyBoats.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch pricing tiers for the nearby boats
    const boatIds = nearbyBoats.map((boat) => boat.id);
    const tiers = await db
      .select()
      .from(boatPricingTiers)
      .where(
        and(
          eq(boatPricingTiers.isActive, true),
          inArray(boatPricingTiers.boatId, boatIds)
        )
      );

    // Group tiers by boat ID
    const tiersByBoatId = tiers.reduce(
      (acc, tier) => {
        if (!acc[tier.boatId]) acc[tier.boatId] = [];
        acc[tier.boatId].push(tier);
        return acc;
      },
      {} as Record<string, typeof boatPricingTiers.$inferSelect[]>
    );

    // Combine boats with their pricing tiers
    const boatsWithTiers: BoatWithTiers[] = nearbyBoats.map((boat) => ({
      ...boat,
      pricingTiers: tiersByBoatId[boat.id] || [],
    }));

    return { success: true, data: boatsWithTiers };
  } catch (error) {
    console.error("Error fetching nearby boats:", error);
    return { success: false, error: "Failed to fetch nearby boats" };
  }
}
