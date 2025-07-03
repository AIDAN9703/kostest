'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { boats, boatPricingTiers, users } from '@/database/schema'
import { and, count, eq, desc, or, like, isNull, inArray, SQL, sql } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import { 
  createBoatSchema, 
  updateBoatSchema, 
  boatFilterSchema,
  pricingTierSchema,
  type CreateBoatInput,
  type UpdateBoatInput,
  type BoatFilterInput,
  type PricingTierInput,
} from "@/lib/validation/admin/boats";
import type { Boat } from '@/lib/types/types'
import { z } from "zod";

// Original Drizzle inferred type for insert
type DrizzleBoatInsert = typeof boats.$inferInsert;

// Custom type for our manipulation payload for boats
type BoatManipulationPayload = Omit<DrizzleBoatInsert, 'location'> & {
  location?: SQL | null; // Allow SQL type specifically for the location field
};

/**
 * Get boat pricing tiers
 */
export async function getBoatPricingTiers(boatId: string) {
  try {
    if (!boatId || !isValidUUID(boatId)) {
      throw new Error(`Invalid UUID format: ${boatId}`);
    }

    const tiers = await db
      .select()
      .from(boatPricingTiers)
      .where(eq(boatPricingTiers.boatId, boatId))
      .orderBy(boatPricingTiers.hours);

    return tiers;
  } catch (error) {
    console.error("Error fetching boat pricing tiers:", error);
    throw error;
  }
}

/**
 * Get all boats with pagination, filtering, and sorting
 */
export async function getAllBoats(options: BoatFilterInput = {}): Promise<{
  boats: Boat[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    // Validate input
    const validatedOptions = boatFilterSchema.parse(options);
    
    const { 
      page = 1, 
      limit = 10,
      search,
      category,
      featured,
      active,
      ownerId
    } = validatedOptions;
    
    const offset = (page - 1) * limit;
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        // Prefix search (index-friendly)
        like(boats.name, `${search}%`),
        like(boats.make || '', `${search}%`),
        like(boats.model || '', `${search}%`),
        like(boats.locationLabel || '', `${search}%`),
        // Fallback full text search
        like(boats.name, `%${search}%`),
        like(boats.description || '', `%${search}%`)
      ));
    }
    
    if (category) whereConditions.push(eq(boats.category, category));
    
    // Handle boolean filters with undefined values
    if (featured !== undefined) whereConditions.push(eq(boats.featured, featured));
    if (active !== undefined) whereConditions.push(eq(boats.active, active));
    
    if (ownerId) whereConditions.push(eq(boats.ownerId, ownerId));
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // OPTIMIZATION: Select only fields needed for listing
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
      // Only essential owner info
      ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      ownerId: boats.ownerId,
    };
    
    // OPTIMIZATION: Use a subquery to get the lowest price tier in one query
    const boatsQuery = db.select({
      ...selectFields,
      // Include lowest pricing tier in main query
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
    
    // Execute both queries concurrently for better performance
    const [boatsData, countResult] = await Promise.all([
      boatsQuery,
      db.select({ value: count() })
        .from(boats)
        .where(whereClause)
    ]);
    
    const totalCount = countResult[0].value;
    
    return {
      boats: boatsData as Boat[],
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in getAllBoats:", error.errors);
      throw new Error("Invalid filter parameters");
    }
    throw error;
  }
}

/**
 * Get a single boat by ID
 */
