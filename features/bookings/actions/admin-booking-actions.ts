/**
 * Admin Booking Actions
 * Server actions for admin to manage bookings
 * 
 * Uses the new service architecture:
 * - BookingService for core operations
 * - BookingStatusService for status transitions with audit trail
 * - BookingNotesService for admin notes
 */

"use server";

import { auth } from '@/auth';
import { bookingService } from '@/features/bookings/booking.service';
import { bookingStatusService } from '@/features/bookings/booking-status.service';
import { bookingNotesService } from '@/features/bookings/booking-notes.service';
import { createPaymentLinkForBooking } from '@/features/bookings/actions/stripe-payment-links';
import {
  sendBookingApprovalEmail,
  sendBookingDenialEmail,
} from '@/shared/lib/services/email.service';
import { revalidatePath } from 'next/cache';

/**
 * Approve a booking request
 * Creates payment link and emails customer
 */
export async function approveBookingRequest(
  bookingId: string,
  adminNote?: string
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Get booking with relations for validation
    const booking = await bookingService.getBookingWithRelations(bookingId);
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    // Verify booking is a request and pending
    if (booking.bookingType !== 'REQUEST') {
      return {
        success: false,
        error: 'Only request bookings can be approved',
      };
    }

    if (booking.bookingStatus !== 'PENDING') {
      return {
        success: false,
        error: `Booking is already ${booking.bookingStatus.toLowerCase()}`,
      };
    }

    // Generate Stripe payment link (also creates pending payment record)
    const paymentLink = await createPaymentLinkForBooking(bookingId);

    // Update booking status with audit trail
    await bookingStatusService.approve(bookingId, session.user.id!, adminNote);

    // Add admin note if provided
    if (adminNote) {
      await bookingNotesService.addNote({
        bookingId,
        adminUserId: session.user.id!,
        noteType: 'GENERAL',
        content: `Approval note: ${adminNote}`,
      });
    }

    // Get updated booking for email
    const updatedBooking = await bookingService.getBookingById(bookingId);

    // Send approval email with payment link
    const emailSent = await sendBookingApprovalEmail(updatedBooking || booking as any, paymentLink);

    // Revalidate paths
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      paymentLink,
      emailSent,
      message: emailSent 
        ? 'Booking approved successfully. Payment link sent to customer.'
        : 'Booking approved successfully, but email failed to send. Please send payment link manually.',
    };
  } catch (error) {
    console.error('Error approving booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve booking',
    };
  }
}

/**
 * Deny a booking request
 * Emails customer with reason
 */
export async function denyBookingRequest(
  bookingId: string,
  reason: string
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide a reason for denial',
      };
    }

    // Get booking
    const booking = await bookingService.getBookingWithRelations(bookingId);
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    // Verify booking is a request and pending
    if (booking.bookingType !== 'REQUEST') {
      return {
        success: false,
        error: 'Only request bookings can be denied',
      };
    }

    if (booking.bookingStatus !== 'PENDING') {
      return {
        success: false,
        error: `Booking is already ${booking.bookingStatus.toLowerCase()}`,
      };
    }

    // Update booking status with audit trail (includes reason)
    await bookingStatusService.deny(bookingId, session.user.id!, reason);

    // Send denial email
    const emailSent = await sendBookingDenialEmail(booking as any, reason);

    // Revalidate paths
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      emailSent,
      message: emailSent
        ? 'Booking denied successfully. Customer has been notified.'
        : 'Booking denied successfully, but email failed to send. Please notify customer manually.',
    };
  } catch (error) {
    console.error('Error denying booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deny booking',
    };
  }
}

/**
 * Assign admin to booking
 */
export async function assignAdminToBooking(
  bookingId: string,
  adminId: string
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Validate inputs
    if (!bookingId || !adminId) {
      return {
        success: false,
        error: 'Booking ID and Admin ID are required',
      };
    }

    // Assign admin
    await bookingService.assignAdmin(bookingId, adminId);

    // Revalidate paths
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: 'Admin assigned successfully',
    };
  } catch (error) {
    console.error('Error assigning admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign admin',
    };
  }
}

/**
 * Unassign admin from booking
 */
export async function unassignAdminFromBooking(bookingId: string) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Unassign admin
    await bookingService.unassignAdmin(bookingId);

    // Revalidate paths
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: 'Admin unassigned successfully',
    };
  } catch (error) {
    console.error('Error unassigning admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unassign admin',
    };
  }
}

/**
 * Mark booking as contacted
 * Creates an admin note with the contacted timestamp
 */
export async function markBookingAsContacted(bookingId: string) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Mark as contacted (updates legacy field + creates admin note)
    await bookingService.markAsContacted(bookingId, session.user.id);

    // Revalidate paths
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: 'Booking marked as contacted',
    };
  } catch (error) {
    console.error('Error marking booking as contacted:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as contacted',
    };
  }
}

/**
 * Add an admin note to a booking
 */
export async function addBookingNote(
  bookingId: string,
  content: string,
  noteType: 'GENERAL' | 'CONTACTED' | 'FOLLOW_UP' | 'ISSUE' = 'GENERAL'
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Note content is required',
      };
    }

    await bookingNotesService.addNote({
      bookingId,
      adminUserId: session.user.id!,
      noteType,
      content: content.trim(),
    });

    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: 'Note added successfully',
    };
  } catch (error) {
    console.error('Error adding note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add note',
    };
  }
}

/**
 * Complete a booking
 */
export async function completeBooking(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    await bookingStatusService.complete(bookingId, session.user.id);

    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: 'Booking marked as completed',
    };
  } catch (error) {
    console.error('Error completing booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete booking',
    };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    if (!reason || reason.trim().length === 0) {
      return {
        success: false,
        error: 'Cancellation reason is required',
      };
    }

    await bookingStatusService.cancel(bookingId, session.user.id!, reason);

    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: 'Booking cancelled',
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking',
    };
  }
}
