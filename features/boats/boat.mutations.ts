/**
 * Boats Mutations (Server Actions) - CUD Operations Only
 */

"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { type Boat } from "@/database/types";
import { type ActionResponse } from "@/shared/types/types";
import { type CreateBoatInput, type UpdateBoatInput } from "@/features/boats/boat.validation";
import { boatService } from "@/features/boats/boat.service";

// ========================================
// CORE CUD OPERATIONS
// ========================================

/**
 * Create new boat
 */
export async function createBoat(boatData: CreateBoatInput): Promise<ActionResponse<{ boat: any }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }


  try {
    const newBoat = await boatService.createBoat(boatData);

    revalidatePath('/admin/boats');
    return { success: true, data: { boat: newBoat } };
  } catch (error) {
    console.error("Error creating boat:", error);
    return { success: false, error: "Failed to create boat" };
  }
}

/**
 * Update boat (partial updates allowed)
 */
export async function updateBoat(
  id: string, 
  updates: Partial<UpdateBoatInput>
): Promise<ActionResponse<{ boat: Boat }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const updatedBoat = await boatService.updateBoat(id, updates);

    revalidatePath('/admin/boats');
    revalidatePath(`/admin/boats/${id}`);
    return { success: true, data: { boat: updatedBoat } };
  } catch (error) {
    console.error("Error updating boat:", error);
    return { success: false, error: "Failed to update boat" };
  }
}

/**
 * Delete boat
 */
export async function deleteBoat(id: string): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  // Only admins can delete boats
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: "Admin access required" };
  }

  try {
    await boatService.deleteBoat(id);
    revalidatePath('/admin/boats');
    return { success: true, data: { message: "Boat deleted successfully" } };
  } catch (error) {
    console.error("Error deleting boat:", error);
    return { success: false, error: "Failed to delete boat" };
  }
}

/**
 * Toggle boat active status
 */
export async function toggleBoatActive(id: string): Promise<ActionResponse<{ boat: Boat }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const updatedBoat = await boatService.toggleBoatActive(id);

    revalidatePath('/admin/boats');
    revalidatePath(`/admin/boats/${id}`);
    return { success: true, data: { boat: updatedBoat } };
  } catch (error) {
    console.error("Error toggling boat active status:", error);
    return { success: false, error: "Failed to update boat status" };
  }
}

