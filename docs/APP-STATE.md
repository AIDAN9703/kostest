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
| America/Nassau | 8 | 8 |
| America/Chicago | 7 | 7 |
| America/Santo_Domingo | 5 | 5 |
| **unset** | **37** | **11** |

Unset boats fall back to America/New_York. Prod's 37 break down as: 24 Mykonos and
1 Singapore (**blocked — the enum has no Europe/Asia values**), 2 La Coloma Marina
(location ambiguous), 10 with no location label.

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

**🔴 Boat timezone data gaps.** The `timezone` enum only contains Americas zones, so
**24 Mykonos boats (need Europe/Athens) and 1 Singapore boat (need Asia/Singapore)
cannot be set correctly** — they silently fall back to America/New_York, 7 and 12 hours
off. Fixing needs an enum migration. Other NULL-timezone boats (Florida, CT, Punta Cana)
can be backfilled now with `scripts/backfill-boat-timezones.sql`.

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

**Tech debt:** pre-existing lint errors in AdminBookingsCalendar (refs during render),
PaymentSuccessClient (set-state-in-effect), plus `any` types in a few services.

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
4. Run `scripts/backfill-boat-timezones.sql`, then migrate the `timezone` enum to add
   Europe/Athens and Asia/Singapore and set the Mykonos + Singapore boats.
