# Booking Flow – Database Schema Audit

> Audit completed during booking flow refactor. Use this as a reference for schema improvements.

---

## 1. Critical Issues

### 1.1 Payment Join Produces Duplicate Rows

**Location:** `booking.service.ts` – `getAllBookings` (and similar queries)

**Issue:** The `payments` table is joined with a plain `leftJoin`:

```ts
.leftJoin(payments, and(
  eq(payments.payableType, 'BOOKING'),
  eq(payments.payableId, bookings.id)
))
```

When a booking has multiple payments (e.g., deposit + remainder), you get multiple rows per booking. Pagination and counts are wrong.

**Fix:** Use a subquery or lateral join to get exactly one payment per booking (e.g., latest by `created_at` or `processed_at`).

---

### 1.2 Payment Status Filter Is Ambiguous

**Issue:** When filtering by `paymentStatus`, the condition `eq(payments.status, filters.paymentStatus)` is applied. With multiple payments per booking, which payment's status counts? The join also multiplies rows, so the filter semantics are unclear.

**Fix:** Resolve the join issue first; then define how "booking payment status" is derived (e.g., latest payment, or aggregate across payments).

---

### 1.3 `booking.payment_type` Is Plain Text, Not Enum

**Location:** `bookings.table.ts` line 52

```ts
paymentType: text("payment_type").default("FULL_PAYMENT"), // "DEPOSIT_ONLY" | "FULL_PAYMENT"
```

**Issue:** No DB constraint; any string can be stored. The `paymentTypeEnum` exists but is used for the `payments` table (DEPOSIT, FULL_PAYMENT, etc. as payment types), not for this booking-level field.

**Fix:** Add a dedicated enum for booking payment type (e.g., `DraftPaymentType`) or document that this is intentionally free-form.

---

## 2. Architectural / Design Issues

### 2.1 Mixed Monetary Units

| Table / Source | Unit | Type |
|----------------|------|------|
| `boat_pricing_tier.price` | Dollars | `doublePrecision` |
| `boat.cleaning_fee` | Dollars | `doublePrecision` |
| `boat.deposit_amount` | Dollars | `doublePrecision` |
| `booking_pricing.*` | Cents | `bigint` |
| `payments.amount_cents` | Cents | `bigint` |
| `booking_ops.*` | Cents | `bigint` |

**Issue:** Boats and tiers use dollars; bookings and payments use cents. Conversion happens in application code, increasing risk of rounding errors and unit confusion.

**Recommendation:** Standardize on cents everywhere. Migrate boats/tiers to cents and update application code.

---

### 2.2 Add-ons Stored as JSON

**Location:** `bookings.add_ons` (JSON)

**Issue:** Add-ons are stored as unstructured JSON. Hard to query, aggregate revenue by add-on, or enforce schema.

**Recommendation:** Consider a `booking_line_item` table (booking_id, name, unit_price_cents, quantity) if add-ons become important for reporting.

---

### 2.3 `boat_pricing_tier` Uniqueness on `(boat_id, hours)`

**Location:** `boatPricingTiers.table.ts` line 26

```ts
unique("boat_pricing_unique_idx").on(table.boatId, table.hours)
```

**Issue:** Only one tier per boat per hour value. Cannot have two 4-hour tiers at different prices (e.g., weekday vs weekend).

**Recommendation:** If needed, add a dimension (e.g., `tier_type`, `day_type`, or `valid_from`/`valid_to`) and include in the unique constraint.

---

### 2.4 `booking_ops` – Legacy / Unclear Purpose

**Location:** `bookingOps.table.ts`

**Issue:** Operational fields (duration, expense, revenue, balances, crew, etc.) live in a separate table. Unclear when/how it's populated and overlaps with `booking_pricing` and `payments`.

**Recommendation:** Document the intended use of `booking_ops`. If legacy, plan migration into `booking_pricing` or a clearer operational model.

---

## 3. Minor Issues

### 3.1 `customer_phone` Required but Often Empty

**Location:** `bookings.table.ts` line 31

```ts
customerPhone: text("customer_phone").notNull(),
```

**Issue:** `.notNull()` forces a value, but the app often passes `""`. The constraint doesn't match real usage.

**Fix:** Use `.default("")` or make the column nullable if phone is optional.

---

### 3.2 `booking_group` Has No `updated_at` Semantics

