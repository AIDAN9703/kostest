import { db } from "@/database/db";
import { boatPricingTiers } from "@/database/schema";
import { Boat, BoatLocation } from "@/shared/lib/types/types";
import { inArray } from "drizzle-orm";

/**
 * Service for formatting search results for different display contexts
 */
export class SearchResultsFormatter {
  
  /**
   * Add pricing tiers to boat results
   */
  static async addPricingTiers(boats: any[]): Promise<Boat[]> {
    if (boats.length === 0) return [];

    const boatIds = boats.map(boat => boat.id);
    let pricingTiersMap: Record<string, any[]> = {};

    // Fetch pricing tiers for all boats in one query
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

    // Add pricing tiers to each boat
    return boats.map(boat => ({
      ...boat,
      pricingTiers: pricingTiersMap[boat.id] || []
    })) as Boat[];
  }

  /**
   * Format boats for map display with location data
   */
  static async formatForMap(boats: Boat[]): Promise<BoatLocation[]> {
    if (boats.length === 0) return [];

    try {
      const idList = boats.map(boat => `'${boat.id}'`).join(',');
      
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
      
      return (locationResults.rows as any[]).map(row => {
        // Find the corresponding boat with pricing data
        const boatWithPricing = boats.find(b => b.id === row.id);
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
      console.error("Error formatting boats for map:", error);
      return [];
    }
  }

  /**
   * Calculate pagination info
   */
  static calculatePagination(totalCount: number, limit: number): { totalPages: number } {
    return {
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * Format complete search results with all necessary data
   */
  static async formatSearchResults(
    boats: any[],
    totalCount: number,
    limit: number
  ): Promise<{
    boats: Boat[];
    totalCount: number;
    totalPages: number;
    locations: BoatLocation[];
  }> {
    // Add pricing tiers to boats
    const boatsWithPricing = await this.addPricingTiers(boats);
    
    // Calculate pagination
    const { totalPages } = this.calculatePagination(totalCount, limit);
    
    // Format for map display
    const locations = await this.formatForMap(boatsWithPricing);

    return {
      boats: boatsWithPricing,
      totalCount,
      totalPages,
      locations
    };
  }

  /**
   * Format category data with counts for filter display
   */
  static formatCategories(categories: {category: string; count: number}[]): {
    category: string;
    count: number;
    displayName: string;
  }[] {
    return categories.map(cat => ({
      ...cat,
      displayName: this.getCategoryDisplayName(cat.category)
    }));
  }

  /**
   * Get user-friendly category display name
   */
  private static getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      'SAILBOAT': 'Sailboats',
      'MOTORBOAT': 'Motorboats', 
      'YACHT': 'Yachts',
      'CATAMARAN': 'Catamarans',
      'PONTOON': 'Pontoon Boats',
      'FISHING_BOAT': 'Fishing Boats',
      'SPEEDBOAT': 'Speedboats',
      'HOUSEBOAT': 'Houseboats',
      'JET_SKI': 'Jet Skis',
      'OTHER': 'Other'
    };
    
    return categoryMap[category] || category;
  }
} 