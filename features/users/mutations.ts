/**
 * Users Mutations (Server Actions) - CUD Operations Only
 */

"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { type User } from "@/database/types";
import { type ActionResponse } from "@/shared/types/types";
import { type CreateUserInput, type UpdateUserInput } from "@/features/users/users.validation";
import { userService } from "@/features/users/users.service";

// ========================================
// CORE CUD OPERATIONS
// ========================================

/**
 * Create new user
 */
export async function createUser(userData: CreateUserInput): Promise<ActionResponse<{ user: User }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const newUser = await userService.createUser(userData);

    revalidatePath('/admin/users');
    return { success: true, data: { user: newUser } };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

/**
 * Update user (partial updates allowed)
 * Since all fields in UpdateUserInput are optional, we can pass partial updates
 */
export async function updateUser(
  id: string, 
  updates: Partial<UpdateUserInput>
): Promise<ActionResponse<{ user: User }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const updatedUser = await userService.updateUser(id, updates);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
    return { success: true, data: { user: updatedUser } };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    await userService.deleteUser(id);
    revalidatePath('/admin/users');
    return { success: true, data: { message: "User deleted successfully" } };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

/**
 * Bulk update users
 */
export async function bulkUpdateUsers(
  userIds: string[],
  updates: Partial<User>
): Promise<ActionResponse<{ updatedCount: number }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const result = await userService.bulkUpdateUsers(userIds, updates);

    revalidatePath('/admin/users');
    return { success: true, data: { updatedCount: result.length } };
  } catch (error) {
    console.error("Error bulk updating users:", error);
    return { success: false, error: "Failed to update users" };
  }
}
