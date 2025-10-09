import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { boatService } from "@/features/boats/boats.service";
import { boatFilterSchema, createBoatSchema } from "@/features/boats/boats.validation";
import { apiPaginated, apiSuccess, apiError } from "@/shared/utils/api-response";

/**
 * GET /api/admin/boats
 * Fetch paginated and filtered boats list
 */
export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    // Parse and validate query params with Zod (handles type coercion automatically)
    const filters = boatFilterSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    
    if (!filters.success) {
      return apiError("Invalid filter parameters", 400);
    }

    const result = await boatService.getAllBoats(filters.data);
    
    return apiPaginated(result.boats, {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    });

  } catch (error) {
    console.error("Error fetching boats:", error);
    return apiError("Failed to fetch boats");
  }
}

/**
 * POST /api/admin/boats
 * Create new boat
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    const body = await request.json();
    
    // Validate with Zod
    const validation = createBoatSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError("Invalid boat data", 400);
    }

    const newBoat = await boatService.createBoat(validation.data);
    
    return apiSuccess(newBoat, 201);

  } catch (error) {
    console.error("Error creating boat:", error);
    return apiError("Failed to create boat");
  }
}

