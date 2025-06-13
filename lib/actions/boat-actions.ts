'use server';

import { db } from "@/database/db";
import { boats, boatCategoryEnum, boatPricingTiers } from "@/database/schema";
import { Boat, BoatLocation, SearchParamsType, SearchResults } from "@/lib/types/types";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { cache } from "react";
import { parseArrayParam, parseNumberParam, parseStringParam } from "@/lib/utils/search-params-utils";

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
    
    // Extract and process search parameters using standardized parsing
    const exclude = parseStringParam(searchParams.exclude);
      
    if (exclude) {
      conditions.push(sql`${boats.id} != ${exclude}`);
    }
    
    // Handle categories - support multiple categories
    if (searchParams.category && searchParams.category !== 'all') {
      // Use our standardized array parsing
      const categories = parseArrayParam(searchParams.category);
      
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
    
    // Price filtering implementation with proper join pattern
    // Handle price filtering using subquery for proper relational data access
    if (searchParams.minPrice || searchParams.maxPrice) {
      const minPrice = parseNumberParam(searchParams.minPrice);
      const maxPrice = parseNumberParam(searchParams.maxPrice);

      // Add price filter condition using joined data approach
      if (minPrice !== null || maxPrice !== null) {
        // This is the SQL-based approach using a proper EXISTS subquery for pricing tiers
        // This is more efficient than trying to do this with the Drizzle query builder
        if (minPrice !== null) {
          conditions.push(sql`EXISTS (
            SELECT 1 FROM boat_pricing_tier 
            WHERE boat_pricing_tier.boat_id = ${boats.id} 
            AND boat_pricing_tier.is_active = TRUE 
            AND boat_pricing_tier.price >= ${minPrice}
          )`);
        }

        if (maxPrice !== null) {
          conditions.push(sql`EXISTS (
            SELECT 1 FROM boat_pricing_tier 
            WHERE boat_pricing_tier.boat_id = ${boats.id} 
            AND boat_pricing_tier.is_active = TRUE 
            AND boat_pricing_tier.price <= ${maxPrice}
          )`);
        }
      }
    }
    
    // Handle numeric filters using standardized number parsing
    const addNumericFilter = (param: string | string[] | undefined, field: any, operator: typeof gte | typeof lte) => {
      const value = parseNumberParam(param);
      if (value !== null) {
        conditions.push(operator(field, value));
      }
    };
    
    // Apply numeric filters
    addNumericFilter(searchParams.minLength, boats.lengthFt, gte);
    addNumericFilter(searchParams.maxLength, boats.lengthFt, lte);
    addNumericFilter(searchParams.minYear, boats.yearBuilt, gte);
    addNumericFilter(searchParams.maxYear, boats.yearBuilt, lte);
    
    // Handle passenger/capacity filter
    addNumericFilter(searchParams.passengers, boats.capacity, gte);
    
    // Note: cabins and bathrooms filters are skipped as they're not in our schema
    
    // Note: Location filtering is handled via bounding box parameters (ne_lat, sw_lat, etc.)
    // The 'near' parameter is preserved in URL for display purposes but not used for filtering
    
    // Handle bounding box search with standardized number parsing
    const ne_lat = parseNumberParam(searchParams.ne_lat);
    const ne_lng = parseNumberParam(searchParams.ne_lng);
    const sw_lat = parseNumberParam(searchParams.sw_lat);
    const sw_lng = parseNumberParam(searchParams.sw_lng);
    
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
    
    // Handle features with standardized array parsing
    const featuresList = parseArrayParam(searchParams.features);
    
    if (featuresList.length > 0) {
      // More efficient way to handle multiple features with a single condition
      conditions.push(
        sql`${boats.features} @> ARRAY[${sql.join(featuresList.map(f => sql`${f}`), sql`, `)}]::text[]`
      );
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Handle sorting - professional approach for sorting by related table values
    let orderBy: any[] = [desc(boats.featured)];
    
    const sort = parseStringParam(searchParams.sort);
    if (sort) {
      switch (sort) {
        case 'price_asc':
          // Sort by minimum tier price using a correlated subquery
          orderBy = [sql`(
            SELECT MIN(price) 
            FROM boat_pricing_tier 
            WHERE boat_id = ${boats.id} AND is_active = TRUE
          ) ASC NULLS LAST`];
          break;
        case 'price_desc':
          orderBy = [sql`(
            SELECT MIN(price) 
            FROM boat_pricing_tier 
            WHERE boat_id = ${boats.id} AND is_active = TRUE
          ) DESC NULLS LAST`];
          break;
        case 'length_asc': orderBy = [asc(boats.lengthFt)]; break;
        case 'length_desc': orderBy = [desc(boats.lengthFt)]; break;
        case 'newest': orderBy = [desc(boats.createdAt)]; break;
        default: orderBy = [desc(boats.featured), desc(boats.createdAt)]; break;
      }
    }
    
    // Run both queries in parallel for performance
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
    
    // After getting results, fetch pricing tiers for all boats in one query
    const boatIds = results.map(boat => boat.id);
    let pricingTiersMap: Record<string, any[]> = {};

    if (boatIds.length > 0) {
      const pricingTiers = await db
        .select()
        .from(boatPricingTiers)
        .where(inArray(boatPricingTiers.boatId, boatIds));
      
      // Group by boat ID for efficient lookup
      pricingTiersMap = pricingTiers.reduce((acc, tier) => {
        if (!acc[tier.boatId]) {
          acc[tier.boatId] = [];
        }
        acc[tier.boatId].push(tier);
        return acc;
      }, {} as Record<string, any[]>);
    }

    // Add pricing tiers to each boat
    const boatsWithTiers = results.map(boat => ({
      ...boat,
      pricingTiers: pricingTiersMap[boat.id] || []
    }));

    // Type the results properly
    const typedResults = boatsWithTiers as unknown as Boat[];
    
    // Get locations data for map display
    let locations: BoatLocation[] = [];
    
    if (typedResults.length > 0) {
      try {
        const idList = typedResults.map(boat => `'${boat.id}'`).join(',');
        
        const query = `
          SELECT 
            id, 
            name, 
            category, 
            main_image as image_url,
            ST_Y(location::geometry) as latitude, 
            ST_X(location::geometry) as longitude
          FROM boat 
          WHERE id IN (${idList})
            AND location IS NOT NULL
        `;
        
        const locationResults = await db.execute(query);
        
        locations = (locationResults.rows as any[]).map(row => {
          // Find the corresponding boat with pricing data
          const boatWithPricing = typedResults.find(b => b.id === row.id);
          // Get default price from pricing tiers or use 0
          const price = boatWithPricing?.pricingTiers?.length 
            ? boatWithPricing.pricingTiers[0].price
            : 0;
          
          return {
            id: row.id,
            name: row.name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            category: row.category || "OTHER",
            price: price,
            imageUrl: row.image_url
          };
        });
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

 