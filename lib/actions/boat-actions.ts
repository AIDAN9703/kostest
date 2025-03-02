'use server';

import { db } from "@/database/db";
import { boats, boatCategoryEnum } from "@/database/schema";
import { Boat, BoatLocation, SearchParamsType, SearchResults } from "@/types/types";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { cache } from "react";

// Helper function to safely parse a string to number
const safeParseFloat = (value: string | undefined | null): number | null => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Helper function to safely get a single value from a string or string array
const getSingleValue = <T>(value: T | T[] | undefined): T | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Get boats with filtering, sorting, and pagination
 * This is a cached server action for efficient data fetching
 */
export const getBoats = cache(async ({
  searchParams,
  limit = 12,
  page = 1,
}: {
  searchParams: SearchParamsType;
  limit?: number;
  page?: number;
}): Promise<SearchResults> => {
  try {
    // Build query conditions based on search params
    const conditions = [eq(boats.active, true)];
    
    // Category filter - updated to handle multiple categories
    if (searchParams.category && searchParams.category !== 'all') {
      let categories: string[] = [];
      
      if (Array.isArray(searchParams.category)) {
        categories = searchParams.category;
      } else if (typeof searchParams.category === 'string' && searchParams.category.includes(',')) {
        categories = searchParams.category.split(',').filter(Boolean);
      } else if (typeof searchParams.category === 'string') {
        categories = [searchParams.category];
      }
      
      // Filter out invalid categories and create a condition for valid ones
      if (categories.length > 0) {
        const validCategories = categories.filter(cat => 
          boatCategoryEnum.enumValues.includes(cat as any)
        );
        
        if (validCategories.length === 1) {
          // If only one category, use simple equality
          conditions.push(eq(boats.category, validCategories[0] as any));
        } else if (validCategories.length > 1) {
          // If multiple categories, use inArray
          conditions.push(inArray(boats.category, validCategories as any[]));
        }
      }
    }
    
    // Price range filter
    const minPrice = safeParseFloat(getSingleValue(searchParams.minPrice));
    if (minPrice !== null) {
      conditions.push(gte(boats.hourlyRate, minPrice));
    }
    
    const maxPrice = safeParseFloat(getSingleValue(searchParams.maxPrice));
    if (maxPrice !== null) {
      conditions.push(lte(boats.hourlyRate, maxPrice));
    }
    
    // Length range filter
    const minLength = safeParseFloat(getSingleValue(searchParams.minLength));
    if (minLength !== null) {
      conditions.push(gte(boats.lengthFt, minLength));
    }
    
    const maxLength = safeParseFloat(getSingleValue(searchParams.maxLength));
    if (maxLength !== null) {
      conditions.push(lte(boats.lengthFt, maxLength));
    }
    
    // Year built range filter
    const minYear = safeParseFloat(getSingleValue(searchParams.minYear));
    if (minYear !== null) {
      conditions.push(gte(boats.yearBuilt || 0, minYear));
    }
    
    const maxYear = safeParseFloat(getSingleValue(searchParams.maxYear));
    if (maxYear !== null) {
      conditions.push(lte(boats.yearBuilt || 3000, maxYear));
    }
    
    // Cabins filter
    const cabins = safeParseFloat(getSingleValue(searchParams.cabins));
    if (cabins !== null) {
      conditions.push(gte(boats.cabins || 0, cabins));
    }
    
    // Bathrooms filter
    const bathrooms = safeParseFloat(getSingleValue(searchParams.bathrooms));
    if (bathrooms !== null) {
      conditions.push(gte(boats.bathrooms || 0, bathrooms));
    }
    
    // Passengers filter
    const passengers = safeParseFloat(getSingleValue(searchParams.passengers));
    if (passengers !== null) {
      conditions.push(gte(boats.capacity, passengers));
    }
    
    // Location filter
    const location = getSingleValue(searchParams.location);
    if (location && location.trim()) {
      conditions.push(ilike(boats.homePort || '', `%${location}%`));
    }
    
    // Features filter
    let featuresList: string[] = [];
    if (searchParams.features) {
      if (Array.isArray(searchParams.features)) {
        featuresList = searchParams.features;
      } else if (typeof searchParams.features === 'string') {
        featuresList = searchParams.features.split(',').filter(f => f.trim());
      }
      
      // For each feature, add a condition that the boat's features array contains it
      featuresList.forEach(feature => {
        if (feature && feature.trim()) {
          conditions.push(sql`${boats.features} @> ARRAY[${feature}]::text[]`);
        }
      });
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Determine sort order
    let orderBy: any[] = [desc(boats.featured)];
    
    const sort = getSingleValue(searchParams.sort);
    if (sort) {
      switch (sort) {
        case 'price_asc':
          orderBy = [asc(boats.hourlyRate)];
          break;
        case 'price_desc':
          orderBy = [desc(boats.hourlyRate)];
          break;
        case 'length_asc':
          orderBy = [asc(boats.lengthFt)];
          break;
        case 'length_desc':
          orderBy = [desc(boats.lengthFt)];
          break;
        case 'newest':
          orderBy = [desc(boats.createdAt)];
          break;
        default:
          // Default to featured boats first, then newest
          orderBy = [desc(boats.featured), desc(boats.createdAt)];
      }
    }
    
    // Run both queries in parallel for better performance
    const [countResult, results] = await Promise.all([
      // Execute count query for pagination
      db
        .select({ count: sql<number>`count(*)` })
        .from(boats)
        .where(and(...conditions)),
      
      // Execute main query with pagination
      db
        .select()
        .from(boats)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset)
    ]);
    
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Convert to Boat type with proper typing
    const typedResults = results as unknown as Boat[];
    
    // Extract location data for map - using homePort for now as placeholder
    const locations: BoatLocation[] = typedResults
      .filter(boat => boat.homePort) // Filter boats with location info
      .map(boat => {
        // Generate mock coordinates based on boat ID for demo purposes
        // Use a more deterministic approach to generate visible coordinates
        const idNum = parseInt(boat.id.replace(/[^0-9]/g, '').slice(0, 8), 16);
        
        // Create a more spread out distribution of boats around Miami
        // This ensures they're visible on the map and not all stacked on top of each other
        const latOffset = ((idNum % 100) / 100) * 0.2 - 0.1; // Range: -0.1 to 0.1
        const lngOffset = ((idNum % 50) / 50) * 0.3 - 0.15;  // Range: -0.15 to 0.15
        
        const lat = 25.7617 + latOffset; // Miami area with offset
        const lng = -80.1918 + lngOffset;
        
        return {
          id: boat.id,
          name: boat.name,
          latitude: lat,
          longitude: lng,
          category: boat.category,
          price: boat.hourlyRate,
          imageUrl: boat.mainImage || boat.primaryPhotoAbsPath || undefined
        };
      });
    
    return {
      boats: typedResults,
      totalCount,
      totalPages,
      locations
    };
  } catch (error) {
    console.error("Error fetching boats:", error);
    return {
      boats: [],
      totalCount: 0,
      totalPages: 0,
      locations: []
    };
  }
});

