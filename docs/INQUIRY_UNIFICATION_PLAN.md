# Inquiry Unification Plan

**Created:** 2026-07-08 · **Status:** Ready to execute · **Estimated effort:** one evening (3–4h)

This is the current, single source of truth for the leads/inquiries/bookings cleanup.
It supersedes `LEADS_BOOKINGS_OVERHAUL_PLAN.md`, `DATABASE_SCHEMA_AUDIT.md`, and the
March cleanup docs (all deleted). The long-term architecture reference remains
`CHARTER_DATA_MODEL_AND_OPERATIONS.md` (still accurate).

---

## Why

The schema already has ONE unified `inquiry` table with `leadType`/`source` enums and
structured trip columns — the right architecture. The app code never caught up:

1. **Conversion linkage severed.** `booking.inquiryId` is hardcoded `null`
   (`features/bookings/services/booking.service.ts:184`); `inquiry.convertedBookingId`
   is never written anywhere; the `CONVERTED` stage is dead code. Conversion is
   prefill-only and lossy → no lead-source attribution, no conversion reporting.
2. **Term charter form lies.** `RequestTermCharter.tsx` calls the generic
   `createGeneralInquiry` → stored as `GENERAL_QUOTE`/`HOME_PAGE` even though
   `TERM_CHARTER`/`TERM_CHARTER_PAGE` enum values exist. Duration is stuffed into the
   `time` column; destination/accommodations into the `message` blob.
3. **Contact page mislabeled.** Reuses `<RequestToBook />` → recorded as `HOME_PAGE`.
4. **SMS consent not persisted.** `termsAccepted = termsAgreed && smsConsent` (TCPA risk).
5. **Legacy loose fields** (`date` timestamptz, `time` text, `budget` text) coexist with
   structured columns; the timestamptz `date` for "preferred day" causes the classic
   midnight-timezone date-shift bug.

## Locked decisions (researched 2026-07-08 — do not relitigate)

- **Single `inquiry` table + `leadType` discriminator. NO separate
  general/boat/term inquiry tables.** Basis: Fowler STI vs CTI tradeoffs; Salesforce
  (one Lead object + record types) and HubSpot (one object + properties) precedent;
  Postgres null-bitmap makes sparse columns ~free; our primary query is the unified
  pipeline; `booking.inquiryId` and `inquiry_event` need a single FK target. Every
  competitor surveyed (GetMyBoat, Boatsetter, Anchor Rides, 305 Yachtz, Miami Yachting,
  Vice City) runs one lead funnel regardless of intake channel.
- **Per-type integrity via CHECK constraints**, not child tables. Escape hatch: if a
  type ever grows 10+ unique fields, add a 1:1 `inquiry_<type>_details` table then.
- **Date/time policy:** exact instants = `timestamptz` UTC + boat timezone (unchanged,
  correct). Fuzzy preferences = plain `DATE` + time-of-day enum (new). A row uses exact
  columns OR fuzzy columns — never fake precision.
- **Copy-on-convert stays.** Bookings snapshot customer/trip data + keep the FK for
  lineage; booking records must not mutate when the lead is edited.
