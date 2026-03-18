# Booking & Booking Group Creation Flow — Walkthrough & Analysis

This document walks through the creation flow file-by-file and function-by-function, then identifies inconsistencies, poor structure, and improvement opportunities.

**Last updated**: Applied fixes for specialRequests removal, add-on validation, parseJson, userId types, BookingDetails cast, and stale deps.

---

## 1. Entry Points (Pages)

### `app/(protected)/admin/bookings/create/page.tsx`
- **Flow**: Server component fetches `pricingTiers` via `boatService.getAllActivePricingTiers()`, passes to `SingleBookingForm`.
- **Data**: Pricing tiers for all boats (used before boat selection).

### `app/(protected)/admin/bookings/create-group/page.tsx`
- **Flow**: Same pattern — fetches pricing tiers, passes to `GroupBookingForm`.
- **Note**: Both pages are nearly identical; could be consolidated with a route param or shared layout.

---

## 2. Data Fetching

### `features/boats/boat.service.ts` → `getAllActivePricingTiers()`
```typescript
async getAllActivePricingTiers() {
  return db.select({ id, boatId, hours, price, name, isDefault })
    .from(boatPricingTiers)
    .where(eq(boatPricingTiers.isActive, true))
    .orderBy(boatPricingTiers.hours);
}
```
- Returns all active tiers across all boats.
- Used to populate tier dropdowns and compute `tiersByBoat` on the client.

---

## 3. Form Components

### `SingleBookingForm.tsx`
**State**: Customer (type, userId, name, email, phone), section (boat, tier, dates, pricing), pickup/dropoff, adminNotes, lineItems, payment options.

**Payload construction** (lines 120–135):
```typescript
const payload = [{
  boatId: section.boatId,
  usePricingTier: section.usePricingTier,
  pricingTierId: section.usePricingTier ? section.pricingTierId || null : null,
  basePrice: section.basePrice,
  depositAmount: section.depositAmount ?? null,
  customerName, customerEmail, customerPhone,
  userId: selectedUserId || null,
  startDateTime: section.startDateTime,
  endDateTime: section.endDateTime || null,
}];
```
- **Issue**: `specialRequests` is never set. The action reads `formData.get("specialRequests")` but the form never provides it → always `null`.

**FormData keys**: `bookings`, `lineItems`, `numberOfPassengers`, `pickupLocation`, `dropoffLocation`, `adminNotes`, `allowPayment`, `paymentType`, `sendProposalEmail`, `sendProposalSms`.
- **Missing**: `specialRequests`.

### `GroupBookingForm.tsx`
**State**: Same as single, plus `sections[]`, `groupName`.

**Payload construction** (`resolvePayload`):
- For each section, resolves customer (first vs per-section) and dates (shared vs per-section).
- Uses `sameUserAsAbove` and `sameAsFirstBooking` to inherit from first booking.
- **Issue**: Same `specialRequests` gap as single form.

**Add-ons**: Only first booking gets line items (`idx === 0` in preview and service). Other bookings in the group have no add-ons.

---

## 4. Shared Form Components

### `BookingSectionFields.tsx`
- Boat select, pricing tier toggle, tier/price inputs, date/time.
- **Pricing tier**: When `usePricingTier` is true, only start date shown; end is derived from tier hours.
- **Custom pricing**: Both start and end required.
- **Duration validation**: `getDuration()` checks end > start.

### `CustomerFields.tsx`
- Radio: existing user vs guest.
- Existing: `UserSelect` + passengers.
- Guest: name, email, phone, passengers.
- **Issue**: `numberOfPassengers` is duplicated in both branches; could be lifted.

### `AddOnsFields.tsx`
- Table of add-ons: name, unitPrice, quantity.
- **Issue**: No validation for empty `name` or zero `unitPrice`; can create invalid add-ons.
- **Issue**: `key={idx}` on rows — use stable IDs if items can be reordered.

### `DraftOptionsSidebar.tsx`
- Summary preview, allow payment toggle, payment type, send email/SMS toggles, submit button.
- **Issue**: `preview` uses `index` as key; could use `boat.id` or similar when available.

---

## 5. Types (`booking-forms/types.ts`)

