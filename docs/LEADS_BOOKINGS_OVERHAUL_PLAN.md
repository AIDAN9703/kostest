# KOS App — Leads / Bookings / Ops / Payments Overhaul Plan

> **Purpose:** A precise, executable plan to fix the conceptual mess between inquiries, bookings,
> booking ops, and payments. Written for another engineer/model to execute step by step.
>
> **App type:** Single Next.js (App Router) + Drizzle ORM + Neon Postgres + Stripe + GoHighLevel
> (webhooks only). Single database. **Not** microservices. Use normal DB transactions — do **not**
> introduce sagas, outboxes, event-sourcing, or queues.

---

## 0. Guiding principles

1. **Incremental, not a rewrite.** Every phase must leave the app working. Additive schema first,
   behavior changes second, renames last.
2. **One system of record: KOS.** GoHighLevel stays a downstream automation layer (SMS/CRM/nurture).
   KOS owns leads, bookings, payments, ops. Never re-key data from GHL back into KOS.
3. **Leads ≠ Bookings.** A lead is pre-commit interest. A booking is a real trip record that enters
   the calendar, ops, and payments.
4. **The proposal/offer already exists.** Do **not** build a new `lead_offer` table. A `DRAFT`
   booking with `public_token` + `accepted_at` *is* the offer/quote. Reuse it.
5. **Payments ledger is the single source of truth for client money.** `booking_ops` keeps only
   *internal* reconciliation (owner payout, captain paid, expenses, commission, agent/source).

---

## 1. Current-state summary (verified)

### Booking creation paths (all funnel through `features/bookings/services/booking.service.ts`)
| Path | Entry file | Status set |
|------|-----------|------------|
| Instant checkout | `features/bookings/actions/instant.ts` → row created in `app/api/webhook/stripe/route.ts` | `CONFIRMED` |
| Booking request | `features/bookings/actions/request.ts` | `PENDING` |
| Admin single create | `features/bookings/components/admin/booking-forms/SingleBookingForm.tsx` → `features/bookings/actions/create-bookings.actions.ts` | `DRAFT` |
| Admin group create | `features/bookings/components/admin/booking-forms/GroupBookingForm.tsx` → `create-bookings.actions.ts` | `DRAFT` |
| Admin new-booking modal | `features/bookings/components/admin/new-booking-modal/NewBookingModal.tsx` → `features/bookings/actions/create-booking-full.actions.ts` | `DRAFT` |
| Stripe webhook (instant) | `app/api/webhook/stripe/route.ts` | `CONFIRMED` |

### Booking status enum — `database/schema/enums/booking.enums.ts`
`DRAFT → PENDING → APPROVED → CONFIRMED → COMPLETED` (+ `CANCELLED`). Transition rules in
`features/bookings/services/booking-status.service.ts`. Stripe paths set `CONFIRMED` via **direct DB
update** (bypass transition validation).

### Draft/proposal flow (ALREADY EXISTS — reuse this as the "offer")
- Actions: `features/bookings/actions/draft-booking-actions.ts`
- Types: `features/bookings/lib/draft-proposal.types.ts`
- Components: `features/bookings/components/draft-proposal/*`
- Public page: `app/(root)/bookings/draft/[token]/page.tsx` → `features/bookings/components/PublicDraftBookingClient.tsx`
- Acceptance: `acceptDraftBookingAction` → `bookingService.acceptDraftBookings` → `DRAFT → APPROVED`
  (+ optional Stripe checkout if `payNow` & `allowPayment`).
- Fields on `bookings`: `public_token`, `allow_payment`, `payment_type`, `published_at`,
  `accepted_at`, `accepted_customer_note`.

### Inquiry/lead — `database/schema/tables/inquiry.ts`
- Thin: `name, email, phone, date, time, budget, guests, message, stage, outcome, assignedTo, termsAccepted`.
- `assignedTo` exists but **no assignment UI/action**.
- `stage` enum has `CONVERTED` but it is **never written**.
- **No FK from `booking` back to `inquiry`** actually populated (`booking.inquiryId` exists in schema
  but conversion flow does not set it — it only prefills the create form).
