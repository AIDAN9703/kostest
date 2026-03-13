/**
 * Bookings Mutations (Server Actions) - CUD Operations Only
 */

"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "@/shared/lib/types/types";
import { bookingService } from "@/features/bookings/booking.service";
import { bookingUpdateSchema, bookingCreateSchema, type BookingUpdateInput } from "./booking.validation";
import { createPaymentLinkForBooking, getPaymentLinkUrl } from "@/features/bookings/actions/stripe-payment-links";
import { paymentService } from "@/features/payments/payment.service";
import { markInquiryAsConverted } from "@/features/inquiries/inquiry.actions";
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
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    // Cast status to BookingStatus type
    const bookingStatus = status as "PENDING" | "APPROVED" | "CONFIRMED" | "DENIED" | "EXPIRED" | "CANCELLED" | "COMPLETED" | "REFUNDED";
    const updatedBooking = await bookingService.updateBookingStatus(id, bookingStatus);
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
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    // Cast status to PaymentStatus type
    const paymentStatus = status as "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "CANCELLED" | "CHARGEBACK";
    const updatedBooking = await bookingService.updatePaymentStatus(id, paymentStatus);
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { booking: updatedBooking } };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
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
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${id}`);
    return { success: true, data: { booking: updatedBooking } };
  } catch (error) {
    console.error("Error updating booking:", error);

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : "Validation error"
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update booking"
    };
  }
}

/**
 * Create booking (admin)
 */
export async function createAdminBooking(
  formData: FormData
): Promise<ActionResponse<{ booking: any }>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  if (!session?.user?.isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    const startDateTimeRaw = formData.get("startDateTime") as string;
    const endDateTimeRaw = formData.get("endDateTime") as string;
    const userIdRaw = formData.get("userId") as string | null;
    const inquiryIdRaw = formData.get("inquiryId") as string | null;

    const payload = bookingCreateSchema.parse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: formData.get("customerPhone") || null,
      boatId: formData.get("boatId"),
      pricingTierId: formData.get("pricingTierId"),
      startDateTime: startDateTimeRaw ? new Date(startDateTimeRaw).toISOString() : "",
      endDateTime: endDateTimeRaw ? new Date(endDateTimeRaw).toISOString() : null,
      numberOfPassengers: Number(formData.get("numberOfPassengers") || 0),
      needsCaptain: formData.get("needsCaptain") === "true",
      pickupLocation: formData.get("pickupLocation") || null,
      dropoffLocation: formData.get("dropoffLocation") || null,
      specialRequests: formData.get("specialRequests") || null,
      userId: userIdRaw && userIdRaw !== "none" ? userIdRaw : null,
      inquiryId: inquiryIdRaw && inquiryIdRaw !== "" ? inquiryIdRaw : null,
      bookingType: formData.get("bookingType") as any || "EXTERNAL_BOOKING",
      source: formData.get("source") as any || "ADMIN",
    });

    const booking = await bookingService.createAdminBooking(payload, session.user.id);

    if (payload.inquiryId) {
      await markInquiryAsConverted(payload.inquiryId);
    }

    revalidatePath('/admin/bookings');
    revalidatePath('/admin/inquiries');
    revalidatePath('/admin');
    revalidatePath('/admin/all');

    return { success: true, data: { booking } };
  } catch (error) {
    console.error("Error creating admin booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
    return { success: false, error: errorMessage };
  }
}

/**
 * Get or create payment link URL for a booking
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

    // Check for existing payment link in payments table
    const existingPayments = await paymentService.getPaymentsForPayable("BOOKING", bookingId);
    const paymentWithLink = existingPayments.find((p) => p.stripePaymentLinkId);

    let url: string;
    if (paymentWithLink?.stripePaymentLinkId) {
      url = await getPaymentLinkUrl(paymentWithLink.stripePaymentLinkId);
    } else {
      url = await createPaymentLinkForBooking(bookingId);
    }

    return { success: true, data: { url } };
  } catch (error) {
    console.error("Error retrieving payment link:", error);
    return { success: false, error: "Failed to get payment link" };
  }
}

