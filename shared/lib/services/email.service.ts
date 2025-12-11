/**
 * Email Service
 * Handles all transactional emails for bookings
 */

import { Resend } from 'resend';
import { type BookingListItem } from '@/features/bookings/booking.types';
import { formatCurrency } from '@/shared/lib/utils/general-utils';
import { format } from 'date-fns';
import { parseDateTimeInBoatTimezone } from '@/shared/lib/utils/date-helpers';
import { formatTime12Hour } from '@/shared/lib/utils/general-utils';

// Initialize Resend (will fail gracefully if API key not set)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'bookings@kossailing.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'KOS Yacht Club';

/**
 * Send booking approval email with payment link
 */
export async function sendBookingApprovalEmail(
  booking: BookingListItem,
  paymentLink: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured. Email not sent.');
    return false;
  }

  const customerEmail = booking.customerEmail || booking.userEmail;
  if (!customerEmail) {
    console.error('No email address found for booking:', booking.id);
    return false;
  }

  // Parse dates for display
  const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(booking.startDateTime);
  
  const formattedDate = startDate && startTime
    ? `${format(startDate, 'MMMM d, yyyy')} at ${formatTime12Hour(startTime)}`
    : 'Date TBD';

  const customerName = booking.userFirstName && booking.userLastName
    ? `${booking.userFirstName} ${booking.userLastName}`
    : booking.customerName || 'Guest';

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `🎉 Your booking request has been approved!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Booking Approved!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi ${customerName},</p>
            
            <p style="font-size: 16px;">Great news! Your booking request for <strong>${booking.boatName || 'your selected boat'}</strong> has been approved.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #1e40af;">Booking Details</h2>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Boat:</strong> ${booking.boatName || 'N/A'}</p>
              <p><strong>Total Amount:</strong> ${formatCurrency(booking.totalAmount || 0)}</p>
              ${booking.numberOfPassengers ? `<p><strong>Passengers:</strong> ${booking.numberOfPassengers}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentLink}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Complete Payment Now
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              <strong>Important:</strong> Please complete your payment within 24 hours to secure your booking. The payment link will expire after this time.
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you have any questions, please don't hesitate to contact us.
            </p>
            
            <p style="font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>KOS Yacht Club</strong>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send approval email:', error);
      // Log specific error details for debugging
      if ('message' in error) {
        console.error('Resend error:', error.message);
      }
      return false;
    }

    console.log('Approval email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
}

/**
 * Send booking denial email with reason
 */
export async function sendBookingDenialEmail(
  booking: BookingListItem,
  reason: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured. Email not sent.');
    return false;
  }

  const customerEmail = booking.customerEmail || booking.userEmail;
  if (!customerEmail) {
    console.error('No email address found for booking:', booking.id);
    return false;
  }

  const customerName = booking.userFirstName && booking.userLastName
    ? `${booking.userFirstName} ${booking.userLastName}`
    : booking.customerName || 'Guest';

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Update on your booking request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Booking Request Update</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi ${customerName},</p>
            
            <p style="font-size: 16px;">We regret to inform you that we are unable to approve your booking request for <strong>${booking.boatName || 'your selected boat'}</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h2 style="margin-top: 0; color: #ef4444;">Reason</h2>
              <p style="margin: 0;">${reason}</p>
            </div>
            
            <p style="font-size: 16px;">We appreciate your interest and encourage you to browse our other available boats or try a different date.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kosyachts.com'}/boats" 
                 style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Browse Available Boats
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you have any questions, please don't hesitate to contact us.
            </p>
            
            <p style="font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>KOS Yacht Club</strong>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send denial email:', error);
      return false;
    }

    console.log('Denial email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending denial email:', error);
    return false;
  }
}

/**
 * Send booking confirmation email (after payment)
 */
export async function sendBookingConfirmationEmail(
  booking: BookingListItem
): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured. Email not sent.');
    return false;
  }

  const customerEmail = booking.customerEmail || booking.userEmail;
  if (!customerEmail) {
    console.error('No email address found for booking:', booking.id);
    return false;
  }

  // Parse dates for display
  const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(booking.startDateTime);
  
  const formattedDate = startDate && startTime
    ? `${format(startDate, 'MMMM d, yyyy')} at ${formatTime12Hour(startTime)}`
    : 'Date TBD';

  const customerName = booking.userFirstName && booking.userLastName
    ? `${booking.userFirstName} ${booking.userLastName}`
    : booking.customerName || 'Guest';

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `✅ Booking Confirmed - ${booking.boatName || 'Your Booking'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi ${customerName},</p>
            
            <p style="font-size: 16px;">Your booking has been confirmed and payment received. We're excited to have you aboard!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #1e40af;">Booking Details</h2>
              <p><strong>Booking ID:</strong> ${booking.id.substring(0, 8)}...</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Boat:</strong> ${booking.boatName || 'N/A'}</p>
              <p><strong>Total Paid:</strong> ${formatCurrency(booking.totalAmount || 0)}</p>
              ${booking.numberOfPassengers ? `<p><strong>Passengers:</strong> ${booking.numberOfPassengers}</p>` : ''}
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              We'll send you a reminder closer to your booking date. If you have any questions, please don't hesitate to contact us.
            </p>
            
            <p style="font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>KOS Yacht Club</strong>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return false;
    }

    console.log('Confirmation email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

