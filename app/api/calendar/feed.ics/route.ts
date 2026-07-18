/**
 * Public iCal feed for KOS bookings.
 *
 * URL: /api/calendar/feed.ics?token=<hmac>&scope=bookings&boatId=...|captainId=...|ownerId=...
 *
 * Auth model:
 * - No user session — this endpoint is meant to be subscribed to from external
 *   calendars (Google Calendar “Add by URL”, Apple Calendar, Outlook).
 * - Access is gated by an HMAC token derived from the filter combination plus
 *   `CALENDAR_FEED_SECRET` (see `shared/lib/calendar/feed-tokens.ts`).
 * - Only bookings the URL is scoped to are returned — boatId, captainId, or
 *   boat-ownership (ownerId). At least one of those must be present.
 *
 * Returned events are CONFIRMED + APPROVED + PENDING (operational subset),
 * skipping CANCELLED / DRAFT to keep external calendars clean. We can layer
 * status filters into the signed-URL later if needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, inArray, lte, or } from "drizzle-orm";

import { db } from "@/database/db";
import { bookings, boats } from "@/database/schema";
import { buildIcs, type IcsEvent } from "@/shared/lib/calendar/ics";
import {
  verifyFeedToken,
  type FeedScope,
} from "@/shared/lib/calendar/feed-tokens";

/** Lookback / lookahead window for events included in the feed. */
const LOOKBACK_DAYS = 60;
const LOOKAHEAD_DAYS = 365;

function withinFeedWindow() {
  const now = Date.now();
  const start = new Date(now - LOOKBACK_DAYS * 24 * 3600 * 1000);
  const end = new Date(now + LOOKAHEAD_DAYS * 24 * 3600 * 1000);
  return { start, end };
}

function buildSummary(customerName: string, boatName: string | null): string {
  return boatName ? `${customerName} · ${boatName}` : customerName;
}

function buildDescription(b: {
  numberOfPassengers: number | null;
  customerEmail: string;
  customerPhone: string | null;
  bookingId: string;
  origin: string;
}): string {
  const lines = [
    `Guests: ${b.numberOfPassengers ?? "—"}`,
    `Customer email: ${b.customerEmail}`,
    `Customer phone: ${b.customerPhone ?? "—"}`,
    `Booking: ${b.origin}/admin/bookings/${b.bookingId}`,
  ];
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const scope = (params.get("scope") ?? "bookings") as FeedScope;
  if (scope !== "bookings") {
    return new NextResponse("Unsupported feed scope", { status: 400 });
  }

  const boatId = params.get("boatId") || undefined;
  const captainId = params.get("captainId") || undefined;
  const ownerId = params.get("ownerId") || undefined;
  const token = params.get("token") || "";

  if (!boatId && !captainId && !ownerId) {
    return new NextResponse(
      "Feed must be scoped to a boat, captain, or owner",
      { status: 400 },
    );
  }

  // Verify the HMAC binds this exact combination of filters.
  let valid = false;
  try {
    valid = verifyFeedToken({ scope, boatId, captainId, ownerId }, token);
  } catch (error) {
    console.error("[calendar/feed.ics] secret missing", error);
    return new NextResponse("Calendar feed not configured", { status: 500 });
  }
  if (!valid) {
    return new NextResponse("Invalid feed token", { status: 401 });
  }

  const { start, end } = withinFeedWindow();
  const conditions = [
    gte(bookings.startDateTime, start),
    lte(bookings.startDateTime, end),
    inArray(bookings.bookingStatus, ["CONFIRMED", "APPROVED", "PENDING"]),
  ];

  // Boat-scoped feed → exact match on boatId.
  if (boatId) {
    conditions.push(eq(bookings.boatId, boatId));
  }

  // Captain-scoped feed → bookings where the captain is assigned.
  if (captainId) {
    conditions.push(eq(bookings.captainUserId, captainId));
  }

  // Owner-scoped feed → all bookings on boats owned by this user.
  // boat_owner_id is stored on the booking; we also match against boats.ownerId
  // (legacy bookings may not have boat_owner_id populated).
  if (ownerId) {
    conditions.push(
      or(eq(bookings.boatOwnerId, ownerId), eq(boats.ownerId, ownerId))!,
    );
  }

  const rows = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      pickupLocation: bookings.pickupLocation,
      bookingStatus: bookings.bookingStatus,
      boatName: boats.name,
    })
    .from(bookings)
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .where(and(...conditions));

  const origin = url.origin;
  const events: IcsEvent[] = rows
    // Undated INQUIRY-phase deals have no place on a calendar feed.
    .filter((r): r is typeof r & { startDateTime: Date } => r.startDateTime != null)
    .map((r) => ({
    uid: `booking-${r.id}@kosyachts`,
    start: r.startDateTime,
    end: r.endDateTime ?? null,
    summary: buildSummary(r.customerName, r.boatName ?? null),
    description: buildDescription({
      numberOfPassengers: r.numberOfPassengers,
      customerEmail: r.customerEmail,
      customerPhone: r.customerPhone,
      bookingId: r.id,
      origin,
    }),
    location: r.pickupLocation ?? undefined,
    url: `${origin}/admin/bookings/${r.id}`,
    status:
      r.bookingStatus === "CONFIRMED" || r.bookingStatus === "APPROVED"
        ? "CONFIRMED"
        : "TENTATIVE",
  }));

  const calendarName = boatId
    ? "KOS Yachts — Boat schedule"
    : captainId
      ? "KOS Yachts — Captain schedule"
      : "KOS Yachts — Owner schedule";

  const body = buildIcs(events, calendarName);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "private, max-age=300", // 5 min — Google polls roughly hourly anyway
      "content-disposition": 'inline; filename="kos-bookings.ics"',
    },
  });
}
