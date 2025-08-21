'use server';

import { db } from "@/database/db";
import { boats, boatPricingTiers } from "@/database/schema";
import { Boat } from "@/shared/types/types";
import { eq } from "drizzle-orm";
import { cache } from "react";

/**
 * Get boat by ID with pricing tiers
 * This is boat-specific functionality that belongs in the boats feature
 */
export const getBoatById = cache(async (id: string): Promise<Boat | null> => {
  try {
    const [boatResult, pricingTiers] = await Promise.all([
      db.select().from(boats).where(eq(boats.id, id)).limit(1),
      db.select().from(boatPricingTiers).where(eq(boatPricingTiers.boatId, id))
    ]);

    if (!boatResult.length) {
      return null;
    }

    return {
      ...boatResult[0],
      pricingTiers: pricingTiers
    } as Boat;
  } catch (error) {
    console.error(`Error fetching boat with ID ${id}:`, error);
    return null;
  }
});

/**
 * Get all boat IDs for static generation
 * Optimized query that only fetches IDs to minimize build-time overhead
 */
export async function getAllBoatIds(): Promise<string[]> {
  "use server";
  
  try {
    
    // Only select active boats for static generation
    // This prevents generating pages for inactive/draft boats
    const boatIds = await db
      .select({ id: boats.id })
      .from(boats)
      .where(eq(boats.active, true));
    
    const ids = boatIds.map(boat => boat.id);
    
    return ids;
  } catch (error) {
    console.error('❌ Error fetching boat IDs for static generation:', error);
    // Return empty array to prevent build failure
    // Static generation will fall back to on-demand ISR
    return [];
  }
}

 