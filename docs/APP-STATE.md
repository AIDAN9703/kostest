# KOS App — State of the System

_Last verified: 2026-08-14 (against the codebase and both databases)._
Update the date when you re-verify. Claims here were checked, not assumed.

---

## Architecture

**Stack:** Next.js 16 (App Router, RSC + server actions) · TypeScript · Drizzle ORM on
Neon Postgres · NextAuth · Stripe Checkout · Resend (email) · Twilio (OTP) ·
ImageKit (media) · Google Maps/Places · shadcn/ui + Tailwind v4 · react-query + nuqs.

**Layering:** `app/` routes → `features/*/actions` (server actions, Zod-validated) →
`features/*/services` (DB access) → `database/schema`. Shared UI/helpers in `shared/`.

**Features:** bookings, boats, availability, payments, users, profiles, listing,
search, blog, add-ons, auth, admin, booking-groups, app-settings, `_marketing`.

### Three conventions that matter

1. **One bookings table for the whole funnel.** An `INQUIRY` row is UPGRADED IN PLACE
   to `DRAFT` → `APPROVED` → `CONFIRMED`. Same id, same history — never a second row.
2. **Guest-first.** `bookings.userId` is nullable; every booking carries its own
   contact snapshot. Customers inquire, accept, and pay without an account.
3. **Money in cents** everywhere; dollars only at the display edge.

### Hard constraints

- **No transactions.** The Neon HTTP driver throws on `db.transaction()`. All
  multi-step writes are sequential and must be idempotent.
- **Availability is enforced by a Postgres exclusion constraint**, so double-booking
  is impossible regardless of which code path writes.
- **Charter times are stored as absolute instants** (timestamptz) and displayed in
  the BOAT's timezone. See the timezone section below.

---

## Data reality

| | Prod | Dev |
|---|---|---|
| Boats | 272 | 223 |
| Users | 359 | 307 |
| Bookings | 239 (94 inquiry, 63 confirmed) | 199 |
| Succeeded payments | 5 | 10 |
| Charter parties | 0 | test data only |

**Boat timezones (after the 2026-08-14 backfill):**

| Zone | Prod | Dev |
|---|---|---|
| America/New_York | 215 | 192 |
| Europe/Athens (Mykonos) | 24 | 0 |
| America/Nassau | 8 | 8 |
| America/Chicago | 7 | 7 |
| America/Santo_Domingo | 5 | 5 |
| Asia/Singapore | 1 | 1 |
| **unset** | **12** | **10** |

Unset boats fall back to America/New_York. Prod's remaining 12: 2 at La Coloma Marina
(location ambiguous) and 10 with no location label — both awaiting the owner's call.

---

## What works

- **Marketing site** — 30+ public routes in one brand voice: landing, about, careers,
  yacht club, contact, experiences ×5, services ×5, FAQ, legal, news/blog (98 posts).
- **Testimonials** — live Google reviews via Places API v1 (5.0 / 130 reviews).
- **Boat discovery** — search with map + filters, boat detail, pricing tiers, add-ons,
  availability calendar.
- **Inquiry intake** — landing general inquiry, term-charter inquiry, boat-page inquiry
  (account-gated with in-page auth modal). All land as `INQUIRY` on the board.
- **Proposal → payment → confirmation** (verified end to end): price an inquiry →
  branded proposal email → public proposal page (accept / request changes) → Stripe
  Checkout → payment settles → confirmation email → branded success page.
- **Boat-local charter times (input AND display)** — what an admin types is the boat's
  wall clock, never the browser's, so booking a Miami charter from anywhere stores the
  Miami hour; every surface (proposal page, emails, board, detail page) displays
  boat-local with a zone label. Verified across New York / Chicago / Nassau /
  Santo Domingo, including the no-DST Santo Domingo case.
- **Charter parties (multi-boat)** — one group, a row per boat, one proposal link, one
  Stripe session with per-boat line items, one payment row per boat, webhook/verify
  confirm every boat, full refunds cancel the whole party. Board shows a violet
  "×N party" badge; detail page has a Charter Party card.
