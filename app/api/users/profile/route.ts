import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { userService } from "@/features/users/user.service";
import { apiSuccess, apiError } from "@/shared/utils/api-response";

/**
 * GET /api/users/profile
 * Get the current authenticated user's profile
 * Returns full user object for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication required
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Authentication required", 401);
    }

    // Get user profile from service
    const user = await userService.getUserById(session.user.id);
    
    if (!user) {
      return apiError("User not found", 404);
    }

    // Return user profile (excluding password for security)
    const { password, ...safeUser } = user;
    
    return apiSuccess(safeUser);
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return apiError("Failed to fetch profile");
  }
}

