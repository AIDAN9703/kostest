'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { bookings, boats, users } from '@/database/schema'
import { and, count, eq, desc, or, like, gte, lte, sql } from 'drizzle-orm'

// Helper to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get all bookings with pagination and joined data
 */
export async function getBookings(options: {
  page?: number;
  limit?: number;
} = {}) {
  const { 
    page = 1, 
    limit = 10
  } = options;
  
  const offset = (page - 1) * limit;
  
  // Select booking data with joined boat and user information
  const bookingsData = await db
    .select({
      // Booking fields
      id: bookings.id,
      bookingType: bookings.bookingType,
      bookingStatus: bookings.bookingStatus,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      totalAmount: bookings.totalAmount,
      paymentStatus: bookings.paymentStatus,
      paymentMethod: bookings.paymentMethod,
      needsCaptain: bookings.needsCaptain,
      specialRequests: bookings.specialRequests,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      
      // Boat information
      boatId: bookings.boatId,
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
      
      // User information (if booking has userId)
      userId: bookings.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      userProfileImage: users.profileImage,
    })
    .from(bookings)
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .leftJoin(users, eq(bookings.userId, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(bookings.createdAt));
  
  // Get total count for pagination
  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(bookings);
  
  return {
    bookings: bookingsData,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

/**
 * Get a single booking by ID with full details
 */
export async function getBookingById(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const [bookingData] = await db
    .select({
      // Bookings table fields
      id: bookings.id,
      bookingType: bookings.bookingType,
      bookingStatus: bookings.bookingStatus,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      totalAmount: bookings.totalAmount,
      paymentStatus: bookings.paymentStatus,
      paymentMethod: bookings.paymentMethod,
      needsCaptain: bookings.needsCaptain,
      specialRequests: bookings.specialRequests,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      // Joined fields
      boatId: bookings.boatId,
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
      boatCapacity: boats.capacity,
      userId: bookings.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      userProfileImage: users.profileImage,
    })
    .from(bookings)
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .leftJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.id, id))
    .limit(1);

  return bookingData || null;
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
    .set({
      ...data,
      updatedAt: new Date()
    })
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