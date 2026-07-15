# Marketplace Lead Ingestion Plan

**Created:** 2026-07-10 · **Status:** Code complete (2026-07-12) — Phases 1–3 built.
**Remaining:** owner runs `drizzle-kit generate` + migrate; set `RESEND_INBOUND_WEBHOOK_SECRET`
(+ optional `ANTHROPIC_API_KEY` for the LLM fallback) in env; deploy; Phase 5 verification.
Built: enums + `inbound_email` table (`database/schema/tables/inboundEmails.table.ts`),
webhook route (`app/api/inbound-email/route.ts`, svix signature verify + dedupe),
parser (`features/inquiries/services/inbound-lead.service.ts`, template-first with
Claude Haiku structured-output fallback), UI badges/labels.

Pull Boatsetter / GetMyBoat (and any future marketplace) inquiry notifications into the
unified `inquiry` pipeline automatically, via inbound email — the "unified inbox" made real.
Neither marketplace has a public API; their notification emails are templated and parseable.

## Locked decisions

- **Transport: Resend Inbound webhook.** We already send via Resend (`email.service.ts`,
  `RESEND_API_KEY`); receiving uses the same vendor. No polling, no mailbox credentials,
  serverless-friendly.
- **Parse strategy: template-first, LLM fallback.** Per-sender regex parsers for known
  templates; when extraction is incomplete, one Claude Haiku call (`claude-haiku-4-5`)
  maps the email to the inquiry schema. Cheap (~fraction of a cent/email), resilient to
  template changes.
- **Nothing is silently dropped.** Every inbound email is stored raw. If parsing fails
  entirely, we still create a minimal lead ("Boatsetter lead — needs review", full text in
  message) so it lands in the unassigned queue — the queue IS the review surface.
- **Stay on-platform for replies.** Marketplace relay addresses are stored as-is; reps
  respond in the marketplace thread. We track centrally, transact where the lead came from
  (no fee-circumvention exposure).

## Phase 1 — Schema (one migration)

1. `inquirySourceEnum`: add `BOATSETTER`, `GETMYBOAT`.
2. `inquiryLeadTypeEnum`: add `MARKETPLACE`.
   (Not `BOAT_REQUEST` — its CHECK constraint requires an internal `boatId`, which
   marketplace boats don't have. `MARKETPLACE` carries no such constraint.)
3. New table `inbound_email`:
   - `id` uuid PK
   - `messageId` text UNIQUE (dedupe/idempotency)
   - `fromAddress`, `toAddress`, `subject` text
   - `rawHtml`, `rawText` text (audit + reprocessing)
   - `parseStatus` enum: `PENDING | PARSED | FALLBACK_LLM | FAILED | IGNORED`
   - `inquiryId` uuid FK → inquiry (set null) — the lead it produced
   - `error` text, `receivedAt` timestamptz, `createdAt` timestamptz
4. UI vocabulary (`inquiry-ui.ts`): `SOURCE_LABELS` += Boatsetter / GetMyBoat;
   `LEAD_TYPE_BADGES.MARKETPLACE` (suggest sky-blue tint, label "Marketplace").
   Dashboard queue + inquiries list pick these up automatically.

## Phase 2 — Inbound route

`app/api/inbound-email/route.ts` (POST):

1. **Verify** the Resend webhook signature (svix headers, `RESEND_INBOUND_SECRET` env).
   Reject anything unsigned. Also cap payload size.
2. **Dedupe**: upsert-guard on `messageId`; repeat deliveries return 200 and do nothing.
3. **Store raw** `inbound_email` row (`parseStatus: PENDING`) before any parsing —
   crash-safe: worst case we hold the email and reprocess.
4. **Classify sender**: from-domain → `BOATSETTER` / `GETMYBOAT` / unknown.
   Unknown senders → `IGNORED` (it's a forwarded mailbox; expect noise).
5. **Parse & create lead** (Phase 3), update row to `PARSED`/`FALLBACK_LLM`/`FAILED`
   with `inquiryId`.
6. Always return 200 quickly (do the work inline — it's small — or mark PENDING and let
   a retry cron sweep failures).

## Phase 3 — Parser service

`features/inquiries/services/inbound-lead.service.ts`:

```
parseMarketplaceEmail(raw) →
  1. templateParse[source](rawText/html)   // regex for guest name, dates, guests, boat, message
  2. if required fields missing → llmExtract(rawText) with a strict JSON schema
  3. build inquiry insert:
     leadType: MARKETPLACE, source: BOATSETTER|GETMYBOAT, stage: NEW, outcome: OPEN
     name, email (relay ok), phone (often absent → ""), guests,
     requestedStartDateTime (if exact), preferredDate (if date-only),
     message: guest message + boat name + marketplace thread link if present
  4. insert inquiry + CREATED inquiryEvents row (same as web forms)
  5. total parse failure → minimal lead: name "Boatsetter lead — needs review",
     message = text excerpt; parseStatus FAILED
```

LLM fallback: Anthropic SDK, model `claude-haiku-4-5`, tool/structured output matching
the insert shape, temperature 0. Env: `ANTHROPIC_API_KEY`.

## Phase 4 — Email routing (manual, ~15 min, no code)

1. Resend dashboard: add inbound domain `in.kosyachts.com` (MX record at DNS), create
   inbound address e.g. `leads@in.kosyachts.com`, point webhook at
   `https://kosyachts.com/api/inbound-email`, copy signing secret to env.
2. Google Workspace (contact@): two filters — `from:(boatsetter.com)` and
   `from:(getmyboat.com)` → forward to `leads@in.kosyachts.com`, keep in inbox.
   (Alternative: set the notification email directly in each marketplace account's
   settings; forwarding keeps contact@ humans in the loop, so prefer forwarding.)

## Phase 5 — Verify

- Forward a real historical Boatsetter notification to the inbound address → lead appears
  in dashboard unassigned queue with Boatsetter badge; `inbound_email` row PARSED.
- Same for GetMyBoat; plus one junk email → IGNORED, no lead.
- Replay the same email → no duplicate (messageId guard).
- Kill the template parser deliberately → LLM fallback produces the lead.

## Later / out of scope now

- Retry cron for `PENDING`/`FAILED` rows; reprocess script after parser improvements.
- Attachment handling (ignore v1), retention policy for raw emails (e.g. 180 days).
- Instagram/WhatsApp manual-entry form (`leadType MANUAL`) to complete the unified inbox.
- Auto-assignment rules by source (e.g. marketplace leads round-robin).