export async function getBoatById(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  // Fetch basic boat data with owner information
  const [boat] = await db
    .select({
      // All boat fields using getTableColumns
      ...getTableColumns(boats),
      // Owner information
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
  const pricingTiers = await getBoatPricingTiers(id);
  
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
  
  // Return boat with pricing tiers and location coordinates
  return { 
    ...boat, 
    pricingTiers,
    locationCoordinates
  };
}

/**
 * Create pricing tiers for a boat
 */
async function createBoatPricingTiers(boatId: string, tiers: PricingTierInput[]) {
  if (!tiers || tiers.length === 0) return [];
  
  try {
    // Map the tiers to include the boat ID
    const tiersWithBoatId = tiers.map(tier => ({
      ...tier,
      boatId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    // Insert all pricing tiers
    const result = await db.insert(boatPricingTiers)
      .values(tiersWithBoatId)
      .returning();
      
    return result;
  } catch (error) {
    console.error("Error creating boat pricing tiers:", error);
    throw error;
  }
}

/**
 * Update pricing tiers for a boat
 * Only modifies what actually changed - much more efficient!
 */
async function updateBoatPricingTiers(boatId: string, tiers: PricingTierInput[]) {
  try {
    const existingTiers = await getBoatPricingTiers(boatId);
    const incomingTiers = tiers || [];

    const existingTierMap = new Map(existingTiers.map(t => [t.id, t]));
    const incomingTiersWithIds = new Set(incomingTiers.map(t => t.id).filter(Boolean));

    // --- Step 1: Handle incoming tiers (Update or Create) ---
    for (const incomingTier of incomingTiers) {
      // Case A: This is an existing tier that needs to be updated.
      if (incomingTier.id) {
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
      } 
      // Case B: This is a new tier that needs to be created.
      else {
        await db.insert(boatPricingTiers).values({
          ...incomingTier,
          boatId: boatId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // --- Step 2: Handle deletions ---
    // Find any tier that existed before but is not present in the incoming list.
    const tiersToDelete = existingTiers.filter(
      (existing) => !incomingTiersWithIds.has(existing.id)
    );

    for (const tierToDelete of tiersToDelete) {
      try {
        await db.delete(boatPricingTiers).where(eq(boatPricingTiers.id, tierToDelete.id));
      } catch (error: any) {
        if (error?.code === '23503') { // foreign_key_violation
          await db
            .update(boatPricingTiers)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(boatPricingTiers.id, tierToDelete.id));
          console.warn(`Soft-deleted pricing tier ${tierToDelete.id} as it is in use by a booking.`);
        } else {
          console.error(`Failed to delete pricing tier ${tierToDelete.id}:`, error);
          throw error;
        }
      }
    }

    return await getBoatPricingTiers(boatId);
  } catch (error) {
    console.error("Error in updateBoatPricingTiers:", error);
    // Re-throw the original error to preserve the stack trace and specific message
    throw error;
  }
}

/**
 * Create a new boat
 */
export async function createBoat(boatData: CreateBoatInput) {
  try {
    // Validate input data
    const validatedData = createBoatSchema.parse(boatData);

    // Extract pricing tiers and location data from the input
    const { pricingTiers, locationCoordinates, ...boatValues } = validatedData;

    // Prepare insert data for the boat row
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

    // 1) Insert the boat row first
    const [boatRow] = await db.insert(boats).values(insertData as DrizzleBoatInsert).returning();

    let tiersInserted = false;
    try {
      // 2) Insert pricing tiers (if any)
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
      // Compensation: if tier insertion failed, remove the boat to keep data consistent
      if (!tiersInserted) {
        await db.delete(boats).where(eq(boats.id, boatRow.id));
      }
    }

    const newBoat = await getBoatById(boatRow.id);
    revalidatePath('/admin/boats');
    return newBoat;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in createBoat:", error.errors);
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Invalid boat data: ${errorMessages}`);
    }
    console.error("Error creating boat:", error);
    throw error;
  }
}

/**
 * Update an existing boat
 */
export async function updateBoat(id: string, data: UpdateBoatInput) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  try {
    // Validate input data
    const validatedData = updateBoatSchema.parse(data);
    
    // Extract pricing tiers and location data from the input
    const { pricingTiers, locationCoordinates, ...boatValues } = validatedData;
    
    // Process dates properly
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
      await updateBoatPricingTiers(id, pricingTiers);
    }
    
    revalidatePath(`/admin/boats/${id}`);
    revalidatePath('/admin/boats');
    
    return boat;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in updateBoat:", error.errors);
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Invalid boat data: ${errorMessages}`);
    }
    console.error("Error updating boat:", error);
    throw error;
  }
}

/**
 * Delete a boat
 */
export async function deleteBoat(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  try {
    // Delete pricing tiers first
    await db.delete(boatPricingTiers)
      .where(eq(boatPricingTiers.boatId, id));
    
    // Then delete the boat
    await db
      .delete(boats)
      .where(eq(boats.id, id));
    
    revalidatePath('/admin/boats');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting boat:", error);
    throw new Error("Failed to delete boat. Please try again.");
  }
}

/**
 * Toggle the active status of a boat
 */
export async function toggleBoatStatus(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  try {
    // Get the current status
    const [boat] = await db
      .select({ active: boats.active })
      .from(boats)
      .where(eq(boats.id, id))
      .limit(1);
    
    if (!boat) {
      throw new Error("Boat not found");
    }
    
    // Toggle the active status
    await db
      .update(boats)
      .set({ 
        active: !boat.active,
        updatedAt: new Date()
      })
      .where(eq(boats.id, id));
    
    revalidatePath(`/admin/boats/${id}`);
    revalidatePath('/admin/boats');
    
    return { success: true, active: !boat.active };
  } catch (error) {
    console.error("Error toggling boat status:", error);
    throw new Error("Failed to update boat status. Please try again.");
  }
}
// Helper to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 
