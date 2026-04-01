# Boatsetter API Reference (Reverse-Engineered)

Captured from network traffic on `www.boatsetter.com` — March 2026.

---

## Tech Stack Observations

| Layer             | Boatsetter                                                    | KOS (Current)                               |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Auth**          | **Clerk** (`clerk.boatsetter.com`, pk: `pk_live_Y2xlcm...`)   | NextAuth v5 beta (JWT)                      |
| **Frontend**      | **Next.js Pages Router** (static export SPA, client-rendered) | Next.js App Router (SSR)                    |
| **Styling**       | **Styled Components** v6.1.15                                 | Tailwind + Radix                            |
| **Backend**       | **Rails** (nginx, `galactica_session`, `x-runtime`)           | Next.js (monolith)                          |
| **Microservices** | K8s: `marketplace-core`, `search-service` (port 4318)         | None (monolith)                             |
| **Messaging**     | **Firebase** (`boatsetter-messaging.firebaseapp.com`)         | None (Twilio SMS only)                      |
| **API style**     | REST, versioned (`/domestic/v1/`, `/domestic/v2/`)            | Next.js Route Handlers + Server Actions     |
| **IDs**           | Short public IDs (`sfngfvj`, `xctdvxz`)                       | UUIDs                                       |
| **Money**         | Cents (integers) everywhere                                   | Mix of cents (bigint) and doublePrecision   |
| **Session**       | Clerk JWT (`__session` cookie) + Basic Auth header            | NextAuth JWT cookie                         |
| **CDN / Media**   | S3 + CloudFront (`cdn.boatsetter.com`)                        | ImageKit                                    |
| **Insurance**     | Buoy integration (renter + commercial policies)               | None                                        |
| **Analytics**     | GTM, RudderStack, LogRocket (session replay), Bugsnag         | None                                        |
| **Payments**      | Stripe (`pk_live_DmlhYSA1A4uRolLZY4ei8MyL`)                   | Stripe                                      |
| **Maps**          | Google Maps (two keys: general + web)                         | Google Maps (via @vis.gl/react-google-maps) |

---

## Architecture Deep Dive (from page source)

### Next.js Pages Router (NOT App Router)

Boatsetter uses **Next.js Pages Router** with **static export** (`nextExport: true`, `autoExport: true` in `__NEXT_DATA__`). The book_now page is at `/a/bookings/book_now` and the initial HTML is literally just a **full-screen loading spinner** — everything renders client-side after JS loads.

```
Page route: /a/bookings/book_now
Build ID: doGDWgZzfSxF4sykZ8tDs
Export mode: Static (nextExport: true)
```

This is an **SPA pattern** — no server-side rendering for the booking flow. The Rails backend is the real API server; Next.js is just the frontend shell.

**KOS comparison:** KOS uses App Router with server components and server actions — a fundamentally different architecture. KOS server-renders pages and co-locates data fetching. Boatsetter separates frontend (Next.js SPA) from backend (Rails API) completely.

### Runtime Config (exposed in `__NEXT_DATA__`)

```json
{
  "RAILS_URL": "https://www.boatsetter.com",
  "API_HOST": "https://www.boatsetter.com",
  "BS_API_HOST": "https://api.boatsetter.com",
  "CLIENT_STRING": "AUTH_SPA",
  "STRIPE_PUBLIC_KEY": "pk_live_DmlhYSA1A4uRolLZY4ei8MyL",
  "GOOGLE_CLIENT_ID": "126631791561-...apps.googleusercontent.com",
  "CF_BUCKET": "boatsetter-prod",
  "CF_URL": "https://d2wr9urock6v43.cloudfront.net/",
  "BYPASS_CLERK": false,
  "LOCAL_CLUSTER_MARKETPLACE": "http://marketplace-core.marketplace.svc.cluster.local",
  "LOCAL_CLUSTER_SEARCH": "http://search-service.marketplace.svc.cluster.local:4318",
  "RUDDER_STACK_KEY": "27RWp8nACSyKvVrouoE8PhPEhOg",
  "LOG_ROCKET_KEY_MARKETPLACE_SPA": "woguer/marketplace-prod-ufnxt",
  "BUGSNAG_KEY": "c554479e3f12defcc2d1cc876919c962",
  "FIREBASE_ENV": "development"
}
```