### `BookingSectionData`
```typescript
interface BookingSectionData {
  boatId: string;
  usePricingTier: boolean;
  pricingTierId: string;  // Can be "" when not using tier
  boat?: BoatForAdminSelect | null;
  basePrice: number;
  depositAmount: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId: string;  // Can be "" — type says string, not string | null
  startDateTime: string;
  endDateTime: string;  // Can be "" when using tier (derived from tier)
}
```
- **Inconsistency**: `userId` is `string` but often `""`; payload sends `null` when empty. Schema expects `string | null`.
- **Inconsistency**: `pricingTierId` and `endDateTime` can be `""`; types don’t reflect that.

### `GroupSectionData`
- Extends `BookingSectionData` with `sameUserAsAbove`, `sameAsFirstBooking`.

---

## 6. Server Action

### `create-bookings.actions.ts`

**`parseJson<T>()`** (lines 19–25):
- Generic JSON parser with fallback.
- **Issue**: Swallows parse errors and returns fallback; no logging.
- **Issue**: `as T` cast — no runtime validation of shape.

**`createBookingsAction`**:
1. Auth check.
2. Extract FormData: `bookings`, `lineItems`, `sendProposalEmail`, `sendProposalSms`.
3. `parseJson` for `bookings` and `lineItems` with inline types.
4. Build payload and run `createBookingsSchema.parse()`.
5. Call `bookingService.createBookings()`.
6. If `publishNow`, send email/SMS (fire-and-forget `.catch()`).
7. Return `{ bookingIds, publicToken, groupId, proposalSent }`.

**Type mismatch**: Action’s inline type for `bookingsData` omits `usePricingTier`; form sends it. Zod schema includes it, so validation passes, but the action type is incomplete.

**`specialRequests`**: Read from FormData but never set by forms → always `null`.

---

## 7. Validation Schema

### `booking.validation.ts` → `createBookingsSchema`
- `numberOfPassengers`, `pickupLocation`, `dropoffLocation`, `specialRequests`, `adminNotes`, `bookings[]`, `lineItems[]`, `groupName`, `allowPayment`, `paymentType`, `sendProposalEmail`, `sendProposalSms`, `publishNow`.
- `bookingSectionSchema`: boatId, usePricingTier, pricingTierId, basePrice, depositAmount, customerName, customerEmail, customerPhone, userId, startDateTime, endDateTime.
- **Refinements**: usePricingTier → pricingTierId required; custom pricing → endDateTime and basePrice required.

### `bookingAddOnSchema`
- `name: z.string()` — allows `""`.
- `unitPrice: z.number().min(0)` — allows 0.
- **Issue**: No `.min(1)` for name or unitPrice; invalid add-ons can pass validation.

---

## 8. Booking Service

### `booking.service.ts` → `createBookings()`

**Flow**:
1. Fetch boats and tiers in bulk.
2. If `bookings.length > 1` or `groupName`, create `booking_group`.
3. Generate `publicToken` (single UUID for draft link).
4. For each booking:
   - Resolve boat and tier.
   - Compute base price (tier or custom).
   - Resolve end datetime (explicit or from tier hours).
   - Add-ons only for first booking (`i === 0`).
   - Compute pricing via `calculateBookingPriceCents()`.
   - Insert booking row.
   - Create `booking_pricing` via `bookingPricingService.createPricingWithCalculation()`.
   - Create status history.
5. If `publicToken`, log draft published event.

**Observations**:
- No transaction; partial failure can leave inconsistent state.
- `publicToken` only on first booking; others use `null` — correct for group drafts.
- `numberOfPassengers` shared across all bookings in group.
- `specialRequests`, `pickupLocation`, `dropoffLocation`, `adminNotes` shared.

---

## 9. Booking Group Service

### `booking-group.service.ts` → `create()`
- Inserts `booking_groups` with `name`, `notes`, `createdById`.
- Group name default: `"Booking Group ${now.toLocaleDateString()}"` when not provided.

---

## 10. Booking Pricing Service

### `createPricingWithCalculation()`
- Uses `calculateBookingPriceCents(basePriceCents, cleaningFeeCents, captainFeeCents)`.
- Applies tax/discount, writes to `booking_pricing`.

---

## Summary of Issues

### Critical / Data
1. **`specialRequests` never captured** — Forms don’t include it; action/schema support it.
2. **No transaction** — `createBookings()` can partially fail (e.g. group created, some bookings not).
3. **Add-on validation** — Empty names and zero unit prices allowed.

