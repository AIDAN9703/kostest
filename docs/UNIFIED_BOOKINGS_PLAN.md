# Unified Bookings — one master view (boss directive)

**Created:** 2026-07-17 · **Status:** IN PROGRESS
**Directive:** No inquiries/bookings split. Sales agents work ONE bookings tab:
everything that comes in (home-page quote, boat inquiry, term charter, manual
lead, real booking) appears in one master list with tags, one detail page, one
activity feed, one lifecycle. Their mental model is the current master Google
Sheet with a color key.

## Architecture decision

**Unify at the VIEW layer now; keep the two tables.** The `inquiry` and
`booking` tables stay (they store genuinely different shapes — leads have no
boat/pricing/calendar), but no admin surface exposes the split. A "deal" is:
an unconverted inquiry, OR a booking (which may carry its originating inquiry
via `booking.inquiryId` — its history folds in). Schema merge ("God table")
is deferred until the UX is proven; revisit then.

## The lifecycle (boss's sheet key → deal status)

| Deal status | Color | Meaning |
|---|---|---|
| Inquiry | none/muted | unconverted open lead, or unpaid booking |
| Proposal sent | gold tint | lead at OFFER_SENT, or DRAFT booking |
| Deposit in | yellow | booking with deposit paid |
| Payment complete | green | booking fully paid |
| Reconcile | orange | refund / chargeback / failed payment |
| Completed | muted | charter done |
| Cancelled | red | cancelled booking or lost lead |
| Archived | hidden | abandoned leads (+ anything admin archives) |

Default list hides Cancelled/Archived behind a filter pill. WON leads don't
appear as rows — their booking is the row; the lead's history rides along.

## Phases

1. **Deal model** — `features/bookings/deal-status.ts`: DealStatus type,
   compute fns for booking + lead, label/chip maps (boss colors).
2. **Master list service** — `getMasterDeals(filters)`: bookings arm (existing
   list query) + leads arm (unconverted inquiries), merged sort by createdAt,
   correct offset pagination (fetch offset+limit from each arm, merge, slice),
   counts summed. Filters: search / scope (all-mine-unassigned) / time
   (upcoming-past) / archived toggle.
3. **Master list UI** — bookings table renders both row kinds: deal-status tag
   (color key) + lead-type tag replace the paid/unpaid badge; lead rows show
   value from estimate/budget, blank ops columns; row click → unified detail.
4. **Unified detail** — `/admin/bookings/[id]` resolves booking id OR inquiry
   id. One page: identity header (contact strip + ONE pipeline:
   Inquiry → Contacted → Proposal sent → Deposit in → Paid → Completed),
   trip card, ONE action center (claim/assign + log contact/note + create &
   send proposal + lost/archive for leads; payment link + complete/cancel for
   bookings — no duplication), payments & financials (bookings only), and ONE
   activity feed merging inquiryEvents + bookingEvents (converted bookings
   include their lead's history).
5. **Edit mode** — kill per-field pencil editing on the detail page; one Edit
   button in the header flips the trip + client sections into a form with
   Save/Cancel.
6. **Retirement** — /admin/inquiries* redirects to /admin/bookings, sidebar
   loses the Inquiries item, superseded inquiry pages/components deleted,
   legacy booking-request approve/deny path removed (customers only enter via
   inquiry funnel or instant book).

## Notes
- Intake stays as-is (forms still create inquiry rows; instant-book creates
  bookings) — only admin surfaces change.
- Production deploys from clean-branch; this work stays on unify-inquiries
  until the boss signs off.
