"use server";

import { getAuthenticatedUserId } from "@/shared/lib/utils/auth-utils";
import { db } from "@/database/db";
import { users, bookings, bookingPricing } from "@/database/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { profileUpdateSchema, ProfileFormValues } from "@/features/_validation/validations";
import { UserProfile, ProfileUpdateResponse } from "@/features/profile/profile.types";

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<{ user?: UserProfile; error?: string }> {
  const authResult = await getAuthenticatedUserId();
  
  if (authResult.error || !authResult.userId) {
    return { error: authResult.error || "Not authenticated" };
  }

  const userId = authResult.userId;

  try {
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      return { error: "User not found" };
    }

    return { user: userData[0] as UserProfile };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { error: "Failed to fetch user profile" };
  }
}

/**
 * Update the user's profile
 * Allows partial updates - only the fields that are provided will be updated
 */
export async function updateUserProfile(formData: Partial<ProfileFormValues>): Promise<ProfileUpdateResponse> {
  const authResult = await getAuthenticatedUserId();
  
  if (authResult.error || !authResult.userId) {
    return { error: authResult.error || "Not authenticated" };
  }

  const userId = authResult.userId;

  try {
    // Get the current user data first
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      return { error: "User not found" };
    }

    const currentUser = userData[0] as UserProfile;
    
    // Create a merged object with current values and new values
    const mergedData = {
      firstName: formData.firstName ?? currentUser.firstName,
      lastName: formData.lastName ?? currentUser.lastName,
      email: formData.email ?? currentUser.email,
      phoneNumber: formData.phoneNumber ?? currentUser.phoneNumber,
      bio: formData.bio ?? currentUser.bio,
      address: formData.address ?? (currentUser as any).address,
      city: formData.city ?? currentUser.city,
      state: formData.state ?? currentUser.state,
      country: formData.country ?? currentUser.country,
      postalCode: formData.postalCode ?? (currentUser as any).postalCode,
      profileImage: formData.profileImage ?? currentUser.profileImage,
    };

    // Validate the merged data
    const validatedData = profileUpdateSchema.parse(mergedData);

    // Create sanitized data object with explicit null handling
    // Only include fields that were actually provided in the form data
    const updateData: Record<string, any> = {};
    
    if (formData.firstName !== undefined) updateData.firstName = validatedData.firstName;
    if (formData.lastName !== undefined) updateData.lastName = validatedData.lastName;
    if (formData.email !== undefined) updateData.email = validatedData.email;
    if (formData.phoneNumber !== undefined) updateData.phoneNumber = validatedData.phoneNumber || null;
    if (formData.bio !== undefined) updateData.bio = validatedData.bio || null;
    if (formData.address !== undefined) updateData.address = validatedData.address || null;
    if (formData.city !== undefined) updateData.city = validatedData.city || null;
    if (formData.state !== undefined) updateData.state = validatedData.state || null;
    if (formData.country !== undefined) updateData.country = validatedData.country || null;
    if (formData.postalCode !== undefined) updateData.postalCode = validatedData.postalCode || null;
    if (formData.profileImage !== undefined) updateData.profileImage = validatedData.profileImage === "" ? null : validatedData.profileImage;

    // If no fields were provided, return early
    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    // Calculate profile completion percentage based on the merged data
    const profileCompletionPercentage = calculateProfileCompletion(mergedData);
    updateData.profileCompletionPercentage = profileCompletionPercentage;
    updateData.updatedAt = new Date();

    // Update user in database with only the fields that were provided
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    // Revalidate profile pages
    revalidatePath("/profile");
    revalidatePath("/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return { 
        error: "Validation failed", 
        fieldErrors: Object.fromEntries(
          Object.entries(error.flatten().fieldErrors)
            .filter(([_, errors]) => errors && errors.length > 0)
            .map(([field, errors]) => [field, errors || []])
        )
      };
    }
    
    return { error: "Failed to update profile" };
  }
}

/**
 * Calculate the profile completion percentage
 */
function calculateProfileCompletion(user: Partial<UserProfile>): number {
  if (!user) return 0;

  // Define fields to check for completion
  const fields = [
    "firstName", 
    "lastName", 
    "email", 
    "phoneNumber", 
    "bio", 
    "city", 
    "state", 
    "country", 
    "profileImage"
  ] as const;
  
  // Count filled fields
  let filledFields = 0;
  const totalFields = fields.length;
  
  for (const field of fields) {
    const value = user[field];
    // Check if the field has a valid value
    if (value !== null && value !== undefined && value !== '') {
      filledFields++;
    }
  }
  
  // Calculate percentage
  return Math.round((filledFields / totalFields) * 100);
}

/**
 * Get user statistics for the profile welcome page
 */
export async function getUserStats() {
  const authResult = await getAuthenticatedUserId();
  
  if (authResult.error || !authResult.userId) {
    return { error: authResult.error || "Not authenticated" };
  }

  const userId = authResult.userId;

  try {
    const [stats] = await db
      .select({
        totalBookings: sql<number>`COUNT(*)`,
        completedBookings: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'COMPLETED' THEN 1 END)`,
        upcomingBookings: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} IN ('PENDING', 'CONFIRMED') AND ${bookings.startDateTime} > NOW() THEN 1 END)`,
        totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${bookings.bookingStatus} = 'COMPLETED' THEN ${bookingPricing.totalAmountCents} ELSE 0 END), 0)`,
      })
      .from(bookings)
      .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
      .where(eq(bookings.userId, userId));

    // Calculate loyalty points (1 point per $1 spent)
    const loyaltyPoints = Math.floor(Number(stats.totalSpent) || 0);

    return {
      totalBookings: Number(stats.totalBookings) || 0,
      completedBookings: Number(stats.completedBookings) || 0,
      upcomingBookings: Number(stats.upcomingBookings) || 0,
      totalSpent: Number(stats.totalSpent) || 0,
      loyaltyPoints,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { error: "Failed to fetch user stats" };
  }
} 