**Location:** `bookingGroups.table.ts`

**Issue:** `updatedAt` exists but there's no clear definition of what updates it (e.g., group name, notes, membership). May not reflect real changes.

**Recommendation:** Ensure any mutation that changes group data updates `updatedAt`, or document that it's not used.

---

### 3.3 `lineItemTypeEnum` Unused in Schema

**Location:** `payment.enums.ts` – `lineItemTypeEnum`

**Issue:** Enum is defined but not referenced in any table. `booking_pricing` uses separate columns (basePriceCents, cleaningFeeCents, etc.) instead of line items.

**Recommendation:** Remove if unused, or introduce a line-item model that uses it.

---

## 4. Good Practices Observed

- **`booking_pricing`** separated from `bookings` – clean separation of concerns
- **`booking_status_history`** – full audit trail for status changes
- **`booking_admin_notes`** – replaces single "contacted" flag with note history
- **Cents** used for `booking_pricing` and `payments` – avoids float issues
- **Indexes** on common filters (status, boat, user, datetime, etc.)
- **`pricingTierId`** nullable – supports custom pricing without tier
- **`booking_group_id`** – supports multi-boat groups
- **`public_token`** unique – safe shareable draft links
- **`timestamptz`** – proper timezone handling for datetimes

---

## 5. Summary Table

| Severity | Issue | Location |
|----------|-------|----------|
| Critical | Payment join duplicates rows | `booking.service.ts` |
| Critical | Payment status filter ambiguous | `booking.service.ts` |
| Critical | `payment_type` unconstrained text | `bookings.table.ts` |
| Medium | Mixed dollars/cents across tables | boats, tiers vs booking_pricing |
| Medium | Add-ons as JSON | `bookings.add_ons` |
| Medium | `(boat_id, hours)` uniqueness limits tiers | `boatPricingTiers` |
| Medium | `booking_ops` purpose unclear | `bookingOps.table.ts` |
| Minor | `customer_phone` notNull vs empty string | `bookings.table.ts` |
| Minor | `lineItemTypeEnum` unused | `payment.enums.ts` |

---

## 6. Line-by-Line Review: `bookings.table.ts`

### Imports (lines 1–3)

| Line | Code | Notes |
|------|------|-------|
| 1 | `pgTable, uuid, text, boolean, timestamp, index, json, integer, unique` | All used. `json` for add_ons. |
| 2 | `users, boats, boatPricingTiers, generalInquiries, bookingGroups` | FK targets. |
| 3 | `bookingStatusEnum, bookingTypeEnum, bookingSourceEnum` | Used. `bookingSourceEnum` has no default in schema—see line 12. |

---

### Table definition start (line 5)

| Line | Code | Notes |
|------|------|-------|
| 5 | `pgTable("booking", {` | Table name `booking` (singular). Matches convention. |

---

### Core booking information (lines 6–12)

| Line | Code | Notes |
|------|------|-------|
| 9 | `id: uuid("id").defaultRandom().notNull().primaryKey()` | Standard. |
| 10 | `bookingType: bookingTypeEnum(...).default("EXTERNAL_BOOKING").notNull()` | REQUEST, INSTANT_BOOK, EXTERNAL_BOOKING. Default fits admin-created. |
| 11 | `bookingStatus: bookingStatusEnum(...).default("PENDING").notNull()` | DRAFT, PENDING, APPROVED, etc. Default fits request flow. |
| 12 | `source: bookingSourceEnum("source").default("WEBSITE")` | WEBSITE, ADMIN, BROKER. No `.notNull()`—nullable. Default WEBSITE; admin-created should use ADMIN. |

---

### Relationships (lines 13–23)

| Line | Code | Notes |
|------|------|-------|
| 17 | `userId: uuid("user_id").references(() => users.id, { onDelete: "set null" })` | Customer (guest or user). Nullable for guest bookings. `set null` OK. |
| 18 | `boatOwnerId: uuid("boat_owner_id")...` | Denormalized from boat. Redundant with `boat.ownerId` but useful for queries. `set null` if owner deleted—risky. |
| 19 | `boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "restrict" })` | Required. `restrict` prevents deleting boat with bookings. |
| 20 | `captainUserId: uuid("captain_user_id")...` | Assigned captain. Nullable. |
| 21 | `pricingTierId: uuid("pricing_tier_id")...` | Nullable for custom pricing. `set null` if tier deleted—OK. |
| 22 | `bookingGroupId: uuid("booking_group_id")...` | For multi-boat groups. |
| 23 | `inquiryId: uuid("inquiry_id")...` | If converted from inquiry. |