Key observations:

- **`BYPASS_CLERK: false`** — They have a feature flag to disable Clerk. Suggests they migrated to Clerk from something else and keep the toggle for emergencies.
- **`CLIENT_STRING: "AUTH_SPA"`** — This matches the `x-client: AUTH_SPA` header on every API request. The Rails backend uses this to identify the calling client (there may be other clients: mobile app, internal tools).
- **Two API hosts:** `www.boatsetter.com` (same-origin, proxied to Rails) and `api.boatsetter.com` (direct). The SPA uses same-origin for cookie-based auth.
- **K8s microservices:** `marketplace-core` and `search-service` run in a Kubernetes cluster. Search is a separate service (port 4318 suggests OpenTelemetry or a custom service). These are internal cluster URLs — the Next.js SSR/SSG build can call them server-side.
- **`FIREBASE_ENV: "development"`** in production — either a bug or they use a shared Firebase project and control environments via security rules.

### Clerk Integration Pattern

```html
<script
  src="https://clerk.boatsetter.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
  data-clerk-js-script="true"
  async
  data-clerk-publishable-key="pk_live_Y2xlcmsuYm9hdHNldHRlci5jb20k"
  data-nscript="beforeInteractive"
></script>
```

- Clerk JS loaded `beforeInteractive` (highest priority Next.js script strategy)
- Using **Clerk JS v5** directly (not `@clerk/nextjs` — because they're on Pages Router SPA, not App Router)
- The publishable key decodes (base64) to: `clerk.boatsetter.com$` — custom domain on Clerk

### Pre-Hydration Nav Personalization

Clever trick: Before React hydrates, an inline script reads the `bs_nav` cookie to show the user's name and avatar in the header immediately, avoiding a flash of "Sign up / Log in" for authenticated users:

```js
var m = document.cookie.match(/bs_nav=([^;]+)/);
if (m) {
  var d = decodeURIComponent(m[1]),
    i = d.indexOf("|"),
    el = document.documentElement;
  el.dataset.bsNav = d.substring(0, i); // username
  // avatar URL set as CSS custom property
  el.style.setProperty("--bs-nav-avatar", "url('" + a + "')");
}
```

CSS then toggles between auth/anonymous nav states using `html[data-bs-nav]` selectors — no JS framework needed. This is a workaround for their SPA architecture where the initial HTML has no user context.

**KOS doesn't need this** because App Router server components can read the session and render the correct nav server-side.

---

## API Routes

### Authentication (Clerk)

```
POST clerk.boatsetter.com/v1/client/sessions/{session_id}/tokens
  → Refreshes JWT (60s expiry, auto-rotated by Clerk JS SDK)
  → Body: organization_id (optional)
  → Returns: { object: "token", jwt: "..." }

POST clerk.boatsetter.com/v1/client/sessions/{session_id}/touch
  → Keep-alive / focus intent
  → Body: active_organization_id, intent=focus
  → Returns: Full session object with embedded user data
```

**Clerk session cookie structure:**

- `__session` — Short-lived JWT (60s), auto-refreshed
- `__client_uat` — Client update-at timestamp
- `__client` — Longer-lived client JWT with rotating token

**Clerk user object includes:**

- `email_addresses[]` with verification status
- `phone_numbers[]` with verification status
- `external_accounts[]` (Google OAuth linked)
- `unsafe_metadata` — app-specific data (birthdate, terms, analytics UUID)
- `organization_memberships[]` — empty for this user, but the field exists

---

### User Profile

```
GET /domestic/v1/me
```

**Response:**

```json
{
  "id": "xctdvxz", // Short public ID, not UUID
  "first_name": "Aidan",
  "last_name": "Alexander",
  "email": "...",
  "birthdate": "2001-10-04",
  "picture": { "url": "...", "width": 50, "height": 50 },
  "picture_large": { "url": "...", "width": 193, "height": 193 },
  "created_at": "2024-10-31T00:35:55.658Z",
  "phone": "+17246889698",
  "phone_verified": true,
  "push_notifications_on": true,
  "boating_credits": 0, // Credit/promo system
  "boat_pass_balance": 0, // Subscription/pass system
  "is_impersonating": false, // Admin impersonation support
  "is_admin": false,
  "is_owner": true,
  "is_boat_manager": false, // Delegated management role
  "sent_boat_manager_invitation_state": "",
  "is_captain": false,
  "is_partner": false, // Partner/affiliate role
  "address": null,
  "joined_year": 2024,
  "firebase_token": "...", // For real-time messaging
  "ready_to_approve_rentals": 0, // Owner: pending approvals count
  "has_unread_messages": false,
  "boat_requirements_past_due": false, // Compliance flag
  "accepted_terms_at": "...",
  "tcpa_accepted_at": "...", // SMS consent tracking
  "account_completed": true
}
```

**KOS comparison:** KOS has similar fields but missing: `is_boat_manager`, `is_partner`, `boating_credits`, `boat_pass_balance`, `is_impersonating`, `firebase_token`, `boat_requirements_past_due`. The role booleans pattern is similar to KOS's `is_admin` + profile-based `isOwner`/`isCaptain`.

---

### User Bookings

```
GET /domestic/v2/me/bookings_pending_review
```

Paginated: `x-page: 1`, `x-per-page: 10`, `x-total: 0` headers.
Returns `[]` when empty.

---

### User Payment Methods

```
GET /domestic/v1/me/credit_cards
```

Returns saved cards (empty `[]` if none). KOS uses Stripe Customer Portal instead.

---

### Boat Detail

```
GET /domestic/v2/boats/{public_id}
```

**Response (key fields):**

```json
{
  "id": "sfngfvj",
  "state": "approved",                 // Listing state (not just active/inactive)
  "is_owner_activated": true,
  "activated": true,
  "listing_tagline": "GET 1 HR FREE...",
  "listing_description": "...",
  "quick_summary": null,
  "type": "power",                     // power | sail
  "boat_category": "motor_yacht",
  "make": "Crownline Boats",
  "model": "IO1116044",
  "year_manufactured": 2005,
  "capacity": 12,
  "rating": 5,
  "review_count": 299,
  "completed_booking_count": 817,      // Social proof
  "pageview_count": 109477,            // Analytics exposed to owner

  // ── Structured rules (not free text) ──
  "boat_rules": {
    "pets": true,
    "swimming": true,
    "smoking": true,
    "alcohol": true,
    "kids_under_12": true,
    "fishing": false,
    "glass_bottles": true,
    "shoes": false,
    "liveaboard": true,
    "red_wine": false
  },

  // ── Features as structured objects ──
  "features": [
    { "id": "anchor", "name": "Anchor", "types": ["sail", "power"] },
    { "id": "bluetooth_audio", "name": "Bluetooth audio", "types": ["sail", "power"] }
    // ...
  ],

  // ── Captain model ──
  "captain_option": "captain_only",     // captain_only | renter_choice | no_captain

  // ── Package-based pricing (the big one) ──
  "packages": [{
    "id": "prbcdbc",
    "package_type": "captained",        // captained | bareboat
    "charter_agreement_type": "bareboat",
    "owner_captain_provision": "renter_choice",
    "fuel_policy": "owner_pays",        // owner_pays | renter_pays
    "two_hour_price_cents": 18900,
    "three_hour_price_cents": 28900,
    "half_day_cents": 38900,
    "six_hour_price_cents": 59900,
    "all_day_cents": 71000,
    "seven_day_cents": 0,
    "security_deposit_cents": 50000,
    "instant_booking": [{
      "instant_book_enabled": false,
      "welcome_message": "...",
      "notice_requirement": 1,           // Days advance notice
      "agreed_to_uscg_regulations": true
    }],
    "insurance_type": "commercial",

    // Captain fees per duration
    "two_hours_captain_fee": 10000,
    "three_hours_captain_fee": 15000,
    "half_day_captain_fee": 20000,
    "full_day_captain_fee": 40000,
    "six_hours_captain_fee": 30000,
    "captain_fee_type": "included",      // included | additional | pay_at_dock

    "trip_start_time": "10:00",
    "include_captain_price": false,
    "multibook_enabled": true,           // Multiple bookings same day
    "max_passengers": 12,
    "price_mode": "custom",
    "eligible_insurers": ["buoy"]
  }],

  "cheapest_package": {
    "id": "prbcdbc",
    "package_type": "captained",
    "price": 28900,                      // Used for search results / cards
    "price_name": "two_hours"
  },

  // ── Owner / manager ──
  "primary_manager": {
    "id": "txrkmsr",
    "first_name": "Yasniel",
    "last_name": "Garcia",
    "response_rate": "98%",
    "response_time": "< 4 hours",
    "picture": { ... },
    "top_owner_badge": { "badge_name": "top_owner" },
    "review_count": 854,
    "rating": 5
  },

  // ── Location ──
  "location": {
    "address": "201 Northwest South River Drive, Miami, FL 33128",
    "lat": "25.776024",
    "lng": "-80.203694",
    "city": "Miami",
    "state": "FL",
    "country": "United States",
    "slip_number": "17",
    "location_type": "marina_slip",       // marina_slip | dock | mooring | etc.
    "location_name": "La Colama"
  },

  // ── Availability (start times per day of week) ──
  "start_times": {
    "0": ["08:00", "08:30", ... "22:00"],  // Sunday
    "1": ["08:00", ... "22:00"],           // Monday
    // ... through "6" (Saturday)
  },

  // ── Cancellation ──
  "cancellation_policy": "moderate",
  "boat_cancellation_text": [
    "Free cancellations until 5 days before the booking start time.",
    "50% refund for cancellations between 3-5 days before the booking start time.",
    "Cancellations within 2 days of the booking start time are non-refundable."
  ],

  // ── Insurance / compliance ──
  "self_insured": true,
  "insured_value_cents": 4360000,
  "coi_submitted": true,
  "coi_approved": false,
  "boat_registration_number": "FL4843MW",

  // ── Booking config ──
  "is_instant_book": false,
  "multibook_enabled": true,
  "multibook_buffer_time_hours": "0.5",   // 30min between same-day bookings
  "advance_notice": 1,                    // Days
  "offers_half_day_packages": true,

  // ── Meta ──
  "managed_by_boat_manager": false,
  "is_editable_by_current_user": false,   // Permission flag in response
  "is_new_boat": false,
  "appears_on_site": true,
  "boat_add_ons": []                      // Add-on system exists but empty here
}
```

**KOS comparison:**

- KOS uses `boat_pricing_tier` table (hours → price), Boatsetter uses named duration slots (two_hour, three_hour, half_day, etc.) inside "packages"
- Boatsetter **separates captain fees per duration** — KOS has a single captain fee
- Boatsetter has **structured boat rules** (booleans) vs KOS free-text `rules`
- Boatsetter has **per-day start time slots** — KOS doesn't have this granularity
- Boatsetter exposes `is_editable_by_current_user` per response — nice permission pattern
- Boatsetter has **boat_add_ons** as structured data — KOS has `add_ons` JSON on booking
- Boatsetter has **multibook + buffer time** — KOS has no same-day multi-booking support
- Boatsetter **location** has marina-specific fields (slip number, location type) vs KOS PostGIS point

---

### Trip Price Calculator

```
POST /domestic/v2/trips/calculator
```

**Request body (inferred from referer + response):**

```json
{
  "boat_public_id": "sfngfvj",
  "tz": "America/New_York",
  "package_public_id": "prbcdbc",
  "package_type": "captained",
  "passengers": 4,
  "is_multi_day": false,
  "trip_start": "2026-03-28",
  "duration": "two_hours",
  "trip_time": "08:00",
  "trip_finish": "2026-03-28",
  "insurance": 1,
  "renterInsurance": "no",
  "policy_id": 708013
}
```

**Response (all cents):**

```json
{
  "trip_start": "2026-03-28T08:00:00-04:00",
  "trip_finish": "2026-03-28T10:00:00-04:00",
  "trip_start_time_modifiable": true,
  "similar_bookings": 0,

  // ── Price breakdown ──
  "package_price": 18900, // Base package (2hr)
  "boat_price": 24600, // After date adjustments
  "owner_price_adjustment": 0, // Owner can adjust per-booking
  "date_price_adjustment": 5700, // Dynamic/seasonal pricing delta
  "captain_fee": 10000,
  "captain_fee_type": "included",
  "captain_payout": 0,

  // ── Service fees (platform cut) ──
  "service_fee": 6498, // Total platform fee
  "variable_service_fee": 4498, // Percentage component
  "service_fee_fixed_amount": 2000, // $20 flat fee component
  "renter_service_fee": 6498,
  "has_partial_service_fee": false,

  // ── Insurance ──
  "renter_insurance_fee": 0,
  "renter_insurance_tax": 0,
  "insurance_type": "commercial",

  // ── Captain handling ──
  "pay_captain_at_dock": true,
  "pay_captain_at_dock_description": "You will not be charged the captain price at checkout. The captain payment will be collected at the dock.",
  "captain_price": 10000,
  "captain_payment_collection_at_dock": true,
  "display_captain_price_as_tbd": false,

  // ── Totals ──
  "pre_tax_and_fees_booking_total": 34600,
  "rental_price": 33275, // What renter pays at checkout
  "sales_tax": 2177,
  "security_deposit": 50000,
  "total": 43275, // Grand total (includes tax, deposit)
  "booking_total": 41098, // Total minus deposit?
  "amount_to_be_charged": 33275, // Actual Stripe charge
  "amount_to_be_collected_at_dock": 10000, // Captain fee at dock

  // ── Owner side ──
  "owner_listing_fee": 2829, // What BS charges the owner
  "owner_add_on_total": 0,
  "owner_insurance_fee": 0,

  // ── Credits / promos ──
  "boating_credits": 0,
  "boat_pass_price_adjustment": 0,
  "coupon_price_adjustment": 0,

  // ── Other ──
  "renter_add_on_total": 0,
  "towing_cost": 0,
  "currency_code": "USD",
  "duration": "two_hours",
  "passengers": 4,
  "package_type": "captained",
  "is_instant_book": false,
  "fuel_policy": "owner_pays",
  "is_boat_available": true,
  "is_captain_available": true,
  "free_cancelation_until": "2026-03-26T22:59:30.636Z",

  // ── Prerequisites (blocking issues) ──
  "prerequisites": [
    { "type": "allowed_to_rent", "satisfied": true, "error": null },
    { "type": "age_restricted", "satisfied": true, "error": null },
    { "type": "initial_setup", "satisfied": true, "error": null }
  ]
}
```

**KOS comparison:**

- KOS `calculateBookingPriceCents` is simpler: base + captain + cleaning + 3.5% service fee
- Boatsetter has **variable + fixed** service fee components ($20 flat + percentage)
- Boatsetter has **date_price_adjustment** (dynamic/surge pricing) — KOS has none
- Boatsetter separates **amount charged at checkout vs collected at dock** — KOS charges everything through Stripe
- Boatsetter exposes **owner_listing_fee** (what BS takes from the owner) in the calculator — transparent two-sided marketplace
- Boatsetter has **prerequisites** system (age, profile completion, rental permission) — KOS has none
- Boatsetter has **boating credits** and **boat pass** discounts — loyalty/subscription features
- Boatsetter calculates **sales tax** server-side — KOS doesn't compute tax

---

### Insurance

```
POST /domestic/v2/insurers/buoy/renter_policies
```

**Response:**

```json
{
  "id": 708015,
  "insurance_fee_cents": 16142,
  "binding": false,
  "status": "approved"
}
```

Third-party insurance integration (Buoy). KOS has no insurance integration.

---

### Checkout Prerequisites

```
GET /domestic/v2/bookings/checkout_prerequisites
  ?package_id=prbcdbc
  &passengers=4
  &duration=two_hours
  &trip_start=2026-03-28
  &trip_finish=2026-03-28
  &trip_time=08:00
  &purchasing_insurance=false
  &insurance_renter_policy_id=708015
```

Pre-flight check before showing payment form. Returned an error in this capture — likely validates boat/captain availability, user eligibility, insurance status.

---

## Architecture Patterns Worth Adopting

### 1. Package-Based Pricing (High Value)

Boatsetter uses named duration packages (`two_hours`, `three_hours`, `half_day`, `all_day`, `seven_day`) instead of arbitrary hour-based tiers. Each package has its own captain fee. This is more intuitive for owners to set up and customers to understand.

**KOS equivalent:** `boat_pricing_tier` with `hours` + `price`. Could add a `duration_name` or switch to named packages.

### 2. Server-Side Price Calculator Endpoint (High Value)

Dedicated `POST /trips/calculator` returns the full breakdown before checkout. The UI just renders what the server says — no client-side math that can diverge.

**KOS issue:** `usePriceCalculation` hook and `PriceSummary` component do client-side math that doesn't always match server-side `calculateBookingPriceCents`. A calculator API/action would fix this.

### 3. Prerequisites / Eligibility System (Medium Value)

Before checkout, a prerequisites check returns structured pass/fail items (age, profile, permissions). Clean UX: show exactly what's blocking and how to fix it.

**KOS equivalent:** None — validation is scattered across form-level checks and server action errors.

### 4. Clerk Auth with Short-Lived JWTs (Medium Value)

60-second JWTs auto-refreshed by Clerk JS SDK. Session data includes org memberships, external accounts, verification status. No custom middleware needed.

**KOS equivalent:** 24-hour JWT with no rotation. `proxy.ts` middleware isn't wired. Clerk would solve both.

### 5. Structured Boat Rules & Features (Low-Medium Value)

Boolean flags for rules (`pets: true`, `smoking: false`) and typed feature objects instead of free-text arrays. Enables filtering and consistent display.

**KOS equivalent:** `features text[]` (free-text), `rules text` (free-text). Works but not filterable.

### 6. Per-Day Start Time Slots (Medium Value)

Owners configure available start times per day of week (every 30min). Enables same-day multi-booking with buffer times.

**KOS equivalent:** No per-day slot configuration. Availability is date-range based via `boat_blocking`.

### 7. Two-Sided Fee Transparency (High Value for Marketplace)

Calculator shows both `renter_service_fee` AND `owner_listing_fee` — the platform knows exactly what each side pays. Essential for Stripe Connect `application_fee_amount`.

**KOS equivalent:** Only charges the renter a 3.5% service fee. Owner side is tracked manually in `booking_ops.commission*` after the fact.

### 8. Public IDs (Low Value)

Short alphanumeric IDs (`sfngfvj`) instead of UUIDs in URLs. Cleaner URLs, harder to enumerate.

**KOS equivalent:** UUIDs everywhere. `publicToken` on bookings is the exception. Not urgent to change.

---

## Fee Structure Comparison

| Component              | Boatsetter                                     | KOS                                |
| ---------------------- | ---------------------------------------------- | ---------------------------------- |
| **Renter service fee** | Variable % + $20 flat (~18.8% in this example) | 3.5% flat                          |
| **Owner listing fee**  | ~11.5% of boat price (2829/24600)              | Manual commission in `booking_ops` |
| **Captain fee**        | Per-duration, can be "pay at dock"             | Single fee, always in checkout     |
| **Security deposit**   | $500, shown in total but handled separately    | `deposit_amount_cents` in pricing  |
| **Sales tax**          | Calculated server-side                         | Not calculated                     |
| **Insurance**          | Third-party (Buoy), optional                   | None                               |
| **Dynamic pricing**    | `date_price_adjustment` per trip               | None                               |
| **Credits/promos**     | `boating_credits`, `boat_pass`, `coupon`       | `discount_cents` + `discount_code` |

---

## Role Model Comparison

| Role             | Boatsetter                              | KOS                                       |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| **Admin**        | `is_admin` boolean + `is_impersonating` | `is_admin` boolean                        |
| **Owner**        | `is_owner` boolean                      | `owner_profile` table existence           |
| **Captain**      | `is_captain` boolean                    | `captain_profile` table existence         |
| **Boat Manager** | `is_boat_manager` + invitation state    | Not supported                             |
| **Partner**      | `is_partner` boolean                    | Not supported (`BROKER` source enum only) |
| **Renter**       | Default (no flag needed)                | Default user                              |

---

## Routes I'd Want to See Next

If you can capture these, they'd fill in the marketplace/Connect picture:

- `GET /domestic/v2/me/boats` — Owner's fleet listing
- `GET /domestic/v2/me/bookings` — Owner's booking management
- `GET /domestic/v2/me/earnings` or `/payouts` — Owner earnings/payout dashboard
- `POST /domestic/v2/bookings` — Booking creation payload
- `GET /domestic/v2/me/messages` — Messaging structure
- Any `/domestic/v2/captains/` routes — Captain marketplace
- Any Stripe-related routes (Connect onboarding, payout settings)
- Owner dashboard routes (stats, calendar, availability management)
