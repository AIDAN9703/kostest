/**
 * Booking Service Layer
 * Single source of truth for all booking database operations
 */

import { db } from '@/database/db';
import { bookings, boats, users, boatPricingTiers } from '@/database/schema';
import { and, count, eq, desc, or, ilike, sql, gte, lte } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';

import { type BookingFilterInput } from './booking.validation';
import { type PaginatedBookingsResponse, type BookingListItem, type BookingDetails } from './booking.types';

// UUID validation helper
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Booking Service Class
 */
export class BookingService {
  /**
   * Get paginated and filtered bookings with comprehensive filter support
   */
  async getAllBookings(filters?: BookingFilterInput): Promise<PaginatedBookingsResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    // Build where conditions array
    const whereConditions = [];

    // Text search - case-insensitive search across multiple fields
    if (filters?.search) {
      whereConditions.push(or(
        ilike(bookings.customerName || '', `%${filters.search}%`),
        ilike(bookings.customerEmail || '', `%${filters.search}%`),
        ilike(bookings.customerPhone || '', `%${filters.search}%`),
        ilike(boats.name || '', `%${filters.search}%`)
      ));
    }

    // Status filters
    if (filters?.bookingStatus) {
      whereConditions.push(eq(bookings.bookingStatus, filters.bookingStatus));
    }
    if (filters?.paymentStatus) {
      whereConditions.push(eq(bookings.paymentStatus, filters.paymentStatus));
    }

    // Type filter
    if (filters?.bookingType) {
      whereConditions.push(eq(bookings.bookingType, filters.bookingType));
    }

    // Date range filters
    if (filters?.dateFrom) {
      whereConditions.push(gte(bookings.startDateTime, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      whereConditions.push(lte(bookings.startDateTime, new Date(filters.dateTo)));
    }

    // Boat filter
    if (filters?.boatId) {
      whereConditions.push(eq(bookings.boatId, filters.boatId));
    }

    // Customer filter
    if (filters?.customerId) {
      whereConditions.push(eq(bookings.userId, filters.customerId));
    }

    // Captain required filter
    if (filters?.needsCaptain !== undefined) {
      whereConditions.push(eq(bookings.needsCaptain, filters.needsCaptain));
    }

    // Amount range filters
    if (filters?.minAmount) {
      whereConditions.push(sql`${bookings.totalAmount} >= ${filters.minAmount}`);
    }
    if (filters?.maxAmount) {
      whereConditions.push(sql`${bookings.totalAmount} <= ${filters.maxAmount}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Select fields for listing (optimized)
    const selectFields = {
      id: bookings.id,
      bookingType: bookings.bookingType,
      bookingStatus: bookings.bookingStatus,
      paymentStatus: bookings.paymentStatus,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      totalAmount: bookings.totalAmount,
      needsCaptain: bookings.needsCaptain,
      createdAt: bookings.createdAt,
      // Joined boat info
      boatId: bookings.boatId,
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
      // Joined user info
      userId: bookings.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      userProfileImage: users.profileImage,
    };

    // Execute query
    const bookingsQuery = db.select(selectFields)
      .from(bookings)
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(bookings.createdAt));

    // Execute both queries concurrently
    const [bookingsData, countResult] = await Promise.all([
      bookingsQuery,
      db.select({ value: count() })
        .from(bookings)
        .leftJoin(boats, eq(bookings.boatId, boats.id))
        .where(whereClause)
    ]);

    const totalCount = countResult[0].value;

    return {
      bookings: bookingsData as BookingListItem[],
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * Get single booking by ID with full details
   */
  async getBookingById(id: string): Promise<BookingDetails | null> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const [booking] = await db
      .select({
        ...getTableColumns(bookings),
        // Boat information
        boatName: boats.name,
        boatCategory: boats.category,
        boatMainImage: boats.mainImage,
        boatCapacity: boats.capacity,
        // User information (customer)
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userProfileImage: users.profileImage,
        // Boat owner information (via subquery)
        boatOwnerFirstName: sql<string | null>`(SELECT first_name FROM ${users} WHERE id = ${bookings.boatOwnerId})`,
        boatOwnerLastName: sql<string | null>`(SELECT last_name FROM ${users} WHERE id = ${bookings.boatOwnerId})`,
        boatOwnerEmail: sql<string | null>`(SELECT email FROM ${users} WHERE id = ${bookings.boatOwnerId})`,
      })
      .from(bookings)
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, id))
      .limit(1);

    return booking as BookingDetails | null;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string): Promise<any> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const [booking] = await db
      .update(bookings)
      .set({ 
        bookingStatus: status as any,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();

    return booking;
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: string): Promise<any> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const [booking] = await db
      .update(bookings)
      .set({ 
        paymentStatus: status as any,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();

    return booking;
  }

  /**
   * Update payment link ID
   */
  async updatePaymentLinkId(id: string, paymentLinkId: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    await db
      .update(bookings)
      .set({ 
        stripePaymentLinkId: paymentLinkId,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id));
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    await db.delete(bookings).where(eq(bookings.id, id));
  }

  /**
   * Get booking statistics
   */
  async getBookingStats() {
    const [stats] = await db
      .select({
        total: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`,
        pending: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'PENDING' THEN 1 END)`,
        confirmed: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'CONFIRMED' THEN 1 END)`,
        completed: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'COMPLETED' THEN 1 END)`,
        cancelled: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'CANCELLED' THEN 1 END)`,
      })
      .from(bookings);

    return stats;
  }
}

// Export singleton instance
export const bookingService = new BookingService();