---

### Customer information (lines 24–29)

| Line | Code | Notes |
|------|------|-------|
| 27 | `customerName: text("customer_name").notNull()` | Required. |
| 28 | `customerEmail: text("customer_email").notNull()` | Required. |
| 29 | `customerPhone: text("customer_phone").notNull()` | **Issue:** App often passes `""`. Consider `.default("")` or nullable. |

---

### Booking details (lines 30–44)

| Line | Code | Notes |
|------|------|-------|
| 34 | `isMultiDay: boolean("is_multi_day").notNull()` | Required. No default—must be set on insert. |
| 35 | `needsCaptain: boolean("needs_captain").default(false)` | Has default. |
| 36 | `startDateTime: timestamp(..., { mode: "date", withTimezone: true }).notNull()` | Required. `timestamptz` correct. |
| 37 | `endDateTime: timestamp(...)` | Nullable. Optional when tier defines duration. |
| 38 | `numberOfPassengers: integer("number_of_passengers").notNull()` | Required. No default—must be set. |
| 39 | `pickupLocation: text("pickup_location")` | Nullable. |
| 40 | `dropoffLocation: text("dropoff_location")` | Nullable. |
| 41 | `specialRequests: text("special_requests")` | Nullable. |
| 42 | `occasionType: text("occasion_type")` | Nullable. Unconstrained—no enum. |
| 43 | `addOns: json("add_ons")` | **Issue:** Unstructured JSON. See audit §2.2. |
| 44 | `adminNotes: text("admin_notes")` | Nullable. Internal notes. |

---

### Draft flow (lines 45–54)

| Line | Code | Notes |
|------|------|-------|
| 49 | `publicToken: uuid("public_token")` | Shareable link. Unique constraint at line 77. |
| 50 | `allowPayment: boolean("allow_payment").default(false).notNull()` | Has default. |
| 51 | `paymentType: text("payment_type").default("FULL_PAYMENT")` | **Issue:** Plain text. Should be enum. Values: "DEPOSIT_ONLY" \| "FULL_PAYMENT". |
| 52 | `publishedAt: timestamp` | When draft was shared. |
| 53 | `acceptedAt: timestamp` | When customer accepted. |
| 54 | `acceptedCustomerNote: text` | Note from customer on acceptance. |

---

### Admin workflow (lines 55–61)

| Line | Code | Notes |
|------|------|-------|
| 61 | `assignedAdminId: uuid("assigned_admin_id")...` | Current assignee. `set null` if admin deleted. |

---

### Cancellation (lines 62–67)

| Line | Code | Notes |
|------|------|-------|
| 66 | `cancelledAt: timestamp` | When cancelled. |
| 67 | `cancellationReason: text` | Free text. |
| 68 | `cancelledBy: uuid("cancelled_by")...` | Who cancelled. |

---

### Timestamps (lines 68–75)

| Line | Code | Notes |
|------|------|-------|
| 73 | `createdAt: timestamp(...).defaultNow().notNull()` | Standard. |
| 74 | `updatedAt: timestamp(...).defaultNow().notNull()` | Standard. Must be updated on mutations. |
| 75 | `expiresAt: timestamp` | Draft expiration. Nullable. |

---

### Indexes (lines 76–90)

| Line | Code | Notes |
|------|------|-------|
| 77 | `unique("booking_public_token_unique").on(table.publicToken)` | Needed for draft links. |
| 78 | `index("booking_type_idx").on(table.bookingType)` | For filtering. |
| 79 | `index("booking_status_idx").on(table.bookingStatus)` | For filtering. |
| 80 | `index("booking_source_idx").on(table.source)` | For filtering. |
| 81 | `index("booking_user_idx").on(table.userId)` | For "my bookings". |
| 82 | `index("booking_boat_idx").on(table.boatId)` | For boat calendar. |
| 83 | `index("booking_captain_idx").on(table.captainUserId)` | For captain assignments. |
| 84 | `index("booking_group_idx").on(table.bookingGroupId)` | For group queries. |
| 85 | `index("booking_public_token_idx").on(table.publicToken)` | Lookup by token. Unique already indexes. |
| 86 | `index("booking_inquiry_idx").on(table.inquiryId)` | For inquiry→booking. |
| 87 | `index("booking_datetime_idx").on(table.startDateTime, table.endDateTime)` | For date-range queries. |
| 88 | `index("booking_assigned_admin_idx").on(table.assignedAdminId)` | For "my bookings". |
| 89 | `index("booking_search_customer_idx").on(table.customerName, table.customerEmail)` | For search. |

