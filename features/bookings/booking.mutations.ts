/**
 * Bookings Mutations (Server Actions) - CUD Operations Only
 */

"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "@/shared/lib/types/types";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingUpdateSchema, type BookingUpdateInput } from "./booking.validation";
import { getOrCreateCheckoutUrl } from "@/features/bookings/actions/stripe-checkout";
import type { BookingDetails } from "./booking.types";

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
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    await bookingService.deleteBooking(id);
    revalidatePath("/admin/bookings");
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
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    // Cast status to BookingStatus type
    const bookingStatus = status as
      | "DRAFT"
      | "PENDING"
      | "APPROVED"
      | "CONFIRMED"
      | "CANCELLED"
      | "COMPLETED";
    const updatedBooking = await bookingService.updateBookingStatus(id, bookingStatus);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { booking: updatedBooking } };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status" };
  }
}

/**
 * Update booking fields (partial update) with automatic pricing recalculation
 *
 * Uses BookingUpdateInput type which enforces proper pricing logic:
 * - Pricing is automatically recalculated when pricingTierId, boatId, cleaningFee, or captainFee changes
 * - totalAmount and serviceFee are always recalculated unless manualOverride is true
 * - Dates are properly converted from boat timezone to UTC
 */
export async function updateBooking(
  id: string,
  updates: BookingUpdateInput
): Promise<ActionResponse<{ booking: BookingDetails }>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  // Only admins can update bookings
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    // Validate input
    const validatedUpdates = bookingUpdateSchema.parse(updates);

    const updatedBooking = await bookingService.updateBooking(
      id,
      validatedUpdates,
      session.user.id ?? null
    );
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { booking: updatedBooking } };
  } catch (error) {
    console.error("Error updating booking:", error);

    // Handle Zod validation errors
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError
          ? `${firstError.path.join(".")}: ${firstError.message}`
          : "Validation error",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update booking",
    };
  }
}

/**
 * Get or create a Checkout Session URL for a booking.
 * Reuses existing sessions if still valid; creates a new one otherwise.
 */
export async function getOrCreatePaymentLink(
  bookingId: string
): Promise<ActionResponse<{ url: string }>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const url = await getOrCreateCheckoutUrl(bookingId);
    return { success: true, data: { url } };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: "Failed to create payment session" };
  }
}