### Type / Structure
4. **`parseJson` type cast** — Uses `as T`; no runtime validation.
5. **`BookingSectionData.userId`** — Typed as `string` but used as `string | ""`; payload sends `null`.
6. **Action inline type** — Omits `usePricingTier`; diverges from schema and form.
7. **`as unknown as BookingDetails`** — In `getBookingById`; indicates type mismatch.

### UX / Logic
8. **`numberOfPassengers` in `CustomerFields`** — Duplicated in both branches; could be shared.
9. **Group add-ons** — Only first booking gets add-ons; unclear if intentional.
10. **`customerType` in `handleSubmit` deps** — In SingleBookingForm but not used in submit; stale deps.

### Minor
11. **`key={index}`** — In lists; use stable IDs where possible.
12. **Fire-and-forget email/SMS** — Errors only logged; no user feedback.
13. **`create` vs `create-group` pages** — Nearly identical; could share layout.

---

## Applied Fixes (Completed)

1. ~~Add `specialRequests` field~~ — **Removed** per product decision; removed from all instances.
2. ~~Transaction~~ — **Skipped** (Neon HTTP driver doesn't support transactions).
3. **Add-on validation** — `name.min(1)`, `unitPrice.min(0.01)` in `bookingAddOnSchema`.
4. **parseJson** — Replaced with `parseAndValidateBookings` and `parseAndValidateLineItems` using Zod schemas.
5. **userId type** — `BookingSectionData.userId` now `string | null`; `createEmptyBookingSection` uses `null`.
6. **BookingDetails cast** — Removed `as unknown as`; added `bookingGroupId`/`bookingGroupName` to select.
7. **Stale deps** — Removed `customerType` from `SingleBookingForm` handleSubmit deps.

## Remaining Recommendations

1. **Transaction alternative**: Neon HTTP has a `transaction()` for batched queries (non-interactive). Drizzle may not fully support it. Alternatives: (a) saga/compensation — on partial failure, delete created group and bookings; (b) if you can switch to Neon's WebSocket/serverless driver, full transactions are supported.
2. **Email/SMS failures**: Surface to user (e.g. "Booking created but notification failed") instead of fire-and-forget.
3. **Group add-ons**: Document that add-ons apply only to first booking, or extend to support per-booking add-ons.

---

## Architectural Recommendations for App Scale

For an app of this size, modern teams typically:

### 1. **Feature-based structure** (you already have this)
- `features/bookings`, `features/boats`, etc. — keep domain logic colocated.
- Consider a `features/bookings/api` or `features/bookings/routes` for route handlers that live in the feature.

### 2. **Server actions vs API routes**
- **Server actions** (what you use): Good for forms, mutations, RPC-style. Keep them thin — parse, validate, delegate to services.
- **API routes**: Use for webhooks, third-party integrations, or when you need REST/JSON contracts.
- Your split is reasonable; avoid duplicating logic between actions and routes.

### 3. **Service layer**
- `booking.service.ts` as single source of truth for DB operations is good.
- Consider extracting **use cases** (e.g. `CreateDraftBookingUseCase`) when a flow spans multiple services and has non-trivial logic. Keeps services focused on CRUD.

### 4. **Validation**
- Zod at the boundary (actions, API routes) — you do this.
- Consider shared schemas: `bookingSectionSchema` is reused; ensure `CreateBookingsInput` is always derived from the schema (`z.infer`) rather than hand-written types.

### 5. **Error handling**
- Standardize error shapes: `{ success: false, error: string, code?: string }`.
- Use custom error classes (e.g. `ValidationError`, `NotFoundError`) for consistent handling and logging.

### 6. **Database**
- Neon HTTP: No transactions. Options:
  - **Saga pattern**: On failure, run compensating actions (delete created records).
  - **Neon serverless driver**: If you can switch, it supports transactions.
  - **Idempotency**: Use idempotency keys for critical flows to allow safe retries.

### 7. **Testing**
- Unit tests for services (mock DB).
- Integration tests for critical flows (create booking, accept draft).
- E2E for main user journeys.

### 8. **Documentation**
- Keep this flow doc updated when flows change.
- Add JSDoc for public service methods and action signatures.
