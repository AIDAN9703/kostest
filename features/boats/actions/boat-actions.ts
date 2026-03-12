'use server';

import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { boatService } from "../boat.service";

/**
 * Get boat by ID with pricing tiers, owner info, and location coordinates
 * Delegates to boatService for full data (PostGIS, owner join, etc.)
 */
export const getBoatById = cache(async (id: string) => {
  try {
    return await boatService.getBoatById(id);
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

 