**Note:** `booking_public_token_idx` may be redundant with `booking_public_token_unique` (unique implies index).

---

## 7. Booking Type & Status Deep Dive (Q&A)

### 7.1 Do we need REQUEST, INSTANT_BOOK, and EXTERNAL_BOOKING?

**Yes.** These are three distinct entry points:

| Type | Who | Flow | Initial Status |
|------|-----|------|----------------|
| **REQUEST** | Customer (website) | Customer submits request → owner/admin approves or denies → payment collected | PENDING |
| **INSTANT_BOOK** | Customer (website) | Customer pays at checkout → booking confirmed immediately | CONFIRMED |
| **EXTERNAL_BOOKING** | Admin | Admin creates draft or direct booking (phone/email/lead) | DRAFT or APPROVED |

**Enterprise alignment:** GetMyBoat and Boatsetter both have:
- **Request flow** – customer submits, owner approves, then payment
- **Instant book** – pay and confirm in one step
- **Admin/external** – bookings created outside the website

---

### 7.2 DRAFT vs "DRAFT (Proposal Sent)" – Your Idea Is Right

**Current state:** We use one status `DRAFT` and infer "sent" from `publishedAt` and `publicToken`:
- Draft created, not sent: `publicToken = null`, `publishedAt = null`
- Draft sent to customer: `publicToken` set, `publishedAt` set

**Your proposal:** Split into two statuses, e.g.:
- `DRAFT` – Admin created, not yet sent
- `DRAFT_PUBLISHED` or `PENDING_ACCEPTANCE` – Link sent to customer, awaiting acceptance

**Why this is better:**
1. **Querying** – "Show me all drafts awaiting customer response" = `status = DRAFT_PUBLISHED`
2. **Lifecycle clarity** – Status reflects business state, not just presence of a token
3. **Matches proposals** – Same idea as "proposal sent" in the old flow
4. **Enterprise pattern** – Boatsetter has Inquiry → Pre-Approved → Pending → Approved; we’d have Draft → Published → Accepted

**Recommendation:** Add `DRAFT_PUBLISHED` (or `PENDING_ACCEPTANCE`). Transition: `DRAFT` → `DRAFT_PUBLISHED` when `publishDraftBookings` is called (or when `publishNow` is true on create). Customer acceptance: `DRAFT_PUBLISHED` → `APPROVED`.

---

### 7.3 What is PENDING For?

**PENDING = "Awaiting owner/admin approval"** (request flow only).

Flow:
1. Customer submits booking request (with payment info held)
2. Booking created with `bookingType: REQUEST`, `bookingStatus: PENDING`
3. Owner/admin approves → `APPROVED` (or denies → `DENIED`)
4. Payment is then collected (or was pre-authorized)

**Boatsetter:** "You have submitted your payment information and the owner can choose to approve or decline the booking request. Pending requests expire after 72 hours."

**Our usage:** Correct. `PENDING` is only for REQUEST bookings. Admin actions `approveBookingRequest` and `denyBookingRequest` require `bookingStatus === 'PENDING'`.

---

### 7.4 APPROVED vs CONFIRMED – Why Both?

**APPROVED** = "Owner said yes; payment not yet confirmed."
**CONFIRMED** = "Payment received; booking is locked in."

| Status | Meaning | Next step |
|--------|---------|-----------|
| **APPROVED** | Approved by owner/admin, payment pending | Collect payment → CONFIRMED |
| **CONFIRMED** | Payment received | Trip happens → COMPLETED |

**Why both matter:**
- **REQUEST flow:** PENDING → APPROVED (owner approves) → CONFIRMED (payment collected)
- **DRAFT flow:** DRAFT_PUBLISHED → APPROVED (customer accepts) → CONFIRMED (payment collected, if allowPayment)
- **INSTANT_BOOK:** Goes straight to CONFIRMED (payment at checkout)
- **EXTERNAL_BOOKING (admin direct):** Can go straight to APPROVED (no payment needed) or CONFIRMED

