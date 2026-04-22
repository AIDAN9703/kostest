# Charter data model and operations plan

**Kings of the Sea (KOS)** — schema and booking-operations architecture aligned with the product brief: one system from lead capture through trip execution, money, and reconciliation (replacing the management sheet and inbox-driven sales over time).

This document is the **target architecture** and **migration narrative**. It intentionally favors a small number of clear entities over parallel concepts.

---

## 1. North star

- **One login, one system.** Every trip the business runs should be traceable from first touch to payout without duplicate entry.
- **One commercial spine per trip.** After a defined **commit gate**, there is exactly one record the org treats as the charter: pricing snapshot, lifecycle status, payments, and ops (sheet-equivalent fields).
- **Inquiry owns the conversation; booking owns the commitment.** Before the gate: mutable pipeline and negotiation. After the gate: controlled changes with audit, not silent edits.
- **Money is normalized.** Customer funds flow through **`payments`**. Ops fields (GMV, expense, REV, balances, splits) attach to the same trip and reconcile against payments.

---

## 2. Design principles

1. **Names match the business** — Use **`inquiry`** for all pre-commit leads (not “general inquiry”). Use **`booking`** for the charter/trip record that backs operations.
2. **No duplicate rivers** — Homepage forms, boat flows, and admin entry should funnel into the **same inquiry and booking story**, with explicit links (`booking.inquiry_id`, Stripe metadata, etc.).
3. **Derived vs source fields** — Document which ops columns are **entered** vs **computed** (e.g. balances, revenue) so dashboards and reconciliation do not double-count.
4. **Extensibility without schema soup** — Few core tables + enums; reserve JSON for edge payloads (integrations), not for core money.
5. **Payouts later** — Owner/captain/agent payouts deserve a first-class **`payout` / ledger** model when built; until then, `booking_ops` holds manual sheet semantics without pretending to be a full general ledger.

---

## 3. Target conceptual model (three layers)

| Layer | Purpose | Brief alignment |
|--------|---------|-----------------|
| **Lead & pipeline** | Capture, assign, follow-up, source | Lead capture, pipeline dashboards, “who needs contact” |
| **Offer & acceptance** | Priced terms, expiry, customer “yes”, instant checkout | Quotes, deposit lock-in, friction removal |
| **Trip & money** | Calendar truth, contract/payment flags, GMV/REV/expense/splits | Sheet replacement, reconciliation, owner statements |

---

## 4. Schema shape (recommended)

### 4.1 `inquiry` (rename from `general_inquiry`)

**Role:** Every inbound that might become a trip: landing page, boat page, admin, imports.

**Conceptual fields:**

- **Identity:** name, email, phone; optional `user_id` when logged in.
- **Routing:** `assigned_to`, pipeline **stage**, **outcome**, **source** / channel (for marketing attribution).
- **Intent (nullable):** `boat_id`, preferred date/time, guests, message, budget, etc.
- **Canonical link to trip:** Prefer **`booking.inquiry_id`** as the single source of truth. Avoid maintaining a second `converted_booking_id` on inquiry unless there is a strong UI reason—if both exist, define one as canonical and keep the other in sync by application rule only.

**Pipeline enums:** Current stages are minimal (`NEEDS_CONTACT` → `CONTACTED` → `CONVERTED`). Evolve toward how the team actually sells (e.g. qualified → quoted → negotiating → won/lost) while keeping the enum small.

**Audit:** Keep **`inquiry_events`** (timeline) — this is the right pattern for “what happened on this lead.”

### 4.2 Quote vs proposal (choose one pattern)

**Option A — Dedicated `quote` table (clearest long-term)**

- Versioned offer: boat, tier/duration, breakdown, `expires_at`, `sent_at`, `accepted_at`, optional `public_token` for customer-facing acceptance.
- Supports multiple negotiation rounds without polluting `booking`.

**Option B — `booking` with status `DRAFT` as the proposal (fewer tables)**

- Reuse existing draft + `public_token` flow; enforce in code that **every** draft used as a customer proposal has an **`inquiry_id`** once unified.
- Document in UI copy as “proposal” or “quote” even though the row lives in `booking`.

**Recommendation:** Option B ships faster with tight rules; Option A is cleaner if quotes multiply or versioning becomes critical.

### 4.3 `booking` (charter / trip)

**Role:** The row that replaces the **management sheet row** for a real trip.

**Rules:**

- Set **`inquiry_id`** for all web-originated trips when possible; allow null only for documented legacy or rare admin-only paths.
- **`booking_type`:** `REQUEST` | `INSTANT_BOOK` | `EXTERNAL_BOOKING` (consider renaming external to `ADMIN` in code/docs for clarity).
- **Lifecycle (illustrative commit gate):**
  - **Pre-commit:** `DRAFT` (proposal), `PENDING` (request submitted), `APPROVED` (approved, awaiting payment).
  - **Post-commit:** `CONFIRMED` (deposit/payment per business policy), `COMPLETED`, `CANCELLED`.

