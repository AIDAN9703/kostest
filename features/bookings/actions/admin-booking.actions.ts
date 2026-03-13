"use server";

/**
 * Admin Booking Actions
 * Server actions for admin to manage bookings
 */
import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { bookings } from "@/database/schema";

import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import { createPaymentLinkForBooking } from "@/features/bookings/actions/stripe-payment-links";

import { bookingService } from "@/features/bookings/booking.service";
import { bookingStatusService } from "@/features/bookings/booking-status.service";
import { bookingNotesService } from "@/features/bookings/booking-notes.service";
import {
  sendBookingApprovalEmail,
  sendBookingDenialEmail,
} from "@/shared/lib/services/email.service";

/** Approve a booking request - creates payment link and emails customer */
export async function approveBookingRequest(bookingId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    const session = authResult.session!;

    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) return { success: false, error: "Booking not found" };
    if (booking.bookingType !== "REQUEST") {
      return { success: false, error: "Only request bookings can be approved" };
    }
    if (booking.bookingStatus !== "PENDING") {
      return { success: false, error: `Booking is already ${booking.bookingStatus.toLowerCase()}` };
    }

    const paymentLink = await createPaymentLinkForBooking(bookingId);
    await bookingStatusService.approve(bookingId, session.user.id!);

    const emailSent = await sendBookingApprovalEmail(booking as any, paymentLink);

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      paymentLink,
      emailSent,
      message: emailSent
        ? "Booking approved successfully. Payment link sent to customer."
        : "Booking approved successfully, but email failed to send. Please send payment link manually.",
    };
  } catch (error) {
    console.error("Error approving booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve booking",
    };
  }
}

/** Deny a booking request - emails customer with reason */
export async function denyBookingRequest(bookingId: string, reason: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    const session = authResult.session!;

    if (!reason?.trim()) return { success: false, error: "Please provide a reason for denial" };

    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) return { success: false, error: "Booking not found" };
    if (booking.bookingType !== "REQUEST") {
      return { success: false, error: "Only request bookings can be denied" };
    }
    if (booking.bookingStatus !== "PENDING") {
      return { success: false, error: `Booking is already ${booking.bookingStatus.toLowerCase()}` };
    }

    await bookingStatusService.deny(bookingId, session.user.id!, reason.trim());
    const emailSent = await sendBookingDenialEmail(booking as any, reason.trim());

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      emailSent,
      message: emailSent
        ? "Booking denied successfully. Customer has been notified."
        : "Booking denied successfully, but email failed to send. Please notify customer manually.",
    };
  } catch (error) {
    console.error("Error denying booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deny booking",
    };
  }
}

/** Assign admin to booking */
export async function assignAdminToBooking(bookingId: string, adminId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!bookingId || !adminId) {
      return { success: false, error: "Booking ID and Admin ID are required" };
    }

    await bookingService.assignAdmin(bookingId, adminId, authResult.session!.user.id!);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Admin assigned successfully" };
  } catch (error) {
    console.error("Error assigning admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign admin",
    };
  }
}

/** Unassign admin from booking */
export async function unassignAdminFromBooking(bookingId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };

    await bookingService.unassignAdmin(bookingId, authResult.session!.user.id!);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Admin unassigned successfully" };
  } catch (error) {
    console.error("Error unassigning admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unassign admin",
    };
  }
}

/** Mark booking as contacted (creates admin note) */
export async function markBookingAsContacted(bookingId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };

    await bookingNotesService.markAsContacted(bookingId, authResult.session!.user.id);
    await db.update(bookings).set({ updatedAt: new Date() }).where(eq(bookings.id, bookingId));

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Booking marked as contacted" };
  } catch (error) {
    console.error("Error marking booking as contacted:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as contacted",
    };
  }
}

/** Add an admin note to a booking */
export async function addBookingNote(
  bookingId: string,
  content: string,
  noteType: "GENERAL" | "CONTACTED" | "FOLLOW_UP" | "ISSUE" = "GENERAL"
) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!content?.trim()) return { success: false, error: "Note content is required" };

    await bookingNotesService.addNote({
      bookingId,
      adminUserId: authResult.session!.user.id,
      noteType,
      content: content.trim(),
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    return { success: true, message: "Note added successfully" };
  } catch (error) {
    console.error("Error adding note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add note",
    };
  }
}

/** Complete a booking */
export async function completeBooking(bookingId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };

    await bookingStatusService.complete(bookingId, authResult.session!.user.id);

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Booking marked as completed" };
  } catch (error) {
    console.error("Error completing booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete booking",
    };
  }
}

/** Cancel a booking */
export async function cancelBooking(bookingId: string, reason: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!reason?.trim()) return { success: false, error: "Cancellation reason is required" };

    await bookingStatusService.cancel(bookingId, authResult.session!.user.id, reason.trim());

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Booking cancelled" };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}