/**
 * Get featured boats for homepage or other sections
 */
export const getFeaturedBoats = cache(async (limit: number = 6): Promise<Boat[]> => {
  try {
    const results = await db
      .select()
      .from(boats)
      .where(and(
        eq(boats.active, true),
        eq(boats.featured, true)
      ))
      .orderBy(desc(boats.featuredOrder || 0))
      .limit(limit);
    
    return results as unknown as Boat[];
  } catch (error) {
    console.error("Error fetching featured boats:", error);
    return [];
  }
});

/**
 * Get boat categories with counts
 */
export const getBoatCategories = cache(async (): Promise<{category: string; count: number}[]> => {
  try {
    const results = await db
      .select({
        category: boats.category,
        count: sql<number>`count(*)`
      })
      .from(boats)
      .where(eq(boats.active, true))
      .groupBy(boats.category)
      .orderBy(desc(sql<number>`count(*)`));
    
    return results;
  } catch (error) {
    console.error("Error fetching boat categories:", error);
    return [];
  }
});

/**
 * Get boat by ID
 */
export const getBoatById = cache(async (id: string): Promise<Boat | null> => {
  try {
    const results = await db
      .select()
      .from(boats)
      .where(eq(boats.id, id))
      .limit(1);
    
    return results.length > 0 ? results[0] as unknown as Boat : null;
  } catch (error) {
    console.error(`Error fetching boat with ID ${id}:`, error);
    return null;
  }
});

/**
 * Get similar boats based on category and price range
 */
export const getSimilarBoats = cache(async (
  boatId: string, 
  category: typeof boatCategoryEnum.enumValues[number], 
  price: number, 
  limit: number = 4
): Promise<Boat[]> => {
  try {
    // Price range: 25% below to 25% above the current boat's price
    const minPrice = price * 0.75;
    const maxPrice = price * 1.25;
    
    const results = await db
      .select()
      .from(boats)
      .where(and(
        eq(boats.active, true),
        eq(boats.category, category),
        gte(boats.hourlyRate, minPrice),
        lte(boats.hourlyRate, maxPrice),
        sql`${boats.id} != ${boatId}`
      ))
      .orderBy(desc(boats.featured))
      .limit(limit);
    
    return results as unknown as Boat[];
  } catch (error) {
    console.error("Error fetching similar boats:", error);
    return [];
  }
}); 