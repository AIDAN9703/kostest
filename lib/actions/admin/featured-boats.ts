"use server";

import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ActionResponse } from "@/lib/types/types";

export interface FeaturedBoatUpdate {
  boatId: string;
  featured: boolean;
  featuredOrder?: number;
  searchRankingScore?: number;
}

/**
 * Get all featured boats with their ordering information
 */
export async function getFeaturedBoatsForAdmin(): Promise<ActionResponse<any[]>> {
  
  try {
    const featuredBoats = await db
      .select({
        id: boats.id,
        name: boats.name,
        displayTitle: boats.displayTitle,
        featured: boats.featured,
        featuredOrder: boats.featuredOrder,
        searchRankingScore: boats.searchRankingScore,
        category: boats.category,
        capacity: boats.capacity,
        lengthFt: boats.lengthFt,
        mainImage: boats.mainImage,
        active: boats.active,
        createdAt: boats.createdAt
      })
      .from(boats)
      .where(eq(boats.featured, true))
      .orderBy(boats.featuredOrder, boats.createdAt);
    
    return {
      success: true,
      data: featuredBoats
    };
  } catch (error) {
    console.error("Error fetching featured boats for admin:", error);
    return {
      success: false,
      error: "Failed to fetch featured boats"
    };
  }
}

/**
 * Update featured boat ordering and ranking
 */
export async function updateFeaturedBoatOrdering(
  updates: FeaturedBoatUpdate[]
): Promise<ActionResponse<void>> {
  "use server";
  
  try {
    // Update each boat individually to handle the ordering
    for (const update of updates) {
      await db
        .update(boats)
        .set({
          featured: update.featured,
          featuredOrder: update.featuredOrder,
          searchRankingScore: update.searchRankingScore,
          updatedAt: new Date()
        })
        .where(eq(boats.id, update.boatId));
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error updating featured boat ordering:", error);
    return {
      success: false,
      error: "Failed to update featured boat ordering"
    };
  }
}

/**
 * Add a boat to featured fleet with specified order
 */
export async function addBoatToFeatured(
  boatId: string,
  featuredOrder: number
): Promise<ActionResponse<void>> {
  "use server";
  
  try {
    await db
      .update(boats)
      .set({
        featured: true,
        featuredOrder: featuredOrder,
        updatedAt: new Date()
      })
      .where(eq(boats.id, boatId));
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error adding boat to featured:", error);
    return {
      success: false,
      error: "Failed to add boat to featured"
    };
  }
}

/**
 * Remove a boat from featured fleet
 */
export async function removeBoatFromFeatured(
  boatId: string
): Promise<ActionResponse<void>> {
  "use server";
  
  try {
    await db
      .update(boats)
      .set({
        featured: false,
        featuredOrder: null,
        updatedAt: new Date()
      })
      .where(eq(boats.id, boatId));
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error removing boat from featured:", error);
    return {
      success: false,
      error: "Failed to remove boat from featured"
    };
  }
}

/**
 * Reorder featured boats (useful for drag-and-drop interfaces)
 */
export async function reorderFeaturedBoats(
  boatIds: string[]
): Promise<ActionResponse<void>> {
  "use server";
  
  try {
    // Update each boat with its new order (index + 1)
    for (let i = 0; i < boatIds.length; i++) {
      await db
        .update(boats)
        .set({
          featuredOrder: i + 1,
          updatedAt: new Date()
        })
        .where(eq(boats.id, boatIds[i]));
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error reordering featured boats:", error);
    return {
      success: false,
      error: "Failed to reorder featured boats"
    };
  }
} 