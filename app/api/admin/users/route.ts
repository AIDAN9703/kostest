import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { userService } from "@/features/users/user.service";
import { userFilterSchema, createUserSchema } from "@/features/users/user.validation";
import { apiPaginated, apiSuccess, apiError } from "@/shared/utils/api-response";

/**
 * GET /api/admin/users
 * Fetch paginated and filtered users list
 */
export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Build raw filters object
    const rawFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      role: searchParams.get('role') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    // Validate filters with Zod
    const validation = userFilterSchema.safeParse(rawFilters);
    
    if (!validation.success) {
      return apiError("Invalid filters", 400);
    }

    // Use validated filters
    const result = await userService.getAllUsers(validation.data);
    
    return apiPaginated(result.users, {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return apiError("Failed to fetch users");
  }
}

/**
 * POST /api/admin/users
 * Create new user
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
    const validation = createUserSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError("Invalid user data", 400);
    }

    // Service handles password hashing and timestamps
    const newUser = await userService.createUser(validation.data);

    return apiSuccess(newUser, 201);

  } catch (error) {
    console.error("Error creating user:", error);
    return apiError("Failed to create user");
  }
}
