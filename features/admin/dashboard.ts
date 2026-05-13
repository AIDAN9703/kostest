"use server";

import { db } from "@/database/db";
import {
  bookings,
  bookingOps,
  bookingPricing,
  users,
  boats,
  inquiry,
} from "@/database/schema";
import { and, asc, count, eq, gte, lte, ne, sql } from "drizzle-orm";
import { cache } from "react";
import { startOfDay, endOfDay, addDays, endOfMonth, startOfMonth, subDays } from "date-fns";
import { bookingService } from "@/features/bookings/services/booking.service";
import { inquiryService } from "@/features/inquiries/inquiry.service";

/* Types */
import { BookingListItem } from "@/features/bookings/booking.types";
import { InquiryListItem } from "@/features/inquiries/inquiry.types";

export interface DashboardStats {
  totalUsers: number;
  totalBoats: number;
  bookingsThisMonth: number;
  revenueThisMonthCents: number;
}

/** Ops-focused aggregates for trips whose start falls in the current calendar month. */
export interface OperationsMtdSummary {
  gmvMtdCents: number;
  netRevenueMtdCents: number;
  commissionsMtdCents: number;
  tripsStartingThisMonth: number;
  /** Bookings with ops.client balance still owed (see `booking_ops.balance_client_cents`). */
  outstandingClientBalanceCount: number;
  outstandingClientBalanceCents: number;
}

export interface CharterSourceBreakdownRow {
  /** Raw key from ops override or booking.source */
  sourceKey: string;
  /** Display label for UI */
  label: string;
  gmvCents: number;
  bookingCount: number;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get start of current month
 */
function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ============================================================================
// STATS
// ============================================================================

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const startOfMonth = getStartOfMonth();

  const [totalUsersResult, totalBoatsResult, currentMonthStats] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(boats),
    db
      .select({
        bookingsCount: count(bookings.id),
        revenueCents: sql<number>`COALESCE(SUM(${bookingPricing.totalAmountCents}), 0)`.as(
          "revenue_cents"
        ),
      })
      .from(bookings)
      .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
      .where(gte(bookings.createdAt, startOfMonth)),
  ]);

  return {
    totalUsers: Number(totalUsersResult[0]?.count) || 0,
    totalBoats: Number(totalBoatsResult[0]?.count) || 0,
    bookingsThisMonth: Number(currentMonthStats[0]?.bookingsCount) || 0,
    revenueThisMonthCents: Number(currentMonthStats[0]?.revenueCents) || 0,
  };
});

function formatSourceLabel(sourceKey: string): string {
  const k = sourceKey.trim();
  if (!k) return "Unknown";
  const upper = k.toUpperCase();
  const map: Record<string, string> = {
    WEBSITE: "Website",
    ADMIN: "Phone / admin",
    BROKER: "Broker",
  };
  if (map[upper]) return map[upper];
  if (k.length <= 48 && !k.includes(" ")) {
    return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
  }
  return k;
}

// ============================================================================
// OPERATIONS (MTD — trips starting this calendar month)
// ============================================================================

