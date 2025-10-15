import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/features-admin/bookings/booking.service';
import { bookingFilterSchema } from '@/features-admin/bookings/booking.validation';
import { type PaginatedApiResponse } from '@/shared/types/api.types';

/**
 * GET /api/admin/bookings
 * Fetch all bookings with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Parse URL search params
    const searchParams = request.nextUrl.searchParams;
    const rawFilters = Object.fromEntries(searchParams.entries());
    
    // Validate and parse filters
    const filters = bookingFilterSchema.parse(rawFilters);
    
    // Fetch bookings from service
    const result = await bookingService.getAllBookings(filters);
    
    // Return paginated response
    const response: PaginatedApiResponse<any> = {
      success: true,
      data: result.bookings,
      meta: {
        pagination: {
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        },
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
      },
      { status: 500 }
    );
  }
}

