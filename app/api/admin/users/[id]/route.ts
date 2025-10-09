import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { userService } from "@/features/users/users.service";
import { updateUserSchema } from "@/features/users/users.validation";
import { apiSuccess, apiError, apiSuccessNoData } from "@/shared/utils/api-response";

/**
 * GET /api/admin/users/[id]
 * Fetch single user by ID
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

    const user = await userService.getUserById(id);

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess(user);

  } catch (error) {
    console.error("Error fetching user:", error);
    return apiError("Failed to fetch user");
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user (partial updates allowed)
 */
export async function PATCH(
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

    const body = await request.json();
    
    // Validate with Zod (partial updates OK since all fields are optional)
    const validation = updateUserSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError("Invalid user data", 400);
    }

    // Service handles password hashing
    const updatedUser = await userService.updateUser(id, validation.data);

    if (!updatedUser) {
      return apiError("User not found", 404);
    }

    return apiSuccess(updatedUser);

  } catch (error) {
    console.error("Error updating user:", error);
    return apiError("Failed to update user");
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user
 */
export async function DELETE(
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

    await userService.deleteUser(id);

    return apiSuccessNoData("User deleted successfully");

  } catch (error) {
    console.error("Error deleting user:", error);
    return apiError("Failed to delete user");
  }
}