- Public forms that create inquiries (`createGeneralInquiry`):
  - `features/_marketing/landing/components/RequestToBook.tsx` (homepage + contact)
  - `app/(root)/experiences/term-charters/RequestTermCharter.tsx`
- **No boat-page inquiry.** Non-instant boat page → `createBookingRequest` → **`PENDING` booking**
  (this is the core problem).

### booking_ops — `database/schema/tables/bookingOps.table.ts`
Conflicting "client paid" truths:
- `payment` ledger sum (real money) vs `booking_ops.paid_cents` (manual) vs `booking_ops.client_paid`
  (manual checkbox) vs `booking_ops.all_paid` (manual, never auto-set).
- **Stripe payments do NOT update `booking_ops.paid_cents`/`client_paid`.** Only
  `features/bookings/actions/mark-booking-paid.actions.ts` (manual) syncs ops from payments.
- Dashboard "outstanding client balance" reads `booking_ops.balance_client_cents`, while the booking
  detail Payment card and checklist read the payments ledger → they can disagree.

### Admin nav — `shared/lib/constants/navigation-data.ts` (`ADMIN_NAV_ITEMS`)
Dashboard, Bookings, Inquiries, Users, Captains, Crew, Boats, Add-ons, Blog Posts, Settings.

---

## 2. Target architecture

### Concept model
```
LEAD (enriched inquiry table)
  • pre-commit interest, from any channel (home form, boat page, term charter, phone, IG, WhatsApp)
  • NO calendar block, NO ops, NO payments
  • admin claims/assigns → contacts → qualifies
        │  convert
        ▼
BOOKING (the trip record) — bookingStatus:
  DRAFT            = proposal/quote sent to customer (existing public_token flow = the "offer")
  PENDING          = customer-submitted request awaiting admin approval (legacy; keep for now)
  APPROVED         = accepted/approved, awaiting payment
  CONFIRMED        = paid → calendar HARD block + ops begins
  COMPLETED        = trip done
  CANCELLED        = denied/expired/refunded
        │
        ├── booking_pricing   (customer quote — unchanged)
        ├── booking_ops       (INTERNAL ONLY: owner payout, captain, expenses, commission, agent/source)
        └── payment           (SINGLE SOURCE OF TRUTH for client money)
```

### Calendar blocking rule (LOCKED — owner confirmed)
- **Lead:** never blocks.
- **DRAFT proposal:** never blocks (no soft-hold — decision locked).
- **CONFIRMED:** hard block.
- **PENDING (legacy request):** do not rely on it for blocking; migrate these to leads (Phase 3) and
  remove in Phase 8. Only `CONFIRMED` blocks the calendar.

### Public-facing wording
- Instant boat → **"Book now" / "Instant Book"** (real checkout).
- Non-instant boat → **"Request this yacht"** (creates a lead, not a booking).
- Homepage/contact → **"Request a quote" / "Plan my charter"** (general lead).
- Term charter → **"Request term charter"** (term lead).

---

## 3. Implementation phases

> Each phase is independently shippable. Do not start a phase before the previous one is merged and
> green (`npx tsc --noEmit` passes). **Do not auto-run migrations** — the owner runs
> `npm run db:migrate` locally. Generate migration SQL but leave application to the owner.

---

### Phase 1 — Enrich the lead (inquiry) schema [additive, safe]

**Goal:** Make `inquiry` able to represent a boat-specific, structured lead from any channel, without
changing any behavior yet.

