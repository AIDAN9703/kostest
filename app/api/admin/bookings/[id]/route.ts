import { NextRequest } from 'next/server';
import { bookingService } from '@/features/bookings/booking.service';
import { apiSuccess, apiError } from '@/shared/utils/api-response';
import { auth } from '@/auth';

/**
 * GET /api/admin/bookings/[id]
 * Fetch single booking by ID (Read operations only - mutations use server actions)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    const booking = await bookingService.getBookingById(id);
    
    if (!booking) {
      return apiError("Booking not found", 404);
    }

    return apiSuccess(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return apiError("Failed to fetch booking");
  }
}   