**Instant book:** Stripe session metadata must include **`inquiry_id`** (and `quote_id` if Option A) so webhook-created bookings join the same story as request flows.

### 4.4 `booking_pricing`

Keep **1:1** with `booking` as the **financial snapshot** at commit. Updates only through controlled service paths (admin adjustments, formal amendments), not ad hoc UI edits everywhere.

### 4.5 `booking_ops`

Keep **1:1** extension keyed by `booking_id`. Maps to legacy sheet columns: expense, GMV, REV, paid, balances, sent-to-owner, crew, flags (contract, client paid, captain paid, all paid, sheets), agent, commissions, source override.

**Discipline:** Treat **`revenue_cents`** and balance fields as **derived** from agreed inputs where the app already computes them; document which columns are authoritative for reconciliation reports.

Optional later: merge into `booking` to reduce joins—correctness does not require it.

### 4.6 `payments`

Keep **polymorphic** design (`payable_type`, `payable_id`) with `BOOKING` as the primary payable for charters: deposit, balance, refunds. This is the basis for automated reconciliation vs `booking_ops.paid_cents` and flags.

### 4.7 Calendar and holds

Keep **boat blocking** and availability checks as **inventory mechanics**. Do **not** add a separate `reservations` entity until product requires **time-boxed holds** (e.g. broker options with auto-expiry). Until then: optional hold = blocking row and/or `held_until` on a quote, tied to `inquiry` or proposal.

### 4.8 Future: `payout` (or ledger entries)

For owner, captain, crew, agent payouts per the brief: introduce rows with `booking_id`, payee type, amount, status, and paid-at. Avoid encoding the full payout story only in `booking_ops` long term.

---

## 5. Booking operations flow (end-to-end)

1. **Create inquiry** — All entry points (landing, boat, admin) create or update an inquiry.
2. **Run the pipeline** — Stages, assignment, `inquiry_events` — answers slipping leads and multi-agent visibility.
3. **Issue proposal** — Quote row (Option A) or `DRAFT` booking (Option B) linked to `inquiry_id`.
4. **Commit gate** — Business-defined: e.g. deposit captured or admin confirmation + first payment recorded → transition to **`CONFIRMED`** (document the exact rule in one place).
5. **Operate the trip** — `booking_ops` + `payments` + contract/paid flags; matches pre-trip, day-of, and post-trip steps from the ops brief.
6. **Close** — `COMPLETED`; commissions and payouts roll up from ops + payments + future payout table.

**Reconciliation (directional):** For each committed booking, define invariants (e.g. sum of succeeded payments vs `paid_cents`; balances vs “all paid” flags). The platform should **flag** mismatches rather than relying on mental math.

---

## 6. Relation to integrations

- **GoHighLevel / CRM:** Prefer a single outbound integration layer triggered off **inquiry** and **booking** lifecycle events, with stable payloads—not one-off webhook shapes scattered across actions.
- **Stripe:** Webhook remains source of truth for card payments; metadata must link **`booking`** and **`inquiry`** for instant flows.
- **Email / SMS:** Transactional comms tied to inquiry or booking id for traceability.

---

## 7. Migration order (practical)

1. **Behavior first:** Ensure request and instant flows **create or link `inquiry`** and set **`booking.inquiry_id`**; extend Stripe metadata for instant.
2. **Rename:** Database and TypeScript: `general_inquiry` → **`inquiry`** (and dependents).
3. **Pipeline:** Align inquiry stages with real sales motion; explicit “convert to booking” (or accept proposal) in admin.
4. **Quote decision:** Commit to Option A or B; align UI language (“proposal” / “quote”) with the code path.
5. **Dashboards:** Define GMV / REV / pipeline from **bookings + ops + payments + inquiries** with shared definitions (avoid proxies like “bookings created this month” as revenue).
6. **Payouts:** Add ledger/payout table when ready.

---

## 8. One-line summary

**Every trip the business runs is one `booking` with pricing, payments, and ops; everything before the commit gate is an `inquiry` (and optional quote/proposal) so leads are not lost and the sheet is not re-keyed.**

---

## 9. Related docs in this repo

- `docs/BOOKING_CREATION_FLOW_ANALYSIS.md`
- `docs/BOOKING_CLEANUP_GAMEPLAN.md`
- `docs/DATABASE_SCHEMA_AUDIT.md`
- `docs/APP_UNDERSTANDING_CONFIRMATION.md`

Update those as implementation lands so they stay consistent with **this** target model.
