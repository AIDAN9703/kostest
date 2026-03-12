# KOS App — Understanding Confirmation

I've completed a full sweep of the codebase. Here's my confirmation of understanding.

---

## What the App Is

**KOS Yachts** (Kings Of The Sea) — premium yacht charter marketplace at kosyachts.com.

Users browse boats → inquire or book → pay → charter experience. Four roles: **customers** (browse/book), **admins** (full control), **boat owners** (own boats, future Stripe Connect), **captains** (assigned to bookings).

---

## How It's Supposed to Work

1. **REQUEST:** Customer submits → PENDING → Admin approves/denies → Payment link email → Customer pays → CONFIRMED
2. **INSTANT:** Customer pays at Stripe Checkout → Webhook creates booking → CONFIRMED
3. **DRAFT (admin-initiated):** Admin creates → Publishes link → Customer accepts → Pays (invoice or link) → CONFIRMED

All status flows: PENDING → APPROVED → CONFIRMED → COMPLETED (with DENIED/CANCELLED/REFUNDED/EXPIRED as terminal). Pricing in cents. One payment per booking in list views. All status changes go through `bookingStatusService`.

---

## How It Currently Works (Warts)

- **Booking creation:** 4 paths (admin single, admin draft/multi, request, instant) with duplicated logic
- **Status:** Draft acceptance bypasses status service; status changes scattered
- **Pricing:** Mix of dollars and cents; GHL webhook recalculates manually
- **Payments:** `leftJoin(payments)` duplicates rows → wrong pagination
- **Boat+tier fetch:** Repeated in 6+ places
- **Instant:** Webhook has its own insert logic; `createInstantBooking` unused
- **updateBooking:** Writes to removed columns (cleaningFee, etc. on `bookings`)

---

## How It Needs to Work (Ideal)

- Single `fetchBoatAndTier()` helper
- Cents-based pricing only; shared `calculateBookingPriceCents`
- All status changes via `bookingStatusService`
- Webhook uses `createInstantBooking`; no duplicate logic
- Payment join: subquery/lateral for one payment per booking
- `updateBooking` only touches `booking_pricing`; no writes to removed columns
- `createInitialHistory` used on all new bookings
- `getAllBookingsNew` implemented; migration from deprecated `getAllBookings`

---

## Scope of Fixes I'll Make

1. **Critical bugs:** Payment join, updateBooking columns
2. **Consolidation:** Pricing helpers, fetchBoatAndTier, status service routing
3. **Deduplication:** Instant booking from webhook, createInitialHistory
4. **Structure:** Mutations vs actions clarity, getAllBookingsNew

I will NOT change: schema migrations, auth flow, GHL/Stripe webhook contracts, or UI components — unless directly tied to a bug fix.

---

**Confirmed.** Proceeding with fixes.