export const getOperationsMtdSummary = cache(async (): Promise<OperationsMtdSummary> => {
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const [mtdRow] = await db
    .select({
      gmvMtdCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.gmvCents}, ${bookingPricing.totalAmountCents})), 0)`,
      netRevenueMtdCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.revenueCents}, 0)), 0)`,
      commissionsMtdCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.commissionCents}, COALESCE(${bookingOps.commissionAgentCents}, 0) + COALESCE(${bookingOps.commissionKosCents}, 0))), 0)`,
      tripsStartingThisMonth: sql<number>`COUNT(${bookings.id})::int`,
    })
    .from(bookings)
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
    .where(
      and(
        gte(bookings.startDateTime, from),
        lte(bookings.startDateTime, to),
        ne(bookings.bookingStatus, "CANCELLED")
      )
    );

  const [balRow] = await db
    .select({
      outstandingClientBalanceCount: sql<number>`COUNT(*)::int`,
      outstandingClientBalanceCents: sql<number>`COALESCE(SUM(GREATEST(${bookingOps.balanceClientCents}, 0)), 0)`,
    })
    .from(bookings)
    .innerJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
    .where(and(ne(bookings.bookingStatus, "CANCELLED"), sql`${bookingOps.balanceClientCents} > 0`));

  return {
    gmvMtdCents: Number(mtdRow?.gmvMtdCents ?? 0),
    netRevenueMtdCents: Number(mtdRow?.netRevenueMtdCents ?? 0),
    commissionsMtdCents: Number(mtdRow?.commissionsMtdCents ?? 0),
    tripsStartingThisMonth: Number(mtdRow?.tripsStartingThisMonth ?? 0),
    outstandingClientBalanceCount: Number(balRow?.outstandingClientBalanceCount ?? 0),
    outstandingClientBalanceCents: Number(balRow?.outstandingClientBalanceCents ?? 0),
  };
});

export const getCharterSourceBreakdownMtd = cache(async (): Promise<CharterSourceBreakdownRow[]> => {
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const groupExpr = sql`COALESCE(NULLIF(TRIM(${bookingOps.sourceOverride}), ''), CAST(${bookings.source} AS text))`;

  const rows = await db
    .select({
      sourceKey: groupExpr.as("source_key"),
      gmvCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.gmvCents}, ${bookingPricing.totalAmountCents})), 0)`,
      bookingCount: sql<number>`COUNT(${bookings.id})::int`,
    })
    .from(bookings)
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
    .where(
      and(
        gte(bookings.startDateTime, from),
        lte(bookings.startDateTime, to),
        ne(bookings.bookingStatus, "CANCELLED")
      )
    )
    .groupBy(groupExpr);

  return rows
    .map((r) => {
      const sourceKey = String((r as { sourceKey?: string }).sourceKey ?? (r as { source_key?: string }).source_key ?? "");
      return {
        sourceKey,
        label: formatSourceLabel(sourceKey),
        gmvCents: Number(r.gmvCents ?? 0),
        bookingCount: Number(r.bookingCount ?? 0),
      };
    })
    .sort((a, b) => b.gmvCents - a.gmvCents);
});

/** OPEN inquiries, longest since last update first — best “who needs a nudge” ordering. */
export const getFollowUpInquiries = cache(async (limit = 6): Promise<InquiryListItem[]> => {
  const rows = await db
    .select({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      stage: inquiry.stage,
      date: inquiry.date,
      outcome: inquiry.outcome,
      budget: inquiry.budget,
      guests: inquiry.guests,
      message: inquiry.message,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    })
    .from(inquiry)
    .where(eq(inquiry.outcome, "OPEN"))
    .orderBy(asc(inquiry.updatedAt))
    .limit(limit);

  return rows as InquiryListItem[];
});

/** OPEN + NEEDS_CONTACT with no touch in `olderThanDays` — for a small warning badge. */
export const getStaleFollowUpCount = cache(async (olderThanDays = 3): Promise<number> => {
  const cutoff = subDays(new Date(), olderThanDays);
  const [row] = await db
    .select({ c: count() })
    .from(inquiry)
    .where(
      and(
        eq(inquiry.outcome, "OPEN"),
        eq(inquiry.stage, "NEEDS_CONTACT"),
        lte(inquiry.updatedAt, cutoff)
      )
    );
  return Number(row?.c ?? 0);
});

export const getRecentBookingsForDashboard = cache(async (limit = 6): Promise<BookingListItem[]> => {
  const result = await bookingService.getAllBookings({ limit });
  return result.bookings;
});

// ============================================================================
// RECENT ITEMS
// ============================================================================

export const getRecentInquiries = cache(async (limit = 6): Promise<InquiryListItem[]> => {
  const result = await inquiryService.getAllInquiries({ limit });
  return result.inquiries as InquiryListItem[];
});

// ============================================================================
// BOOKINGS (Today / This Week)
// ============================================================================

export const getTodaysBookings = cache(async (): Promise<BookingListItem[]> => {
  const now = new Date();
  const dateFrom = startOfDay(now).toISOString();
  const dateTo = endOfDay(now).toISOString();
  const result = await bookingService.getAllBookings({
    dateFrom,
    dateTo,
    limit: 20,
  });
  return result.bookings;
});

/** Next 7 days from today (today + 6 days) - no past bookings */
export const getWeeksBookings = cache(async (): Promise<BookingListItem[]> => {
  const now = new Date();
  const dateFrom = startOfDay(now).toISOString();
  const dateTo = endOfDay(addDays(now, 6)).toISOString();
  const result = await bookingService.getAllBookings({
    dateFrom,
    dateTo,
    limit: 20,
  });
  return result.bookings;
});
