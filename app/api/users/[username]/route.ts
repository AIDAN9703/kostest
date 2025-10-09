import { NextRequest } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError } from "@/shared/utils/api-response";

/**
 * GET /api/users/[username]
 * Get a public user profile by username
 * Returns safe user data (no sensitive fields)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    if (!username) {
      return apiError("Username is required", 400);
    }

    // Find user by username
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        profileImage: users.profileImage,
        coverImage: users.coverImage,
        bio: users.bio,
        city: users.city,
        state: users.state,
        country: users.country,
        boatingExperience: users.boatingExperience,
        averageRating: users.averageRating,
        totalReviews: users.totalReviews,
        isBoatOwner: users.isBoatOwner,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess(user);
    
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return apiError("Failed to fetch user");
  }
}

