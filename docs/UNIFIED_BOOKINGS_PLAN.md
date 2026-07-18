# One bookings table — schema unification (THE plan)

**Created:** 2026-07-17 (supersedes the view-layer-only plan) · **Status:** IN PROGRESS
**Directive:** No inquiry/booking split anywhere — one `booking` hub table, one
lifecycle, one detail page, one activity feed. Hub-and-spoke: the hub carries
the bare deal; spokes (already existing) carry pricing, payments, ops, crew,
events, expense lines, status history.

## Target model

**A deal is a `booking` row from first contact to completion.**

- New first status: `bookingStatus = "INQUIRY"` — a lead. No boat, dates, or
  pricing required yet, so `boatId` / `startDateTime` / `numberOfPassengers` /
  `isMultiDay` / `customerPhone` become nullable. Everything downstream is
  already status-gated (calendar blocks on CONFIRMED, checkout needs pricing,
  proposals need DRAFT), so INQUIRY rows can't leak into those paths.
- **Lifecycle** (the boss's sheet key), all derivable — no stage enum:
  | Step | Derivation |
  |---|---|
  | Inquiry | status INQUIRY |
  | Contacted | status INQUIRY + `firstContactedAt` set |
  | Proposal sent | status DRAFT + `publishedAt` (already exists) |
  | Deposit in / Paid | payments ledger (already exists) |
  | Completed | status COMPLETED |
  | Cancelled/Lost | status CANCELLED + `cancellationReason` |
  | Archived | `archivedAt` set (hidden from default list) |
  | Cold | `coldAt` set (INQUIRY rows only) |
- **`bookingType` = how the deal entered** (extended enum): GENERAL_QUOTE,
  BOAT_REQUEST, TERM_CHARTER, MANUAL, MARKETPLACE + existing REQUEST,
  INSTANT_BOOK, EXTERNAL_BOOKING. **`source` = the channel** (extended):
  HOME_PAGE, BOAT_PAGE, CONTACT_PAGE, TERM_CHARTER_PAGE, PHONE, INSTAGRAM,
  WHATSAPP, BOATSETTER, GETMYBOAT, OTHER + existing WEBSITE, ADMIN, BROKER.
- **Intake fields flat on the hub** (nullable scalars don't deserve a spoke):
  `customerMessage`, `preferredDate`, `preferredTimeOfDay`,
  `requestedDurationDays`, `destination`, `budgetCents`,
  `estimatedValueCents`, `smsConsent`, `termsAccepted`, `firstContactedAt`,
  `coldAt`, `archivedAt`, `legacyInquiryId` (backfill traceability).
- `inquiryEvents` history migrates into `bookingEvents`. The `inquiry` +
  `inquiry_events` tables stay in the DB (and in drizzle schema, marked
  deprecated) until the backfill is verified — a final migration drops them.

## Migration protocol (Aidan runs ALL SQL manually)

1. `npx drizzle-kit generate` after the schema-file wave → review the
   generated ALTER migration, run it.
2. Run `database/migrations/manual/unify-deals-backfill.sql` (hand-written):
   copies unconverted inquiries → booking rows (INQUIRY/CANCELLED/archived),
   copies all inquiry_events → booking_events (converted leads' history
   attaches to their existing booking; unconverted to their new row).
3. Verify counts + spot-check, deploy code.
4. LATER (separate migration, after a week of living with it): drop
   `inquiry`, `inquiry_events`, `booking.inquiry_id`.

## Waves — check off as we go, re-read this list before every change

- [x] Wave 0 — this doc + task list
- [x] Wave 1 — schema files (booking columns/enums nullable-ing, deprecation
      notes on inquiry tables) + hand-written backfill SQL
      (`database/migrations/manual/unify-deals-backfill.sql` +
      `drop-inquiry-tables.sql`; Aidan runs `drizzle-kit generate` + these)
- [x] Wave 2 — domain layer: deal-status derives from booking alone
      (+archivedAt); lead-intake.actions.ts (general/term/boat/manual →
      INQUIRY bookings, `lead.created` events); deal.actions.ts (log contact
      sets firstContactedAt, note, cold/archive toggles, mark lost);
      INQUIRY added to VALID_TRANSITIONS; inquiry-conversion machinery
      deleted from booking.service / status service / stripe webhook.
      Old inquiry.actions intake fns remain ONLY as Wave 5/6 deletion targets.
- [x] Wave 3 — services: null-tolerant everywhere (tsc CLEAN against the new
      schema); archivedView bucket filter in getAllBookings; customer-facing
      surfaces (profile, proposal page, ics feed, availability, checkout,
      dashboard calendar) explicitly exclude undated INQUIRY rows;
      createBookings UPGRADES an INQUIRY deal in place (dealId param — same
      row becomes the DRAFT proposal; entry type/source/history preserved).
      NOTE: master-deals.service deletion moved to Wave 4 (the table/page
      still import it until they read getAllBookings directly).
- [x] Wave 4 — UI: one detail page for all statuses (DealRequestCard +
      lead verbs in the quick-actions menu for INQUIRY rows; trip/payments/
      checklist appear once priced); LeadDetailView + table lead branches
      deleted; DealPipelineBar is pure display (derived steps); pricing a
      deal UPGRADES the same row via ?dealId= prefill
- [x] Wave 5 — public intake forms (home/contact, term charter, boat page,
      manual dialog) call lead-intake actions; marketplace inbound-email
      ingestion creates INQUIRY bookings (inbound_email.deal_id added)
- [x] Wave 6 — features/inquiries DELETED entirely (public-form components
      moved to features/bookings/components/lead-intake; inbound-lead service
      to bookings/services; adminInitials to shared/lib/utils/people-display);
      dashboard queue/metrics/activity read the one table; tsc 0, build green
- [ ] Wave 7 (post-verification) — drop-inquiry-tables migration, remove
      deprecated schema defs + legacyInquiryId

## Non-negotiables (the "technical linearity" contract)

- Every wave ends with `npx tsc --noEmit` clean — EXCEPT waves 1–4, which are
  one atomic type-migration (nullable schema types intentionally break
  consumers until wave 4 lands; the shrinking tsc error list IS the worklist).
  Current baseline after wave 1: 88 lines, concentrated in booking.service,
  availability.service, calendar feed routes.
- Nullability flows from the schema types — no `!` assertions to silence it;
  guard or render the null state.
- One vocabulary everywhere: deal status (sheet key) for lifecycle,
  bookingType for entry kind, source for channel. No "stage", no "outcome".
- Nothing merges to production until the boss signs off and Aidan has run
  the migrations against a verified backup.
