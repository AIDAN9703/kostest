import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { bookingService } from '@/features/bookings/booking.service';
import { apiSuccess, apiError } from '@/shared/lib/utils/api-helpers';

/**
 * Customer-facing API endpoint to fetch booking details
 * GET /api/bookings/[id]
 * 
 * Allows authenticated users to fetch their own bookings.
 * Also allows unauthenticated access if the booking was just paid (for payment success page).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    // Get booking details
    const booking = await bookingService.getBookingById(id);
    
    if (!booking) {
      return apiError("Booking not found", 404);
    }

    // If user is authenticated, verify they own the booking
    if (session?.user) {
      const userOwnsBooking = 
        booking.userId === session.user.id ||
        booking.userEmail === session.user.email ||
        booking.customerEmail === session.user.email;

      if (!userOwnsBooking && session.user.role !== 'ADMIN') {
        return apiError("Unauthorized: You can only view your own bookings", 403);
      }
    } else {
      // For unauthenticated access (payment success page), allow if:
      // 1. Booking was just paid (payment status is PAID)
      // 2. Booking is confirmed (status is CONFIRMED)
      // This allows users to see confirmation after payment even if not logged in
      if (booking.paymentStatus !== 'PAID' && booking.bookingStatus !== 'CONFIRMED') {
        return apiError("Authentication required", 401);
      }
    }

    return apiSuccess(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return apiError("Failed to fetch booking");
  }
}