- **A DRAFT booking + `publicToken` IS the quote/offer** (GetMyBoat's exact model).
  No separate quotes table.

---

## Step 0 — Prep (5 min)

- [ ] `git checkout -b unify-inquiries`
- [ ] Confirm local DB + `npm run dev` work. Everything below is additive; rollback = drop branch.

## Step 1 — Migration (30 min)

**`database/schema/enums/inquiry.enums.ts`** — add:

```ts
export const preferredTimeOfDayEnum = pgEnum("PreferredTimeOfDay", [
    "MORNING", "AFTERNOON", "EVENING", "FLEXIBLE",
]);
```

**`database/schema/tables/inquiry.ts`** — add columns (near the structured block):

```ts
// Fuzzy trip preferences (home page / contact / term charter — no fake precision)
preferredDate: date("preferred_date"),                       // plain DATE, not timestamptz
preferredTimeOfDay: preferredTimeOfDayEnum("preferred_time_of_day"),
requestedDurationDays: integer("requested_duration_days"),   // term charters
destination: text("destination"),                            // term charters
smsConsent: boolean("sms_consent").default(false).notNull(), // TCPA paper trail
```

(import `date` from `drizzle-orm/pg-core`, and the new enum.)

- [ ] `npx drizzle-kit generate`
- [ ] Append CHECK constraints to the generated migration SQL (or use drizzle `check()`
  in the table config if the installed drizzle-orm supports it):

```sql
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_boat_request_requires_boat"
  CHECK (lead_type <> 'BOAT_REQUEST' OR boat_id IS NOT NULL);
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_term_requires_duration"
  CHECK (lead_type <> 'TERM_CHARTER' OR requested_duration_days IS NOT NULL);
```

Safe on existing data: all `BOAT_REQUEST` rows come from `createBoatLead` (always sets
`boatId`); no `TERM_CHARTER` rows exist yet (they're currently mislabeled `GENERAL_QUOTE`).

- [ ] Apply the migration with the repo's usual migrate command.

## Step 2 — Make `createGeneralInquiry` honest (30 min)

`features/inquiries/inquiry.actions.ts`:

- [ ] Accept `source` (and optionally `leadType`) as params, defaulting to current values:
  `createGeneralInquiry(values, { source = "HOME_PAGE", leadType = "GENERAL_QUOTE" } = {})`
- [ ] Write `smsConsent: values.smsConsent`; make `termsAccepted: values.termsAgreed`
  (terms ONLY — stop AND-ing the two).
- [ ] Write `preferredDate` (DATE) + `preferredTimeOfDay` instead of legacy `date`/`time`.
  Map the form's free-text time to the enum where possible; default `FLEXIBLE`.
- [ ] `stage: "NEW"` instead of legacy `"NEEDS_CONTACT"`.
- [ ] Keep the GHL webhook call and the `CREATED` inquiryEvents insert unchanged.

## Step 3 — Dedicated term charter action (40 min)

- [ ] Add `createTermCharterInquiry` in `inquiry.actions.ts`, validated by the existing
  `termCharterInquirySchema` (`shared/lib/validation/inquiry.ts`). Writes:
  `leadType: "TERM_CHARTER"`, `source: "TERM_CHARTER_PAGE"`, `preferredDate` (from
  startDate), `requestedDurationDays`, `destination`, `guests`, `budget` (and
  `budgetCents` if parseable), `message` = free-text details only. Include accommodations
  preference in `message` or `destination` context — do NOT reconstruct the old blob.
- [ ] Update `app/(root)/experiences/term-charters/RequestTermCharter.tsx` to call it
  with the raw structured values. **Delete `formatTermCharterMessage`.**
- [ ] Keep the GHL webhook (it already receives clean structured data).

## Step 4 — Contact page identity + link fix (10 min)

- [ ] `RequestToBook.tsx`: add `source?: InquirySource` prop (default `"HOME_PAGE"`),
  pass through to the action.
- [ ] `app/(root)/(misc)/contact/page.tsx`: render `<RequestToBook source="CONTACT_PAGE" />`.
- [ ] Fix terms-link inconsistency: `features/inquiries/components/InquiryContactForm.tsx`
  links `/terms`; marketing forms link `/terms-of-service`. Make them match whichever
  route actually exists.

## Step 5 — Wire the conversion linkage (60 min — the big one)

1. - [ ] `features/inquiries/inquiry-booking-prefill.ts`: include `inquiryId` in the
   prefill object built by `buildInquiryPrefillForBookingForm`.
2. - [ ] `SingleBookingForm.tsx`: carry `inquiryId` in form state; include it in the
   submit payload.
3. - [ ] `features/bookings/actions/create-bookings.actions.ts` →
   `bookingService.createBookings` (`booking.service.ts`): accept `inquiryId` and write
   it to the booking row (replace the hardcoded `null` at ~line 184).
4. - [ ] After the booking insert (same transaction if possible): update the inquiry —
   `convertedBookingId = booking.id`, `stage = "CONVERTED"`, `outcome = "WON"` — and
   insert an `inquiryEvents` row (`STAGE_CHANGE`, metadata `{ bookingId }`).

## Step 6 — Admin UI reads the new columns (30 min)

New leads stop populating legacy `date`/`time`, so admin views must read the structured
fields with legacy fallback or new rows will look blank:

- [ ] Inquiry list + detail components (`features/inquiries/components/`): display
  `requestedStartDateTime ?? preferredDate` (+ `preferredTimeOfDay`), and
  `budgetCents ?? budget`. Show `destination`/`requestedDurationDays` for term charters.
- [ ] Add a `leadType` badge/filter if not already present (BOAT / GENERAL / TERM / MANUAL).

## Step 7 — Verify end-to-end (30 min)

- [ ] Home form → row has `GENERAL_QUOTE` / `HOME_PAGE` / `preferredDate` as DATE /
  `smsConsent` correct / `stage NEW`.
- [ ] Contact page → `CONTACT_PAGE`.
- [ ] Term charter → `TERM_CHARTER` / `TERM_CHARTER_PAGE` / `destination` +
  `requestedDurationDays` populated / no blob in `time`.
- [ ] Boat page → `BOAT_REQUEST` unchanged (no regression; structured columns still set).
- [ ] Convert one inquiry → booking: `booking.inquiryId` and `inquiry.convertedBookingId`
  point at each other; stage flipped `CONVERTED`; timeline shows the event.
- [ ] Admin inquiry list/detail renders all four lead types correctly.
- [ ] `npx tsc --noEmit` clean.

---

## Deferred backlog (explicitly NOT this pass)

Carried forward from the deleted overhaul plan + new research findings, roughly ordered:

1. **Payments ledger = single source of truth** for client money; `booking_ops` keeps
   only internal reconciliation; sync Stripe payments → ops. (Was "Phase 5".)
2. **Request expiry**: enforce `booking.expiresAt` for PENDING requests via cron
   (Boatsetter/GetMyBoat auto-expire in 24–72h). LOCKED: only `CONFIRMED` blocks the calendar.
3. **Legacy column retirement**: backfill `preferredDate`/`budgetCents` from old
   `date`/`budget` rows, stop dual-writing legacy fields in `createBoatLead`, then drop
   `date`/`time`/`budget`.
4. **Budget as range picklist** on forms (populates `budgetCents` cleanly — 305 Yachtz pattern).
5. **Manual lead entry** in admin (leadType `MANUAL`, sources PHONE/INSTAGRAM/WHATSAPP/
   BROKER) → unified inbox for all channels (kos-yachts.vercel.app mockup concept).
6. **Claim button** on dashboard queue (`CLAIMED` stage already in enum) alongside Assign.
7. **Lead scoring** by fit/intent (estimatedTotalCents, lead age, type).
8. **Status-change automations** with human approval ("nothing sends without a tap").
9. **Rename `inquiry` → `lead`** (cosmetic, absolute last).
10. Money-unit cleanup: `boats`/`boat_pricing_tier` use float dollars while booking
    tables use cents bigint — migrate to cents eventually.
