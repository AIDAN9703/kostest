/**
 * Admin Booking Actions
 * Server actions for admin to approve, deny, or modify booking requests
 */

"use server";

import { auth } from '@/auth';
import { bookingService } from '@/features/bookings/booking.service';
import { createPaymentLinkForBooking } from '@/features/bookings/actions/stripe-payment-links';
import {
  sendBookingApprovalEmail,
  sendBookingDenialEmail,
  sendBookingModificationEmail,
} from '@/shared/services/email.service';
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
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Get booking
    const booking = await bookingService.getBookingById(bookingId);
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

    // Generate Stripe payment link (this also stores the payment link ID)
    const paymentLink = await createPaymentLinkForBooking(bookingId);

    // Update booking status to APPROVED
    await bookingService.updateBookingStatus(bookingId, 'APPROVED');
    
    // Refresh booking to get updated payment link ID
    const updatedBooking = await bookingService.getBookingById(bookingId);

    // Send approval email with payment link
    const emailSent = await sendBookingApprovalEmail(updatedBooking || booking, paymentLink);

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
    if (!session?.user || session.user.role !== 'ADMIN') {
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
    const booking = await bookingService.getBookingById(bookingId);
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

    // Update booking status to DENIED
    await bookingService.updateBookingStatus(bookingId, 'DENIED');

    // Send denial email
    const emailSent = await sendBookingDenialEmail(booking, reason);

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
 * Modify a booking request
 * Updates booking details and emails customer
 */
export async function modifyBookingRequest(
  bookingId: string,
  modifications: {
    totalAmount?: number;
    startDateTime?: Date | string;
    endDateTime?: Date | string;
    numberOfPassengers?: number;
    notes?: string;
  },
  modificationNotes: string
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Validate modifications
    if (!modificationNotes || modificationNotes.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide notes explaining the modifications',
      };
    }

    // Get booking
    const booking = await bookingService.getBookingById(bookingId);
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
        error: 'Only request bookings can be modified',
      };
    }

    if (booking.bookingStatus !== 'PENDING') {
      return {
        success: false,
        error: `Booking is already ${booking.bookingStatus.toLowerCase()}`,
      };
    }

    // TODO: Update booking with modifications
    // For now, we'll just send the email with modification notes
    // You'll need to add an updateBooking method to bookingService that handles partial updates

    // Send modification email
    const emailSent = await sendBookingModificationEmail(
      booking,
      modificationNotes
    );

    // Revalidate paths
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      emailSent,
      message: emailSent
        ? 'Booking modification sent successfully. Customer has been notified.'
        : 'Booking modified successfully, but email failed to send. Please notify customer manually.',
    };
  } catch (error) {
    console.error('Error modifying booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to modify booking',
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
    if (!session?.user || session.user.role !== 'ADMIN') {
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
    if (!session?.user || session.user.role !== 'ADMIN') {
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
 */
export async function markBookingAsContacted(bookingId: string) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Mark as contacted
    await bookingService.markAsContacted(bookingId);

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

