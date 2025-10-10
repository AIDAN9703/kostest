//drizzle
import { db } from '@/database/db';
import { boats, boatPricingTiers, users } from '@/database/schema';
import { and, count, eq, desc, or, ilike, SQL, sql } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import { type Boat } from '@/database/types';

//types
import { type BoatFilterInput, type CreateBoatInput, type UpdateBoatInput, type PricingTierInput } from '@/features/boats/boat.validation';
import { type PaginatedBoatsResponse } from '@/features/boats/boat.types';
import { z } from 'zod';

// Original Drizzle inferred type for insert
type DrizzleBoatInsert = typeof boats.$inferInsert;

// Custom type for our manipulation payload for boats
type BoatManipulationPayload = Omit<DrizzleBoatInsert, 'location'> & {
  location?: SQL | null; // Allow SQL type specifically for the location field
};

// UUID validation helper
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Boat Service Layer
 * Single source of truth for all boat database operations
 */
export class BoatService {
  /**
   * Get paginated and filtered boats with comprehensive filter support
   */
  async getAllBoats(filters?: BoatFilterInput): Promise<PaginatedBoatsResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    // Build where conditions array
    const whereConditions = [];

    // Text search - case-insensitive search across multiple fields
    if (filters?.search) {
      whereConditions.push(or(
        ilike(boats.name, `%${filters.search}%`),
        ilike(boats.make || '', `%${filters.search}%`),
        ilike(boats.model || '', `%${filters.search}%`),
        ilike(boats.locationLabel || '', `%${filters.search}%`),
        ilike(boats.description || '', `%${filters.search}%`)
      ));
    }

    // Basic filters
    if (filters?.category) whereConditions.push(eq(boats.category, filters.category));
    if (filters?.featured !== undefined) whereConditions.push(eq(boats.featured, filters.featured));
    if (filters?.active !== undefined) whereConditions.push(eq(boats.active, filters.active));
    if (filters?.ownerId) whereConditions.push(eq(boats.ownerId, filters.ownerId));

    // Size/capacity range filters
    if (filters?.minLength) whereConditions.push(sql`${boats.lengthFt} >= ${filters.minLength}`);
    if (filters?.maxLength) whereConditions.push(sql`${boats.lengthFt} <= ${filters.maxLength}`);
    if (filters?.minCapacity) whereConditions.push(sql`${boats.capacity} >= ${filters.minCapacity}`);
    if (filters?.maxCapacity) whereConditions.push(sql`${boats.capacity} <= ${filters.maxCapacity}`);

    // Year built range
    if (filters?.minYear) whereConditions.push(sql`${boats.yearBuilt} >= ${filters.minYear}`);
    if (filters?.maxYear) whereConditions.push(sql`${boats.yearBuilt} <= ${filters.maxYear}`);

    // Accommodations
    if (filters?.minSleeps) whereConditions.push(sql`${boats.sleeps} >= ${filters.minSleeps}`);
    if (filters?.minBathrooms) whereConditions.push(sql`${boats.bathrooms} >= ${filters.minBathrooms}`);

    // Location
    if (filters?.locationLabel) {
      whereConditions.push(ilike(boats.locationLabel || '', `%${filters.locationLabel}%`));
    }

    // Charter options
    if (filters?.crewRequired !== undefined) whereConditions.push(eq(boats.crewRequired, filters.crewRequired));
    if (filters?.instantBook !== undefined) whereConditions.push(eq(boats.instantBook, filters.instantBook));
    if (filters?.dayCharter !== undefined) whereConditions.push(eq(boats.dayCharter, filters.dayCharter));
    if (filters?.termCharter !== undefined) whereConditions.push(eq(boats.termCharter, filters.termCharter));

