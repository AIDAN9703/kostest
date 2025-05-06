'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { bookings } from '@/database/schema'
import { and, count, eq, desc, or, like, gte, lte } from 'drizzle-orm'

// Helper to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get all bookings with pagination, filtering, and sorting
 */
export async function getBookings(options: {
  page?: number;
  limit?: number;
  userId?: string;
  boatId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { 
    page = 1, 
    limit = 10,
    userId,
    boatId,
    status,
    startDate,
    endDate
  } = options;
  
  const offset = (page - 1) * limit;
  const whereConditions = [];
  
  if (userId) {
    if (isValidUUID(userId)) {
      whereConditions.push(eq(bookings.userId, userId));
    } else {
      throw new Error(`Invalid user UUID: ${userId}`);
    }
  }
  
  if (boatId) {
    if (isValidUUID(boatId)) {
      whereConditions.push(eq(bookings.boatId, boatId));
    } else {
      throw new Error(`Invalid boat UUID: ${boatId}`);
    }
  }
  
  if (status) {
    whereConditions.push(eq(bookings.bookingStatus, status as any));
  }
  
  if (startDate) {
    whereConditions.push(gte(bookings.startDate, startDate));
  }
  
  if (endDate) {
    whereConditions.push(lte(bookings.startDate, endDate));
  }
  
  const bookingsData = await db
    .select()
    .from(bookings)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(bookings.createdAt));
  
  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(bookings)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
  
  return {
    bookings: bookingsData,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const bookingData = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  
  return bookingData[0] || null;
}

/**
 * Create a new booking
 */
export async function createBooking(data: any) {
  const result = await db
    .insert(bookings)
    .values(data)
    .returning();
  
  revalidatePath('/admin/bookings');
  
  return result[0];
}

/**
 * Update an existing booking
 */
export async function updateBooking(id: string, data: any) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const result = await db
    .update(bookings)
    .set(data)
    .where(eq(bookings.id, id))
    .returning();
  
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath('/admin/bookings');
  
  return result[0];
}

/**
 * Delete a booking
 */
export async function deleteBooking(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  await db
    .delete(bookings)
    .where(eq(bookings.id, id));
  
  revalidatePath('/admin/bookings');
  
  return { success: true };
}

/**
 * Update booking status
 */
export async function updateBookingStatus(id: string, status: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const result = await db
    .update(bookings)
    .set({ 
      bookingStatus: status as any,
      updatedAt: new Date()
    })
    .where(eq(bookings.id, id))
    .returning();
  
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath('/admin/bookings');
  
  return result[0];
} 