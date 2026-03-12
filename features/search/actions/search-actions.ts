'use server';

import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { SearchParamsType, SearchResults } from "@/shared/lib/types/types";
import { sql, eq, desc } from "drizzle-orm";
import { cache } from "react";
import { SearchQueryBuilder } from "../services/query-builder";
import { SearchResultsFormatter } from "../services/results-formatter";

/**
 * Search boats with filtering, sorting, and pagination
 * Enhanced with multiple caching layers for optimal performance
 */
export const searchBoats = cache(async ({
  searchParams,
  limit = 12,
  page = 1,
}: {
  searchParams: SearchParamsType;
  limit?: number;
  page?: number;
}): Promise<SearchResults> => {
  try {
    // Build query using the query builder service
    const queryBuilder = SearchQueryBuilder.forSearch(searchParams);
    const conditions = queryBuilder.buildConditions();
    const orderBy = queryBuilder.getOrderBy();
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Run both queries in parallel for performance
    const [countResult, results] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(boats)
        .where(conditions),
      
      db.select()
        .from(boats)
        .where(conditions)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset)
    ]);
    
    const totalCount = countResult[0]?.count || 0;
    
    // Format results using the results formatter service
    return await SearchResultsFormatter.formatSearchResults(
      results,
      totalCount,
      limit
    );
  } catch (error) {
    console.error("Error searching boats:", error);
    return {
      boats: [],
      totalCount: 0,
      totalPages: 0,
      locations: []
    };
  }
});

/**
 * Get boat categories with counts for search filters
 */
export const getSearchCategories = cache(async (): Promise<{
  category: string; 
  count: number;
  displayName: string;
}[]> => {
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
    
    // Format using the results formatter for consistent display
    return SearchResultsFormatter.formatCategories(results);
  } catch (error) {
    console.error("Error fetching search categories:", error);
    return [];
  }
}); 