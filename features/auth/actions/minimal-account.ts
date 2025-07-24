"use server";

import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/shared/types/types";

/**
 * Completes a minimal account by adding essential details
 * Used when a user has created a phone-only account during booking
 */
export async function completeMinimalAccount(
  userId: string,
  data: { firstName: string; lastName: string; email: string }
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Check if account already exists with this email to avoid duplicates
    const existingWithEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    
    if (existingWithEmail.length > 0 && existingWithEmail[0].id !== userId) {
      return {
        success: false,
        error: "An account with this email already exists"
      };
    }
    
    // Update the minimal account with the provided details
    await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        emailVerified: false, // User may need to verify email later
        updatedAt: new Date(),
        // Also update display name based on the provided name
        displayName: `${data.firstName} ${data.lastName}`,
      })
      .where(eq(users.id, userId));
    
    return {
      success: true,
      data: {
        message: "Account updated successfully"
      }
    };
  } catch (error) {
    console.error("Error completing minimal account:", error);
    return {
      success: false,
      error: "Failed to update account details"
    };
  }
} 