**Schema changes — `database/schema/tables/inquiry.ts`** (all nullable / defaulted):
- `leadType` enum: `GENERAL_QUOTE | BOAT_REQUEST | TERM_CHARTER | MANUAL` (default `GENERAL_QUOTE`)
- `source` enum: `HOME_PAGE | BOAT_PAGE | CONTACT_PAGE | TERM_CHARTER_PAGE | PHONE | INSTAGRAM | WHATSAPP | ADMIN | BROKER | OTHER` (default `HOME_PAGE`)
- `boatId` uuid → `boats.id` (`on delete set null`), nullable
- `pricingTierId` uuid → `boat_pricing_tiers.id` (`on delete set null`), nullable
- `requestedStartDateTime` timestamptz, nullable
- `requestedEndDateTime` timestamptz, nullable
- `needsCaptain` boolean, nullable
- `estimatedTotalCents` bigint, nullable
- `budgetCents` bigint, nullable (keep existing free-text `budget` for now; do not drop)
- `convertedBookingId` uuid → `bookings.id` (`on delete set null`), nullable — the booking this lead
  converted into (the real link that's missing today)

**Enum file:** extend `database/schema/enums/inquiry.enums.ts`. Add new enums `inquiryLeadTypeEnum`,
`inquirySourceEnum`. Keep `inquiryStageEnum`/`inquiryOutcomeEnum` as-is in this phase.

**Stage enum (additive only this phase):** add values so the pipeline is real but don't remove old
ones yet: target set `NEW, CLAIMED, CONTACTED, QUALIFIED, OFFER_SENT, CONVERTED, COLD`. (Postgres
enum value adds are safe; removals are not — defer removals to Phase 8.) Map old `NEEDS_CONTACT` →
treated as `NEW` in code.

**Types:** update `database/types` inference + `features/inquiries/inquiry.types.ts`
(`InquiryListItem`) to include new columns where needed for admin display.

**Migration:** generate `drizzle-kit` migration. Do not apply.

**Acceptance criteria:**
- `npx tsc --noEmit` passes.
- New columns exist in generated SQL, all nullable/defaulted; no existing inserts break.
- No UI/behavior change yet.

---

### Phase 2 — Lead service/actions: capture + assignment + structured create

**Goal:** Be able to create and manage rich leads (still no public-form changes yet).

**Files:**
- `features/inquiries/inquiry.actions.ts`:
  - Extend `createGeneralInquiry` input to accept optional `leadType`, `source`, `boatId`,
    `pricingTierId`, `requestedStartDateTime`, `requestedEndDateTime`, `needsCaptain`,
    `estimatedTotalCents`, `budgetCents`. Default `leadType=GENERAL_QUOTE`, `source=HOME_PAGE`.
  - Add `assignLead(inquiryId, adminUserId | null)` → writes `assignedTo` + an inquiry event
    (`STAGE_CHANGE`/new event type `ASSIGNED`). Add `ASSIGNED` to `inquiryEventTypeEnum`.
  - Add `claimLead(inquiryId)` → assigns to current admin, stage `NEW → CLAIMED`.
  - Add `setLeadStage(inquiryId, stage)` for manual pipeline moves.
- `features/inquiries/inquiry.service.ts`:
  - Extend `getAllInquiries` filters: `leadType`, `source`, `assignedTo`, `boatId`.
  - Add includes for boat name / tier label when present.

**Acceptance criteria:**
- Admin can assign/claim a lead and move stage (verified via temporary call or existing detail page
  wiring in Phase 6).
- `npx tsc --noEmit` passes.

---

### Phase 3 — Repoint public forms (the core fix)

**Goal:** Non-instant boat requests and all marketing forms create **leads**, not `PENDING` bookings.

**3a. Boat page non-instant path**
- `features/listing/components/booking-form/v2/BookingForm.tsx`: when `variant === "request"`, the CTA
  should create a **lead** (`leadType=BOAT_REQUEST`, `source=BOAT_PAGE`) with the selected
  `boatId`, `pricingTierId`, `requestedStartDateTime`, guests, `needsCaptain`, `estimatedTotalCents`
  (computed from tier + fees), instead of routing into the `createBookingRequest` booking flow.
- Add a new action `createBoatLead(input)` in `features/inquiries/inquiry.actions.ts` (or reuse
  extended `createGeneralInquiry`). It must **not** require auth (leads are top-of-funnel); capture
  contact fields via a short form (name/email/phone/message) shown for the request variant.
- Keep instant path (`createInstantBooking`) exactly as-is.
- Update copy: "Request this yacht", "Preferred package", "We'll confirm availability & final pricing".

**3b. `createBookingRequest` (legacy `PENDING` booking)**
- Stop using it for public non-instant flow. Either:
  - **Preferred:** leave the function in place but no longer call it from the boat page; OR
  - mark it deprecated and route it to `createBoatLead`.
- Do not delete yet (Phase 8 cleanup).

**3c. Marketing forms — add channel metadata**
- `features/_marketing/landing/components/RequestToBook.tsx`: pass `leadType=GENERAL_QUOTE`,
  `source=HOME_PAGE` (or `CONTACT_PAGE` when on contact route).
- `app/(root)/experiences/term-charters/RequestTermCharter.tsx`: pass `leadType=TERM_CHARTER`,
  `source=TERM_CHARTER_PAGE`.

**3d. GHL**
- Keep firing `ghlWebhookService.sendInquiry` for these. Add `leadType`/`source`/`boatId` to payload.
  (Webhook URL hardening is Phase 7.)

**Acceptance criteria:**
- Submitting a non-instant boat request creates an `inquiry` row with `leadType=BOAT_REQUEST`,
  populated boat/tier/date — and creates **no** booking row.
- Instant booking unchanged (still creates `CONFIRMED` booking via webhook).
- Homepage/term forms still work and now carry channel metadata.
- `npx tsc --noEmit` passes.

---

### Phase 4 — Lead → Booking conversion via existing DRAFT proposal

**Goal:** Convert a qualified lead into a real booking using the **existing** draft/proposal machinery
(no new offer table).

**Files:**
- `features/inquiries/inquiry-booking-prefill.ts`: extend `buildInquiryPrefillForBookingForm` to also
  map `boatId`, `pricingTierId`, `requestedStart/End`, `needsCaptain`, `estimatedTotalCents` (not just
  name/notes).
- Conversion action: when admin converts, create the booking as `DRAFT` through the existing
  `create-booking-full.actions.ts` / `bookingService.createBookings`, then:
  - set `inquiry.convertedBookingId = booking.id`
  - set `inquiry.stage = CONVERTED`, `inquiry.outcome = WON`
  - set `booking.inquiryId = inquiry.id` (populate the existing FK)
  - write inquiry event `OUTCOME_CHANGE`/`STAGE_CHANGE`.
- `features/inquiries/components/InquiryCloseActions.tsx`: "Create a Booking" should carry the lead's
  boat/tier/date into the create flow (via prefill) and, on creation, perform the linking above.
- Optionally support "Send proposal now" → reuse `publishNow` path to email/SMS the draft
  (`shared/lib/services/email.service.ts` `sendDraftBookingEmail`) and set `public_token`.

**Acceptance criteria:**
- Converting a lead creates a `DRAFT` booking, links both directions (`inquiry.convertedBookingId`,
  `booking.inquiryId`), and sets lead stage `CONVERTED`/outcome `WON`.
- Customer can open `/bookings/draft/{token}`, accept, and (optionally) pay → booking becomes
  `APPROVED` then `CONFIRMED` (existing flow).
- `npx tsc --noEmit` passes.

---

### Phase 5 — Fix payments vs ops "client paid" conflict [highest-value correctness fix]

**Goal:** One truth for client money. Payments ledger is authoritative; ops stops storing client-paid
state.

**5a. Make Stripe sync ops, OR stop deriving client balance from ops.** Choose **one** consistently:

- **Recommended (Option A — single source = payments):**
  - Remove reliance on `booking_ops.paid_cents` / `client_paid` / `balance_client_cents` for any
    client-facing or dashboard number.
  - Compute client paid / balance everywhere from the `payment` ledger via
    `shared/lib/utils/payment-display.ts` and the SQL sums already in
    `features/bookings/services/booking.service.ts`.
  - Update `features/admin/dashboard.ts` "outstanding client balance" to use the payments-derived
    balance (quote total − succeeded non-refund payments), not `booking_ops.balance_client_cents`.
  - In `booking_ops`, **deprecate** `paid_cents`, `client_paid`, `balance_client_cents`, `all_paid`
    as client-money fields. Keep them only if still needed for legacy display, but mark deprecated and
    stop writing them. Plan removal in Phase 8.
  - Keep ops fields that are genuinely internal: `expense_cents`, `gmv_cents`, `revenue_cents`,
    `sent_to_owner_cents`, `balance_owner_cents`, `commission_*`, `captain_paid`, `contract_signed`,
    `connected`, `sheets_sent`, `crew_name`, `agent_code`, `source_override`.

- (Option B — keep ops mirror but sync it from Stripe — **not recommended**: still two stores. Only do
  this if the owner insists ops must show a manual override. If chosen, add ops sync in
  `app/api/webhook/stripe/route.ts` confirm/refund handlers.)

**5b. Remove/relabel UI**
- `features/bookings/components/admin/OpsRowContent.tsx`, `InlineOpsCell.tsx`,
  `view-booking/AdminBookingChecklistCard.tsx`: remove client-paid editing from ops; client paid is
  shown (read-only) from the payments ledger. Keep captain/owner/contract toggles.

**Acceptance criteria:**
- A Stripe-paid booking shows "paid" consistently in: admin list payment badge, booking detail Payment
  card, checklist, and dashboard outstanding balance.
- No code path writes client-paid state into `booking_ops` (Option A).
- `npx tsc --noEmit` passes.

---

### Phase 6 — Admin "Leads" experience (rename surface + inbox)

**Goal:** Turn `/admin/inquiries` into a real **Leads Inbox** with claim/assign/stage/filter, unified
across channels.

**Files:**
- `shared/lib/constants/navigation-data.ts`: relabel "Inquiries" → "Leads" (route can stay
  `/admin/inquiries` this phase; rename route in Phase 8).
- `features/inquiries/components/AdminInquiriesTable.tsx`: add columns for `leadType`, `source`, boat,
  requested date, assignee; add claim/assign controls; filter chips for type/source/assignee/stage.
- `features/inquiries/components/InquiryActions.tsx` / `InquiryCloseActions.tsx`: add assign/claim,
  manual stage move, and the Phase-4 convert-to-draft flow.
- Detail page `app/(protected)/admin/inquiries/[id]/page.tsx`: show structured request (boat/tier/
  date/guests/estimate) and the linked converted booking if any.

**Acceptance criteria:**
- Admin can claim, assign, filter, move stage, and convert from one Leads inbox.
- Boat-request leads show boat/date/tier; general leads show budget/guests.
- `npx tsc --noEmit` passes.

---

### Phase 7 — GHL integration hardening + event map

**Goal:** Stable, env-configured outbound events; KOS stays source of truth.

**Files:**
- `shared/lib/services/ghl-webhook.service.ts`: move hardcoded base URL + endpoint IDs to env vars
  (`GHL_WEBHOOK_BASE_URL`, `GHL_HOOK_LEAD`, `GHL_HOOK_BOOKING_REQUEST`, `GHL_HOOK_INSTANT_BOOKING`,
  etc.). Document in `.env.example`.
- Define a single event emitter with stable payloads for: `lead.created`, `lead.claimed`,
  `offer.sent` (draft published), `booking.confirmed`, `booking.completed`, `booking.cancelled`.
- Emit from the relevant actions/services (not scattered ad hoc shapes).

**Acceptance criteria:**
- No hardcoded GHL URLs in source.
- Each lifecycle event fires once with a consistent payload.
- `npx tsc --noEmit` passes.

---

### Phase 8 — Cleanup, consolidation, renames [last]

**Goal:** Remove dead concepts and unify creation paths once everything above is stable.

- Consolidate booking creation: have `NewBookingModal`, `/bookings/create` (`SingleBookingForm`),
  group create, and lead-conversion all share one form/primitive and one persistence path
  (`create-booking-full.actions.ts` + `bookingService.createBookings`).
- Deprecate/remove `createBookingRequest` + `bookingType=REQUEST` if no longer used.
- Remove duplicated/older calendar API if confirmed unused
  (`app/api/admin/calendar-events/route.ts` vs `app/api/admin/bookings/calendar-events/route.ts`).
- Remove deprecated ops client-money columns (Phase 5) via migration.
- Remove unused inquiry stage values (`NEEDS_CONTACT`) — requires enum migration (rebuild enum).
- **Optional rename:** table `inquiry` → `lead` and route `/admin/inquiries` → `/admin/leads`
  (code + migration). Cosmetic; do last.

**Acceptance criteria:**
- One booking creation path. No dead actions/APIs. `npx tsc --noEmit` passes and app smoke-tests.

---

## 4. Migration order (Drizzle; owner applies with `npm run db:migrate`)

1. **M1 (Phase 1):** add lead columns + new enums (`inquiryLeadTypeEnum`, `inquirySourceEnum`), add
   stage values, add `ASSIGNED` event type, add `inquiry.converted_booking_id`. All additive.
2. **M2 (Phase 4):** none required if FKs from M1 cover `converted_booking_id` and `booking.inquiry_id`
   already exists (it does). Confirm `booking_inquiry_idx` present.
3. **M3 (Phase 8):** drop deprecated `booking_ops` client-money columns; rebuild inquiry stage enum to
   remove legacy values; optional `inquiry → lead` rename.

> Never delete data in M1/M2. Only M3 removes things, after code no longer references them.

---

## 5. Decisions

### LOCKED
1. **Phase 5 = Option A.** Payments ledger is the **single source of truth** for client money. Stop
   storing/deriving client-paid in `booking_ops`. (Owner confirmed.)
2. **Calendar blocking = only `CONFIRMED` blocks.** Leads never block; DRAFT proposals do **not**
   soft-hold. (Owner confirmed.) → In Phase 1/Phase 4, do not build soft-hold logic; the "soft hold"
   notes elsewhere in this doc are dropped.

### OPEN — owner to pick (executor: support the chosen option; default to Recommended if unspecified)

3. **Auth on boat-request leads?**
   - **Option N (Recommended) — No auth.** Lead form on a non-instant boat collects name/email/phone
     + trip prefs and submits with no login.
     - Pros: max top-of-funnel capture; matches how Boatsetter/Anchor inquiries work; fewer drop-offs.
     - Cons: more spam/low-quality leads (mitigate with basic validation / honeypot / rate limit);
       no pre-linked user account until conversion.
   - **Option Y — Require login.** Keep the current behavior where a request requires an account.
     - Pros: every lead tied to a real user; less spam; phone/email pre-verified.
     - Cons: friction kills leads; contradicts "lead = top of funnel"; heavier than competitors.
   - *Impact:* Phase 3a `createBoatLead` auth guard only. Low blast radius either way.

4. **Rename `inquiry` → `lead` (table + `/admin/inquiries` route)?**
   - **Option L (Recommended) — Rename last (Phase 8), or not at all.**
     - Pros: zero risk during the behavior work; ship value first; rename is pure cosmetics.
     - Cons: code says "inquiry" while UI says "Leads" for a while (minor cognitive mismatch).
   - **Option E — Rename early (before Phase 2).**
     - Pros: codebase reads consistently as "lead" throughout the overhaul.
     - Cons: large find/replace + table/route migration up front; touches many files for no user value;
       higher merge-conflict risk during the rest of the work.
   - **Option K — Keep "inquiry" forever**, just label the UI "Leads".
     - Pros: no migration ever; DB name stable.
     - Cons: permanent naming mismatch between code and product language.
   - *Impact:* Option E reorders work (rename becomes Phase 0). Options L/K leave phases as written.

5. **Keep `PENDING` request flow at all?** Plan keeps it temporarily, migrates to leads, removes in
   Phase 8. Confirm whether any inbound integration still creates `PENDING` bookings.

---

## 6. Risks & guardrails

- **Stripe webhook is source of truth for `CONFIRMED`.** Do not change confirm/refund handlers except
  the Phase 5 sync decision. Keep idempotency (existing webhook already guards).
- **Public token security:** draft proposal token is the only auth for the public draft page — keep it
  unguessable (uuid) and respect `expiresAt` if you enable soft holds.
- **Don't break instant booking.** It's the only fully-automated revenue path; touch only copy.
- **Typecheck after every phase** (`npx tsc --noEmit`) and run lints on edited files.
- **No auto-migrations.** Generate SQL; owner runs `npm run db:migrate`.

---

## 7. One-line summary

Enrich `inquiry` into a real multi-channel **Lead**, make non-instant boat requests create leads (not
`PENDING` bookings), convert leads into bookings using the **existing DRAFT proposal flow** (no new
offer table), make the **payments ledger the single source of truth** for client money (stop
double-storing it in `booking_ops`), then unify creation paths and harden GHL — all incrementally,
never as a rewrite.
