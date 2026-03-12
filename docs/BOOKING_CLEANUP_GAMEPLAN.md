# Booking System Cleanup — Game Plan

After exploring the codebase, here's what exists and how to clean it up.

---

## ✅ COMPLETED (Latest Session)

1. **Payment join fix** — Replaced `leftJoin(payments)` with correlated subqueries for `paymentStatus`/`paymentMethod` to avoid duplicate rows. Payment status filter now uses `EXISTS` subquery.
2. **updateBooking fix** — Removed writes to non-existent columns (`cleaningFee`, `captainFee`, etc. on `bookings`). Pricing updates go only to `booking_pricing`. Manual override updates `booking_pricing` only.
3. **fetchBoatAndTier helper** — Created `features/bookings/booking-helpers.ts`. Used in `createAdminBooking`, `createBookingRequest`, `createInstantBooking`.
4. **Stripe webhook uses createInstantBooking** — Refactored `handleInstantBookingPayment` to call `bookingService.createInstantBooking` with `pricingOverrideCents` from metadata. Single source of truth for instant booking creation.
5. **createInitialHistory used consistently** — All new booking creation now uses `bookingStatusService.createInitialHistory` with appropriate reason. Removed 7 direct `db.insert(bookingStatusHistory)` calls from booking.service.
6. **Draft acceptance through status service** — Added `bookingStatusService.acceptDraft()`, refactored `acceptDraftBookings` to use it. Draft acceptance now goes through status service.
7. **updateBookingStatus delegates to status service** — Uses `forceSetStatus` for consistency.
8. **GHL webhook pricing** — request.ts now uses `calculateBookingPriceFromDollars` instead of manual `subtotal * 0.035`.

---

## Current State Summary

### What You Have

| Layer | Components |
|-------|------------|
| **Tables** | `bookings`, `booking_pricing`, `booking_status_history`, `booking_admin_note`, `booking_ops`, `booking_group`, `payments` |
| **Services** | `booking.service`, `booking-status.service`, `booking-pricing.service`, `booking-notes.service`, `booking-ops.service`, `booking-invoice.service` |
| **Actions** | `booking.mutations`, `admin-booking-actions`, `booking-ops.actions`, route handlers (instant, request, webhooks) |

### Booking Ops (Your New Addition)

`booking_ops` = post-trip admin tracking (duration, expenses, revenue, crew, commissions, contract signed, etc.). It's a 1:1 extension of `bookings` for operational data that doesn't belong in the main booking or pricing tables. Good separation.

---

## Critical Bugs (Fix First)

### 1. Payment join returns duplicate rows
**Where:** `booking.service.ts` ~lines 658–672  
**Problem:** `leftJoin(payments, ...)` can return multiple rows per booking when there are multiple payments. Pagination and counts are wrong.  
**Fix:** Use a subquery or lateral join to get one payment per booking (e.g. latest by `created_at`).

### 2. `updateBooking` writes to removed columns
**Where:** `booking.service.ts` ~lines 1465–1491  
**Problem:** Sets `cleaningFee`, `captainFee`, `serviceFee`, `totalAmount`, `depositAmount` on `bookings` — these were removed in migration 0014. Pricing lives in `booking_pricing` now.  
**Fix:** Remove those fields from the update; only update `booking_pricing` via the pricing service.

---

## High-Priority Cleanup

### 3. Consolidate pricing calculation
- `calculateBookingPrice` (dollars, deprecated) vs `calculateBookingPriceFromDollars` vs `calculateBookingPriceCents`
- GHL webhook recalculates service fee manually instead of using shared utils
- **Fix:** Use cents-based helpers everywhere; remove deprecated dollar-based ones.

### 4. Centralize boat + tier fetch
- Repeated in: `createAdminBooking`, `createDraftBookings`, `createBookings`, `createBookingRequest`, `createInstantBooking`, webhook
- **Fix:** Add `fetchBoatAndTier(boatId, pricingTierId)` helper.

### 5. Route all status changes through `bookingStatusService`
- Draft acceptance in `booking.service.acceptDraftBookings` updates status directly
- Some flows bypass the status service
- **Fix:** Add `acceptDraft(bookingId)` (or similar) to `bookingStatusService` and use it everywhere.

### 6. Instant booking creation is duplicated
- `booking.service.createInstantBooking` exists but is unused
- Stripe webhook has its own insert logic
- **Fix:** Call `createInstantBooking` from the webhook; remove duplicated logic.

---

## Medium-Priority Cleanup

### 7. Unify mutations vs actions
- `booking.mutations.ts`: update, delete, createAdmin, updateStatus
- `admin-booking-actions.ts`: approve, deny, assign, markContacted, etc.
- **Fix:** Define a clear split (e.g. mutations = CRUD, actions = workflows) or merge into one module.

### 8. Implement `getAllBookingsNew` and deprecate `getAllBookings`
- `getAllBookings` is marked deprecated; `getAllBookingsNew` is referenced but not implemented
- **Fix:** Implement `getAllBookingsNew` with correct payment join, migrate callers, remove old method.

### 9. Use `createInitialHistory` consistently
- `bookingStatusService.createInitialHistory` exists but isn't used
- `booking.service` inserts status history directly in multiple places
- **Fix:** Use `createInitialHistory` everywhere.

---

## Lower-Priority / Nice-to-Have

### 10. `booking_ops` vs `booking_pricing` vs `payment`
- Document: ops = post-trip admin; pricing = snapshot at booking; payment = actual money
- Add a short comment in schema or a README.

### 11. EXPIRED status
- `bookingStatusService.expire()` exists but is never called
- Either add a cron/job to expire old drafts, or remove/simplify.

### 12. `updatePaymentLinkId` no-op
- Kept for compatibility; payment link ID lives in `payments` now
- Remove or document as deprecated.

---

## Suggested Order of Work

| Phase | Tasks | Risk |
|-------|-------|------|
| **1. Bug fixes** | #1 Payment join, #2 updateBooking columns | Medium — test pagination and admin edit flows |
| **2. Consolidation** | #3 Pricing, #4 Boat+tier helper, #5 Status service | Low |
| **3. Deduplication** | #6 Instant booking, #9 createInitialHistory | Low |
| **4. Structure** | #7 Mutations/actions, #8 getAllBookingsNew | Low |
| **5. Polish** | #10–12 Docs, expire, no-ops | Minimal |

---

## Files to Touch

| File | Changes |
|------|---------|
| `booking.service.ts` | Payment join, updateBooking, boat+tier helper, use createInstantBooking from webhook |
| `booking-status.service.ts` | Add acceptDraft, ensure all transitions go through here |
| `booking-pricing.service.ts` | Already clean; ensure all callers use it |
| `shared/lib/utils/pricing-utils.ts` | Deprecate dollar-based; standardize on cents |
| `app/api/webhooks/stripe/route.ts` | Use createInstantBooking; use pricing utils |
| `features/bookings/request.ts` (or similar) | Use pricing utils |
| `booking.mutations.ts` + `admin-booking-actions.ts` | Unify or document split |

---

## Quick Wins (Do Anytime)

- Add `fetchBoatAndTier()` helper
- Remove `updateBooking` writes to non-existent columns
- Replace manual service fee calc in GHL webhook with `calculateBookingPriceCents`

---

Ready to start? I'd begin with **#1 (payment join)** and **#2 (updateBooking)** since they're actual bugs, then move to the consolidation work.
