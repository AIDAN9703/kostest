'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { boats } from '@/database/schema'
import { and, count, eq, desc, or, like } from 'drizzle-orm'

// Helper to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get all boats with pagination, filtering, and sorting
 */
export async function getBoats(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  ownerId?: string;
  active?: boolean;
}) {
  const { 
    page = 1, 
    limit = 10,
    search,
    category,
    ownerId,
    active
  } = options;
  
  const offset = (page - 1) * limit;
  const whereConditions = [];
  
  if (search) {
    const searchConditions = [
      like(boats.name, `%${search}%`),
      like(boats.displayTitle || '', `%${search}%`),
      like(boats.description || '', `%${search}%`)
    ];
    whereConditions.push(or(...searchConditions));
  }
  
  if (category) {
    whereConditions.push(eq(boats.category, category as any));
  }
  
  if (ownerId) {
    if (isValidUUID(ownerId)) {
      whereConditions.push(eq(boats.ownerId, ownerId));
    } else {
      throw new Error(`Invalid owner UUID: ${ownerId}`);
    }
  }
  
  if (active !== undefined) {
    whereConditions.push(eq(boats.active, active));
  }
  
  const boatsData = await db
    .select()
    .from(boats)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(boats.createdAt));
  
  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(boats)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
  
  return {
    boats: boatsData,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

/**
 * Get a single boat by ID
 */
export async function getBoatById(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const boatData = await db
    .select()
    .from(boats)
    .where(eq(boats.id, id))
    .limit(1);
  
  return boatData[0] || null;
}

/**
 * Create a new boat
 */
export async function createBoat(data: any) {
  const result = await db
    .insert(boats)
    .values(data)
    .returning();
  
  revalidatePath('/admin/boats');
  
  return result[0];
}

/**
 * Update an existing boat
 */
export async function updateBoat(id: string, data: any) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const result = await db
    .update(boats)
    .set(data)
    .where(eq(boats.id, id))
    .returning();
  
  revalidatePath(`/admin/boats/${id}`);
  revalidatePath('/admin/boats');
  
  return result[0];
}

/**
 * Delete a boat
 */
export async function deleteBoat(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  await db
    .delete(boats)
    .where(eq(boats.id, id));
  
  revalidatePath('/admin/boats');
  
  return { success: true };
}

/**
 * Toggle boat active status
 */
export async function toggleBoatStatus(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  
  // First get the current status
  const boat = await getBoatById(id);
  if (!boat) {
    throw new Error(`Boat not found: ${id}`);
  }
  
  // Then update with the opposite status
  const result = await db
    .update(boats)
    .set({ active: !boat.active })
    .where(eq(boats.id, id))
    .returning();
  
  revalidatePath(`/admin/boats/${id}`);
  revalidatePath('/admin/boats');
  
  return result[0];
} 