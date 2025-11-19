# Booking Request Workflow - Setup Guide

## Overview

This implementation automates the booking request workflow:

1. Admin clicks **Approve** → Payment link generated → Email sent → Customer pays → Auto-confirmed
2. Admin clicks **Deny** → Reason collected → Email sent → Booking denied

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Resend Email Service (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=bookings@kossailing.com  # Must be verified in Resend
RESEND_FROM_NAME=KOS Yacht Club

# Stripe (Already configured)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_LIVE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Base URL (Already configured)
NEXT_PUBLIC_BASE_URL=https://www.kosyachts.com
```

## Setup Instructions

### 1. Install Resend Package

```bash
npm install resend
```

### 2. Set Up Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (100 emails/day free tier)
3. Create API key and add to `.env.local`
4. Verify your sending domain or use their test domain
5. Update `RESEND_FROM_EMAIL` in `.env.local`

### 3. Verify Stripe Webhook

Ensure your Stripe webhook endpoint is configured to receive:

- `checkout.session.completed` events
- `payment_intent.succeeded` events

The webhook handler at `/api/webhook/stripe` will automatically:

- Detect request booking payments
- Update booking status to CONFIRMED
- Update payment status to PAID
- Send confirmation email

## Files Created/Modified

### New Files

- `shared/services/email.service.ts` - Email service with Resend
- `shared/utils/base-url.ts` - Base URL utility
- `features/bookings/actions/stripe-payment-links.ts` - Stripe payment link creation
- `features-admin/bookings/actions/admin-booking-actions.ts` - Admin action functions
- `features-admin/bookings/components/BookingActionButtons.tsx` - UI component for approve/deny

### Modified Files

- `features-admin/bookings/booking.service.ts` - Added `updatePaymentLinkId` method
- `features-admin/bookings/components/ModernBookingsTable.tsx` - Added action buttons
- `app/(protected)/(admin)/admin/bookings/page.tsx` - Added refresh handler
- `app/api/webhook/stripe/route.ts` - Added request booking payment handler

## How It Works

### Approve Flow

1. Admin clicks "Approve" button on PENDING REQUEST booking
2. System generates Stripe payment link
3. Payment link ID stored in booking record
4. Booking status updated to APPROVED
5. Email sent to customer with payment link
6. Customer pays via Stripe
7. Webhook fires → Booking status → CONFIRMED, Payment → PAID
8. Confirmation email sent automatically

### Deny Flow

1. Admin clicks "Deny" button
2. Dialog opens asking for reason
3. Admin enters reason
4. Booking status updated to DENIED
5. Email sent to customer with denial reason

## Testing

### Test Email Service

```typescript
// In a test file or server action
import { sendBookingApprovalEmail } from "@/shared/services/email.service";

// Test with a real booking
const testBooking = await bookingService.getBookingById("booking-id");
await sendBookingApprovalEmail(testBooking, "https://payment-link-url.com");
```

### Test Payment Link Creation

```typescript
import { createPaymentLinkForBooking } from "@/features/bookings/actions/stripe-payment-links";

const paymentLink = await createPaymentLinkForBooking("booking-id");
console.log("Payment Link:", paymentLink);
```

### Test Admin Actions

1. Create a test booking request
2. Go to admin bookings page
3. Find PENDING REQUEST booking
4. Click Approve/Deny buttons
5. Check email inbox for sent emails

## Troubleshooting

### Emails Not Sending

- Check `RESEND_API_KEY` is set correctly
- Verify `RESEND_FROM_EMAIL` is verified in Resend dashboard
- Check console logs for error messages
- Resend has 99%+ deliverability, but check spam folder

### Payment Links Not Working

- Verify Stripe API keys are correct (test vs live)
- Check webhook endpoint is configured in Stripe dashboard
- Verify webhook secret matches `STRIPE_WEBHOOK_SECRET`
- Check Stripe dashboard for webhook delivery logs

### Booking Status Not Updating

- Check webhook is receiving events (Stripe dashboard)
- Verify webhook handler logs in console
- Check database directly for booking status
- Ensure `bookingId` is in payment link metadata

## Next Steps

1. **Set up Resend account** and verify domain
2. **Test approve flow** with a test booking
3. **Monitor email deliverability** in Resend dashboard
4. **Monitor webhook delivery** in Stripe dashboard
5. **Consider adding email templates** for better branding (optional)

## Optional Enhancements

- Add email templates with branding
- Add SMS notifications via Twilio
- Add payment link expiration tracking
- Add admin dashboard for email status
- Add retry logic for failed emails
