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
    
    // Extract and process search parameters
    const exclude = getSingleValue(searchParams.exclude);
    if (exclude) {
      conditions.push(sql`${boats.id} != ${exclude}`);
    }
    
    // Handle categories - support multiple categories
    if (searchParams.category && searchParams.category !== 'all') {
      let categories: string[] = [];
      
      if (Array.isArray(searchParams.category)) {
        categories = searchParams.category;
      } else if (typeof searchParams.category === 'string' && searchParams.category.includes(',')) {
        categories = searchParams.category.split(',').filter(Boolean);
      } else if (typeof searchParams.category === 'string') {
        categories = [searchParams.category];
      }
      
      // Filter valid categories and add condition
      if (categories.length > 0) {
        const validCategories = categories.filter(cat => 
          boatCategoryEnum.enumValues.includes(cat as any)
        );
        
        if (validCategories.length === 1) {
          conditions.push(eq(boats.category, validCategories[0] as any));
        } else if (validCategories.length > 1) {
          conditions.push(inArray(boats.category, validCategories as any[]));
        }
      }
    }
    
    // Handle numeric filters - simplify the value extraction
    const addNumericFilter = (param: string | string[] | undefined, field: any, operator: typeof gte | typeof lte) => {
      const value = safeParseFloat(getSingleValue(param));
      if (value !== null) {
        conditions.push(operator(field, value));
      }
    };
    
    // Apply numeric filters
    addNumericFilter(searchParams.minPrice, boats.hourlyRate, gte);
    addNumericFilter(searchParams.maxPrice, boats.hourlyRate, lte);
    addNumericFilter(searchParams.minLength, boats.lengthFt, gte);
    addNumericFilter(searchParams.maxLength, boats.lengthFt, lte);
    addNumericFilter(searchParams.minYear, boats.yearBuilt || 0, gte);
    addNumericFilter(searchParams.maxYear, boats.yearBuilt || 3000, lte);
    addNumericFilter(searchParams.cabins, boats.cabins || 0, gte);
    addNumericFilter(searchParams.bathrooms, boats.bathrooms || 0, gte);
    addNumericFilter(searchParams.passengers, boats.capacity, gte);
    
    // Handle location filter (point-based search)
    const location = getSingleValue(searchParams.location);
    if (location && location.trim()) {
      try {
        const [lat, lng] = location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          const distanceInMeters = 50000; // 50km radius
          conditions.push(
            sql`ST_DWithin(
              ${boats.location}::geography,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
              ${distanceInMeters}
            )`
          );
        }
      } catch (error) {
        console.error("Error parsing location coordinates:", error);
      }
    }
    
    // Handle bounding box search (more efficient than the complex parsing in original)
    const ne_lat = safeParseFloat(getSingleValue(searchParams.ne_lat));
    const ne_lng = safeParseFloat(getSingleValue(searchParams.ne_lng));
    const sw_lat = safeParseFloat(getSingleValue(searchParams.sw_lat));
    const sw_lng = safeParseFloat(getSingleValue(searchParams.sw_lng));
    
    if (ne_lat !== null && ne_lng !== null && sw_lat !== null && sw_lng !== null) {
      if (ne_lat > sw_lat && ne_lng > sw_lng) {
        conditions.push(
          sql`ST_Intersects(
            ${boats.location},
            ST_MakeEnvelope(${sw_lng}, ${sw_lat}, ${ne_lng}, ${ne_lat}, 4326)
          )`
        );
      } else {
        console.warn("Invalid bounding box coordinates", { ne_lat, ne_lng, sw_lat, sw_lng });
      }
    }
    
    // Handle features - simplified but preserving functionality
    let featuresList: string[] = [];
    if (searchParams.features) {
      if (Array.isArray(searchParams.features)) {
        featuresList = searchParams.features;
      } else if (typeof searchParams.features === 'string') {
        featuresList = searchParams.features.split(',').filter(f => f.trim());
      }
      
      if (featuresList.length > 0) {
        // More efficient way to handle multiple features with a single condition
        conditions.push(
          sql`${boats.features} @> ARRAY[${sql.join(featuresList.map(f => sql`${f}`), sql`, `)}]::text[]`
        );
      }
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Determine sort order - simplified but preserving all sort options
    let orderBy: any[] = [desc(boats.featured)];
    
    const sort = getSingleValue(searchParams.sort);
    if (sort) {
      switch (sort) {
        case 'price_asc': orderBy = [asc(boats.hourlyRate)]; break;
        case 'price_desc': orderBy = [desc(boats.hourlyRate)]; break;
        case 'length_asc': orderBy = [asc(boats.lengthFt)]; break;
        case 'length_desc': orderBy = [desc(boats.lengthFt)]; break;
        case 'newest': orderBy = [desc(boats.createdAt)]; break;
        default: orderBy = [desc(boats.featured), desc(boats.createdAt)]; break;
      }
    }
    
    // Run both queries in parallel - preserved for performance
    const [countResult, results] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(boats)
        .where(and(...conditions)),
      
      db.select()
        .from(boats)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset)
    ]);
    
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const typedResults = results as unknown as Boat[];
    
    // Get locations data - preserved for map display
    let locations: BoatLocation[] = [];
    
    if (typedResults.length > 0) {
      try {
        const idList = typedResults.map(boat => `'${boat.id}'`).join(',');
        
        const query = `
          SELECT 
            id, 
            name, 
            category, 
            hourly_rate as price,
            main_image as image_url,
            ST_Y(location::geometry) as latitude, 
            ST_X(location::geometry) as longitude
          FROM boat 
          WHERE id IN (${idList})
            AND location IS NOT NULL
        `;
        
        const locationResults = await db.execute(query);
        
        locations = (locationResults.rows as any[]).map(row => ({
          id: row.id,
          name: row.name,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          category: row.category || "OTHER",
          price: parseFloat(row.price),
          imageUrl: row.image_url
        }));
      } catch (error) {
        console.error("Error fetching boat locations:", error);
      }
    }
    
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