**Enterprise:** Boatsetter’s "Approved" = "accepted and fully confirmed... payment has been collected." So they use "Approved" where we use "Confirmed." Our split is more precise: approval (human) vs confirmation (payment).

---

### 7.5 Do We Need EXPIRED?

**Current use:**
- `VALID_TRANSITIONS`: PENDING → EXPIRED, APPROVED → EXPIRED
- `booking.expiresAt` exists for drafts (optional)
- No cron/scheduled job that actually sets EXPIRED
- `bookingStatusService.expire()` exists but nothing calls it

**Boatsetter:** They use EXPIRED for:
1. Pending request not approved within 72 hours
2. Rental date passed without approval/decline

**Recommendation:**
- **If you add expiration logic:** Keep EXPIRED. Use it when:
  - PENDING request exceeds approval window (e.g. 72h)
  - APPROVED booking exceeds payment window
  - DRAFT_PUBLISHED passes `expiresAt`
- **If you don’t track expirations:** You can drop EXPIRED and use CANCELLED with reason "Expired" instead. Simpler, but you lose a distinct terminal state for analytics.

**Pragmatic choice:** Keep EXPIRED in the enum, add a cron or event that sets it when `expiresAt` is past (for drafts) or when PENDING/APPROVED exceed their windows. If you never implement that, EXPIRED stays unused but harmless.

---

### 7.6 Mixing Concerns – What’s Actually Mixed?

**Two separate concepts are combined in one enum:**

1. **Lifecycle stage** – Draft, Pending, Approved, Confirmed, Completed, etc.
2. **Outcome** – Denied, Cancelled, Expired, Refunded

**Enterprise approach:** Some systems use:
- **Status** – lifecycle (Draft, Pending, Approved, Confirmed, Completed)
- **Resolution** or **Outcome** – terminal state (Denied, Cancelled, Expired, Refunded)

**Our model:** Single `bookingStatus` for both. That’s common and works, but it means:
- "Denied" and "Cancelled" are both terminal but mean different things
- "Expired" is terminal; "Refunded" can follow CANCELLED or COMPLETED

**Recommendation:** Keeping one enum is fine. The main fix is clarifying the draft flow with `DRAFT_PUBLISHED`. Optionally add a `resolution` or `outcome` field later for analytics.

---

### 7.7 Proposed Status Lifecycle (Enterprise-Style)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    BOOKING TYPES                         │
                    └─────────────────────────────────────────────────────────┘
REQUEST (customer):     PENDING → APPROVED → CONFIRMED → COMPLETED
                              ↘ DENIED
                              ↘ EXPIRED (72h no response)
                              ↘ CANCELLED
                                        APPROVED ↘ EXPIRED (payment window)
                                        APPROVED ↘ CANCELLED

INSTANT_BOOK:           CONFIRMED → COMPLETED
                              ↘ CANCELLED
                              ↘ REFUNDED

EXTERNAL_BOOKING:       DRAFT → DRAFT_PUBLISHED → APPROVED → CONFIRMED → COMPLETED
(draft flow)                  ↘ CANCELLED           ↘ CANCELLED
                              ↘ EXPIRED (expiresAt)  ↘ EXPIRED
                                                     ↘ REFUNDED

EXTERNAL_BOOKING:       APPROVED or CONFIRMED (admin creates, no draft)
(direct admin)
```

---

### 7.8 Gaps in Our Current Implementation

1. **DRAFT missing from `VALID_TRANSITIONS`** – Status service can’t transition to/from DRAFT. Draft create/accept is done directly in `booking.service`. Either add DRAFT to the transition map or document that draft flow bypasses the service.

2. **No DRAFT_PUBLISHED** – We infer "sent" from `publishedAt`. Adding an explicit status would make the lifecycle clearer.

3. **No expiration enforcement** – `expiresAt` is stored but not enforced. EXPIRED is never set automatically.

4. **Draft acceptance goes to APPROVED** – Correct. If payment is required, we’d need APPROVED → CONFIRMED when payment succeeds. The invoice flow exists; the status transition to CONFIRMED on payment success may need verification.