    // Price range filtering - uses subquery on pricing tiers
    if (filters?.minPrice || filters?.maxPrice) {
      const priceConditions = [];
      if (filters.minPrice) {
        priceConditions.push(sql`
          EXISTS (
            SELECT 1 FROM ${boatPricingTiers} 
            WHERE ${boatPricingTiers.boatId} = ${boats.id} 
            AND ${boatPricingTiers.price} >= ${filters.minPrice}
            AND ${boatPricingTiers.isActive} = true
          )
        `);
      }
      if (filters.maxPrice) {
        priceConditions.push(sql`
          EXISTS (
            SELECT 1 FROM ${boatPricingTiers} 
            WHERE ${boatPricingTiers.boatId} = ${boats.id} 
            AND ${boatPricingTiers.price} <= ${filters.maxPrice}
            AND ${boatPricingTiers.isActive} = true
          )
        `);
      }
      whereConditions.push(...priceConditions);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Select fields for listing (optimized)
    const selectFields = {
      id: boats.id,
      name: boats.name,
      category: boats.category,
      capacity: boats.capacity,
      lengthFt: boats.lengthFt,
      active: boats.active,
      featured: boats.featured,
      mainImage: boats.mainImage,
      createdAt: boats.createdAt,
      ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      ownerId: boats.ownerId,
    };

    // Include lowest pricing tier in main query for performance
    const boatsQuery = db.select({
      ...selectFields,
      basePrice: sql<number>`(
        SELECT MIN(price) 
        FROM ${boatPricingTiers} 
        WHERE ${boatPricingTiers.boatId} = ${boats.id} 
        AND ${boatPricingTiers.isActive} = true
      )`,
    })
      .from(boats)
      .leftJoin(users, eq(boats.ownerId, users.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(boats.createdAt));

    // Execute both queries concurrently
    const [boatsData, countResult] = await Promise.all([
      boatsQuery,
      db.select({ value: count() })
        .from(boats)
        .where(whereClause)
    ]);

    const totalCount = countResult[0].value;

    return {
      boats: boatsData as any[], // Type assertion for complex joined query
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * Get single boat by ID with pricing tiers
   */
  async getBoatById(id: string): Promise<any | null> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Fetch boat with owner information
    const [boat] = await db
      .select({
        ...getTableColumns(boats),
        ownerFirstName: users.firstName,
        ownerLastName: users.lastName,
        ownerEmail: users.email,
        ownerDisplayName: users.displayName,
      })
      .from(boats)
      .leftJoin(users, eq(boats.ownerId, users.id))
      .where(eq(boats.id, id))
      .limit(1);

    if (!boat) {
      return null;
    }

    // Fetch pricing tiers
    const pricingTiers = await this.getBoatPricingTiers(id);

    // Extract coordinates from PostGIS point if available
    let locationCoordinates = null;
    try {
      if (boat.location) {
        const locationResult = await db.execute(sql`
          SELECT 
            ST_Y(location::geometry) as lat, 
            ST_X(location::geometry) as lng
          FROM "boat" 
          WHERE id = ${id}
        `);

        if (locationResult.rows && locationResult.rows.length > 0) {
          const { lat, lng } = locationResult.rows[0] as { lat: string, lng: string };
          locationCoordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
      }
    } catch (error) {
      // Continue without coordinates if there's an error
    }

    return {
      ...boat,
      pricingTiers,
      locationCoordinates
    };
  }

  /**
   * Get boat pricing tiers
   */
  async getBoatPricingTiers(boatId: string) {
    if (!isValidUUID(boatId)) {
      throw new Error(`Invalid UUID format: ${boatId}`);
    }

    const tiers = await db
      .select()
      .from(boatPricingTiers)
      .where(eq(boatPricingTiers.boatId, boatId))
      .orderBy(boatPricingTiers.hours);

    return tiers;
  }

  /**
   * Create a new boat
   */
  async createBoat(boatData: CreateBoatInput): Promise<any> {
    // Extract pricing tiers and location data
    const { pricingTiers, locationCoordinates, ...boatValues } = boatData;

    // Prepare insert data
    const insertData: Partial<BoatManipulationPayload> = {
      ...boatValues,
      insuranceExpiry: boatValues.insuranceExpiry ? new Date(boatValues.insuranceExpiry) : null,
      lastMaintenanceDate: boatValues.lastMaintenanceDate ? new Date(boatValues.lastMaintenanceDate) : null,
      nextMaintenanceDate: boatValues.nextMaintenanceDate ? new Date(boatValues.nextMaintenanceDate) : null,
    };

    // Add PostGIS point if coordinates provided
    if (locationCoordinates?.lat && locationCoordinates?.lng) {
      insertData.location = sql`ST_SetSRID(ST_MakePoint(${locationCoordinates.lng}, ${locationCoordinates.lat}), 4326)`;
    }

    // Insert boat
    const [boatRow] = await db.insert(boats).values(insertData as DrizzleBoatInsert).returning();

    let tiersInserted = false;
    try {
      // Insert pricing tiers if provided
      if (pricingTiers && pricingTiers.length > 0) {
        const tiersWithBoatId = pricingTiers.map((tier) => ({
          ...tier,
          boatId: boatRow.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        await db.insert(boatPricingTiers).values(tiersWithBoatId);
      }
      tiersInserted = true;
    } finally {
      // Rollback: if tier insertion failed, remove the boat to keep data consistent
      if (!tiersInserted) {
        await db.delete(boats).where(eq(boats.id, boatRow.id));
      }
    }

    // Return the complete boat with tiers
    return await this.getBoatById(boatRow.id);
  }

  /**
   * Update an existing boat
   */
  async updateBoat(id: string, data: UpdateBoatInput): Promise<Boat> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Extract pricing tiers and location data
    const { pricingTiers, locationCoordinates, ...boatValues } = data;

    // Prepare update data
    const updateData: Partial<BoatManipulationPayload> = {
      ...boatValues,
      insuranceExpiry: boatValues.insuranceExpiry ? new Date(boatValues.insuranceExpiry) : null,
      lastMaintenanceDate: boatValues.lastMaintenanceDate ? new Date(boatValues.lastMaintenanceDate) : null,
      nextMaintenanceDate: boatValues.nextMaintenanceDate ? new Date(boatValues.nextMaintenanceDate) : null,
      updatedAt: new Date()
    };

    // Handle map coordinates
    if (locationCoordinates?.lat && locationCoordinates?.lng) {
      updateData.location = sql`ST_SetSRID(ST_MakePoint(${locationCoordinates.lng}, ${locationCoordinates.lat}), 4326)`;
    } else if (locationCoordinates === null) {
      updateData.location = null;
    }

    const [boat] = await db
      .update(boats)
      .set(updateData)
      .where(eq(boats.id, id))
      .returning();

    // Update pricing tiers if provided
    if (pricingTiers !== undefined) {
      await this.updateBoatPricingTiers(id, pricingTiers);
    }

    return boat;
  }

  /**
   * Update pricing tiers for a boat
   * Only modifies what actually changed - efficient!
   */
  private async updateBoatPricingTiers(boatId: string, tiers: PricingTierInput[]) {
    const existingTiers = await this.getBoatPricingTiers(boatId);
    const incomingTiers = tiers || [];

    const existingTierMap = new Map(existingTiers.map(t => [t.id, t]));
    const incomingTiersWithIds = new Set(incomingTiers.map(t => t.id).filter(Boolean));

    // Step 1: Handle incoming tiers (Update or Create)
    for (const incomingTier of incomingTiers) {
      if (incomingTier.id) {
        // Update existing tier
        await db
          .update(boatPricingTiers)
          .set({
            hours: incomingTier.hours,
            price: incomingTier.price,
            name: incomingTier.name,
            description: incomingTier.description,
            isActive: incomingTier.isActive,
            isDefault: incomingTier.isDefault,
            updatedAt: new Date(),
          })
          .where(eq(boatPricingTiers.id, incomingTier.id));
      } else {
        // Create new tier
        await db.insert(boatPricingTiers).values({
          ...incomingTier,
          boatId: boatId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Step 2: Handle deletions
    const tiersToDelete = existingTiers.filter(
      (existing) => !incomingTiersWithIds.has(existing.id)
    );

    for (const tierToDelete of tiersToDelete) {
      try {
        await db.delete(boatPricingTiers).where(eq(boatPricingTiers.id, tierToDelete.id));
      } catch (error: any) {
        if (error?.code === '23503') { // foreign_key_violation
          // Soft delete if in use by bookings
          await db
            .update(boatPricingTiers)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(boatPricingTiers.id, tierToDelete.id));
          console.warn(`Soft-deleted pricing tier ${tierToDelete.id} as it is in use by a booking.`);
        } else {
          throw error;
        }
      }
    }

    return await this.getBoatPricingTiers(boatId);
  }

  /**
   * Delete a boat
   */
  async deleteBoat(id: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Delete pricing tiers first
    await db.delete(boatPricingTiers)
      .where(eq(boatPricingTiers.boatId, id));

    // Delete the boat
    await db.delete(boats)
      .where(eq(boats.id, id));
  }

  /**
   * Toggle boat active status
   */
  async toggleBoatActive(id: string): Promise<Boat> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const [boat] = await db
      .update(boats)
      .set({
        active: sql`NOT ${boats.active}`,
        updatedAt: new Date()
      })
      .where(eq(boats.id, id))
      .returning();

    return boat;
  }
}

// Export singleton instance
export const boatService = new BoatService();
