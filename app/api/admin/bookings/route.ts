import { NextRequest } from "next/server";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingFilterSchema } from "@/features/bookings/booking.validation";
import { apiPaginated, apiError } from "@/shared/lib/utils/api-helpers";
import { auth } from "@/auth";

/**
 * GET /api/admin/bookings
 * Fetch all bookings with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return apiError("Admin access required", 403);
    }

    // Parse URL search params
    const searchParams = request.nextUrl.searchParams;
    const rawFilters = Object.fromEntries(searchParams.entries());

    // Validate with Zod schema (safeParse to handle errors gracefully)
    const validation = bookingFilterSchema.safeParse(rawFilters);
    if (!validation.success) {
      return apiError("Invalid filter parameters", 400);
    }

    // Fetch bookings from service
    const result = await bookingService.getAllBookings(validation.data);

    // Return paginated response using helper
    return apiPaginated(result.bookings, {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return apiError("Failed to fetch bookings");
  }
}
