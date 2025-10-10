import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { userService } from "@/features/users/user.service";
import { apiSuccess, apiError } from "@/shared/utils/api-response";

/**
 * GET /api/users/stats
 * Fetch user statistics (Admin only)
 * Returns: totalUsers, activeUsers, adminUsers, newUsersThisMonth
 */
export async function GET(request: NextRequest) {
  try {
    // Admin authentication required
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    // Get stats from service layer
    const stats = await userService.getUserStats();
    
    return apiSuccess({ stats });
    
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return apiError("Failed to fetch user stats");
  }
}

