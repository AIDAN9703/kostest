/**
 * Bookings Mutations (Server Actions) - CUD Operations Only
 */

"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "@/shared/types/types";
import { bookingService } from "@/features/bookings/booking.service";

// ========================================
// CORE CUD OPERATIONS
// ========================================

/**
 * Delete booking
 */
export async function deleteBooking(id: string): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  // Only admins can delete bookings
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: "Admin access required" };
  }

  try {
    await bookingService.deleteBooking(id);
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { message: "Booking deleted successfully" } };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: "Failed to delete booking" };
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: string
): Promise<ActionResponse<{ booking: any }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  // Only admins can update booking status
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: "Admin access required" };
  }

  try {
    const updatedBooking = await bookingService.updateBookingStatus(id, status);
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { booking: updatedBooking } };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status" };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  id: string,
  status: string
): Promise<ActionResponse<{ booking: any }>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  // Only admins can update payment status
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: "Admin access required" };
  }

  try {
    const updatedBooking = await bookingService.updatePaymentStatus(id, status);
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { booking: updatedBooking } };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

