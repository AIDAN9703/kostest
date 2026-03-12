/**
 * Email Service
 * Handles all transactional emails for bookings
 */

import { Resend } from 'resend';
import { BookingDetails, type BookingListItem } from '@/features/bookings/booking.types';
import { formatCentsAsCurrency } from '@/shared/lib/utils/money-utils';
import { format } from 'date-fns';
import { parseDateTimeInBoatTimezone } from '@/shared/lib/utils/date-helpers';
import { formatTime12Hour } from '@/shared/lib/utils/general-utils';

// Initialize Resend (will fail gracefully if API key not set)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'bookings@kossailing.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'Kings Of The Sea Yachts';

// Brand colors
const BRAND_NAVY = '#27445c';
const BRAND_GOLD = '#b2a37a';
const BRAND_NAVY_LIGHT = '#3a5a7a';
const TEXT_PRIMARY = '#1f2937';
const TEXT_SECONDARY = '#6b7280';
const BORDER_COLOR = '#e5e7eb';
const BG_LIGHT = '#f9fafb';

/**
 * Base email template styles
 */
const baseEmailStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${TEXT_PRIMARY};
      background-color: ${BG_LIGHT};
      padding: 20px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: ${BRAND_NAVY};
      padding: 32px 24px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .email-content {
      padding: 40px 32px;
    }
    .greeting {
      font-size: 16px;
      color: ${TEXT_PRIMARY};
      margin-bottom: 24px;
      font-weight: 500;
    }
    .message {
      font-size: 15px;
      color: ${TEXT_SECONDARY};
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .booking-details {
      background-color: ${BG_LIGHT};
      border: 1px solid ${BORDER_COLOR};
      border-radius: 8px;
      padding: 24px;
      margin: 32px 0;
    }
    .booking-details-title {
      font-size: 16px;
      font-weight: 600;
      color: ${BRAND_NAVY};
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid ${BRAND_GOLD};
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid ${BORDER_COLOR};
    }
    .detail-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-label {
      font-size: 14px;
      color: ${TEXT_SECONDARY};
      font-weight: 500;
      flex: 0 0 40%;
    }
    .detail-value {
      font-size: 14px;
      color: ${TEXT_PRIMARY};
      font-weight: 600;
      text-align: right;
      flex: 1;
    }
    .detail-value.total {
      font-size: 18px;
      color: ${BRAND_NAVY};
    }
    .cta-button {
      display: inline-block;
      background-color: ${BRAND_NAVY} !important;
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: ${BRAND_NAVY_LIGHT} !important;
      color: #ffffff !important;
    }
    a.cta-button {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .info-box {
      background-color: ${BG_LIGHT};
      border-left: 4px solid ${BRAND_GOLD};
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box-title {
      font-size: 14px;
      font-weight: 600;
      color: ${TEXT_PRIMARY};
      margin-bottom: 8px;
    }
    .info-box-text {
      font-size: 14px;
      color: ${TEXT_SECONDARY};
      line-height: 1.6;
    }
    .email-footer {
      background-color: ${BG_LIGHT};
      padding: 24px 32px;
      border-top: 1px solid ${BORDER_COLOR};
      text-align: center;
    }
    .email-footer-text {
      font-size: 13px;
      color: ${TEXT_SECONDARY};
      margin-bottom: 8px;
    }
    .company-name {
      font-size: 15px;
      font-weight: 600;
      color: ${BRAND_NAVY};
      margin-top: 16px;
    }
    .signature {
      margin-top: 32px;
      font-size: 15px;
      color: ${TEXT_PRIMARY};
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-error {
      background-color: #fee2e2;
      color: #991b1b;
    }
    @media only screen and (max-width: 600px) {
      .email-content {
        padding: 24px 20px;
      }
      .detail-item {
        flex-direction: column;
        gap: 4px;
      }
      .detail-value {
        text-align: left;
      }
    }
  </style>
`;

/**
 * Send draft booking proposal email with link to accept
 * Called automatically when admin creates a booking/group
 */
export async function sendDraftBookingEmail(params: {
  customerName: string;
  customerEmail: string;
  draftLink: string;
  boatName?: string;
  isGroup?: boolean;
}): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured. Draft email not sent.');
    return false;
  }

  const { customerName, customerEmail, draftLink, boatName, isGroup } = params;
  if (!customerEmail) {
    console.error('No email address for draft notification');
    return false;
  }

  const subject = isGroup
    ? `Your yacht charter proposal from Kings Of The Sea`
    : `Your yacht charter proposal - ${boatName || 'KOS Yachts'}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: customerEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseEmailStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Your Charter Proposal</h1>
            </div>
            
            <div class="email-content">
              <p class="greeting">Hi ${customerName || 'there'},</p>
              
              <p class="message">
                We've prepared a charter proposal for you${boatName ? ` aboard <strong>${boatName}</strong>` : ''}.
                Review the details and accept when you're ready.
              </p>
              
              <div class="cta-container">
                <a href="${draftLink}" class="cta-button" style="background-color: ${BRAND_NAVY}; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">View & Accept Proposal</a>
              </div>
              
              <div class="info-box">
                <div class="info-box-title">What's next?</div>
                <div class="info-box-text">
                  Click the button above to view your proposal. You can accept and pay online, or contact us with any questions.
                </div>
              </div>
              
              <p class="signature">
                Best regards,<br>
                <span class="company-name">Kings Of The Sea Yachts</span>
              </p>
            </div>
            
            <div class="email-footer">
              <p class="email-footer-text">
                Questions? Reply to this email or contact us at ${FROM_EMAIL}
              </p>
              <p class="company-name">Kings Of The Sea Yachts</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send draft proposal email:', error);
      return false;
    }
    console.log('Draft proposal email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending draft proposal email:', error);
    return false;
  }
}

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
      subject: `Your booking request has been approved - ${booking.boatName || 'KOS Yachts'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseEmailStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Booking Request Approved</h1>
            </div>
            
            <div class="email-content">
              <p class="greeting">Hi ${customerName},</p>
              
              <p class="message">
                Great news! Your booking request for <strong>${booking.boatName || 'your selected yacht'}</strong> has been approved. 
                Complete your payment to secure your reservation.
              </p>
              
              <div class="booking-details">
                <div class="booking-details-title">Booking Details</div>
                <div class="detail-item">
                  <span class="detail-label">Yacht</span>
                  <span class="detail-value">${booking.boatName || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date & Time</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                ${booking.numberOfPassengers ? `
                <div class="detail-item">
                  <span class="detail-label">Passengers</span>
                  <span class="detail-value">${booking.numberOfPassengers}</span>
                </div>
                ` : ''}
                <div class="detail-item">
                  <span class="detail-label">Total Amount</span>
                  <span class="detail-value total">${formatCentsAsCurrency(booking.totalAmountCents || 0)}</span>
                </div>
              </div>
              
              <div class="cta-container">
                <a href="${paymentLink}" class="cta-button" style="background-color: ${BRAND_NAVY}; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Complete Payment</a>
              </div>
              
              <div class="info-box">
                <div class="info-box-title">Payment Required</div>
                <div class="info-box-text">
                  Please complete your payment within 24 hours to secure your booking. 
                  The payment link will expire after this time period.
                </div>
              </div>
              
              <p class="signature">
                Best regards,<br>
                <span class="company-name">Kings Of The Sea Yachts</span>
              </p>
            </div>
            
            <div class="email-footer">
              <p class="email-footer-text">
                Questions? Reply to this email or contact us at ${FROM_EMAIL}
              </p>
              <p class="company-name">Kings Of The Sea Yachts</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send approval email:', error);
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
      subject: `Update on your booking request - ${booking.boatName || 'KOS Yachts'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseEmailStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Booking Request Update</h1>
            </div>
            
            <div class="email-content">
              <p class="greeting">Hi ${customerName},</p>
              
              <p class="message">
                Thank you for your interest in booking with Kings Of The Sea Yachts. 
                Unfortunately, we are unable to approve your booking request for <strong>${booking.boatName || 'your selected yacht'}</strong> at this time.
              </p>
              
              <div class="info-box" style="border-left-color: #ef4444;">
                <div class="info-box-title">Reason</div>
                <div class="info-box-text">${reason}</div>
              </div>
              
              <p class="message">
                We appreciate your interest and encourage you to browse our other available yachts or consider alternative dates.
              </p>
              
              <div class="cta-container">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kosyachts.com'}/boats" class="cta-button" style="background-color: ${BRAND_NAVY}; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                  Browse Available Yachts
                </a>
              </div>
              
              <p class="signature">
                Best regards,<br>
                <span class="company-name">Kings Of The Sea Yachts</span>
              </p>
            </div>
            
            <div class="email-footer">
              <p class="email-footer-text">
                Questions? Reply to this email or contact us at ${FROM_EMAIL}
              </p>
              <p class="company-name">Kings Of The Sea Yachts</p>
            </div>
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
  booking: BookingDetails
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
      subject: `Booking Confirmed - ${booking.boatName || 'Your Yacht Charter'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseEmailStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Booking Confirmed</h1>
            </div>
            
            <div class="email-content">
              <p class="greeting">Hi ${customerName},</p>
              
              <p class="message">
                Your booking has been confirmed and payment received. We're excited to welcome you aboard 
                <strong>${booking.boatName || 'your yacht'}</strong> for an unforgettable experience on the water.
              </p>
              
              <div class="booking-details">
                <div class="booking-details-title">Booking Confirmation</div>
                <div class="detail-item">
                  <span class="detail-label">Booking ID</span>
                  <span class="detail-value">${booking.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Yacht</span>
                  <span class="detail-value">${booking.boatName || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date & Time</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                ${booking.numberOfPassengers ? `
                <div class="detail-item">
                  <span class="detail-label">Passengers</span>
                  <span class="detail-value">${booking.numberOfPassengers}</span>
                </div>
                ` : ''}
                <div class="detail-item">
                  <span class="detail-label">Total Paid</span>
                  <span class="detail-value total">${formatCentsAsCurrency(booking.totalAmountCents || 0)}</span>
                </div>
              </div>
              
              <div class="info-box">
                <div class="info-box-title">What's Next?</div>
                <div class="info-box-text">
                  We'll send you a reminder closer to your booking date with additional details, 
                  preparation instructions, and contact information for your captain. 
                  If you have any questions or special requests, please don't hesitate to reach out.
                </div>
              </div>
              
              <p class="signature">
                We look forward to welcoming you aboard!<br><br>
                <span class="company-name">Kings Of The Sea Yachts</span>
              </p>
            </div>
            
            <div class="email-footer">
              <p class="email-footer-text">
                Questions? Reply to this email or contact us at ${FROM_EMAIL}
              </p>
              <p class="company-name">Kings Of The Sea Yachts</p>
            </div>
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