- **Admin** — bookings board (money columns, status emblems, filters, assignment),
  unified booking detail page, dashboard, calendar, boats/users/captains/crew/add-ons/
  blog/settings CRUD.
- **Auth** — email/password, Google OAuth, phone OTP; guest checkout throughout.

---

## What's broken or incomplete

**🟡 12 prod boats still have no timezone** (2 "La Coloma Marina", 10 with no location
label) and so fall back to America/New_York. Needs the owner to say where they are;
set them with `scripts/backfill-boat-timezones.sql` as a template.

**🟠 Boat-page inquiry sends no acknowledgment email.** Only general + term-charter do.

**🟠 Legacy REQUEST flow undecided.** Approve/deny emails still use the old template.

**🟠 SMS unwired.** Twilio creds exist and OTP works; proposal SMS blocked on a decision:
if the team answers texts in GoHighLevel, transactional SMS should route through GHL.

**🟡 GHL webhook URLs are hardcoded, not env-gated** (`shared/lib/services/ghl-webhook.service.ts`)
— dev inquiries fire at live GoHighLevel workflows.

**🟡 Party editing incomplete.** Can't add/remove a boat after creation; group name is
auto-generated and not editable; partial refunds record against the lead booking only.

**🟡 Google Maps loads via `window.google` polling** instead of a proper provider.

**Not built:** contract e-signature, Google Calendar push to captains, QuickBooks sync,
owner-payout automation, customer-submitted reviews (the 577 `review` rows are seed data;
real testimonials come from Google).

**Tech debt:** repo-wide lint sits at 255 problems (136 errors / 119 warnings) — all
pre-existing: refs-during-render in AdminBookingsCalendar, set-state-in-effect in
PaymentSuccessClient, and `any` types across several services.

**Dependencies:** `npm audit` is clean of high severities. 4 moderates remain, all in
drizzle-kit / esbuild dev tooling; the only "fix" npm offers is a breaking downgrade to
drizzle-kit@0.18.1, and the esbuild issue affects the local dev server only — not
production. Leave them unless drizzle-kit is upgraded for other reasons.

---

## Business rules worth knowing

- **Revenue = GMV − owner payout.** Fuel/crew/dockage expense lines are tracked but do
  NOT reduce KOS revenue (see `shared/lib/utils/ops-revenue.ts`). Deliberate; matches the
  team's spreadsheet. Change it knowingly or not at all.
- **GMV is derived server-side per boat** (`pricing total − card fee`). The client cannot
  submit a GMV. Party financials are per booking, never pooled onto the lead.
- **Emails** all render from one shared brand shell (logo header, photo backdrop,
  contact@kosyachts.com footer) in `shared/lib/services/email.service.ts`.

---

## Before deploying

1. Disable the GHL email steps for general + term-charter workflows (double-send risk).
2. Confirm the Stripe webhook is registered for the prod domain — **refunds only sync
   via webhook**; the verify fallback covers checkout only.
3. Decide the SMS provider question.
4. Set timezones on the last 12 boats (2 La Coloma, 10 unlabelled) once their
   locations are known.

**Money semantics (fixed 2026-08-19):** `booking_ops.expense_cents` aggregates
ALL expense lines (owner payout + fuel/crew/dockage), so REV = GMV − every
cost. Effective GMV falls back to quote total − service fee (fee-exclusive)
on revenue/GMV surfaces; client-balance surfaces keep the fee-inclusive total
because that's what the client owes. Backfill: scripts/backfill-expense-totals.sql.

**Prod data reset (2026-08-19):** 227 test-era bookings (created before
2026-07-15) + 15 test/orphaned payment rows deleted ahead of the go-live;
14 real bookings kept. Backup tables were dropped 2026-09-07 on the
owner's call — history starts at the mid-July real-era rows, period. The legacy
REQUEST flow is retired end to end (producer, approve/deny, emails); its two
real stranded customers (Conor Horrigan, Jason Vonick) were converted to
INQUIRY and need human follow-up. Deal language: INVOICE_SENT split into
PROPOSAL_SENT / ACCEPTED — pipeline reads Inquiry → Contacted → Proposal
sent → Accepted → Partial payment → Payment complete → Completed.
