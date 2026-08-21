"use server";

import { db } from "@/database/db";
import { boats, bookingOps, bookingPricing, bookings } from "@/database/schema";
import { and, desc, eq, gte, isNull, lte, notInArray, sql } from "drizzle-orm";
import { cache } from "react";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  eachMonthOfInterval,
  format,
  subMonths,
} from "date-fns";
import { bookingService } from "@/features/bookings/services/booking.service";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import type { BookingListItem } from "@/features/bookings/booking.types";

async function assertAdmin(): Promise<void> {
  const { error } = await getAdminSession();
  if (error) {
    throw new Error(error);
  }
}

/** One month of charter volume — the last entry is the current month. */
export interface RevenueMonth {
  /** "2026-03" — stable key. */
  key: string;
  /** "Mar" — chart axis label. */
  label: string;
  /** "March" — headline label when this is the current month. */
  monthName: string;
  gmvCents: number;
  commissionCents: number;
  trips: number;
}

/** A boat's standing in this month's GMV leaderboard. */
export interface FleetLeader {
  boatId: string;
  name: string;
  mainImage: string | null;
  gmvCents: number;
  trips: number;
}

/** Lean lead row for the dashboard queue — INQUIRY-status booking rows. */
export interface DashboardLead {
  id: string;
  name: string;
  source: string | null;
  budgetCents: number | null;
  estimatedValueCents: number | null;
  createdAt: Date;
}

/** Live INQUIRY deals with no admin assigned yet — newest first. */
export const getUnassignedLeads = cache(async (limit = 8): Promise<DashboardLead[]> => {
  await assertAdmin();
  const rows = await db
    .select({
      id: bookings.id,
      name: bookings.customerName,
      source: bookings.source,
      budgetCents: bookings.budgetCents,
      estimatedValueCents: bookings.estimatedValueCents,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.bookingStatus, "INQUIRY"),
        isNull(bookings.assignedAdminId),
        isNull(bookings.archivedAt)
      )
    )
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    source: r.source,
    budgetCents: r.budgetCents != null ? Number(r.budgetCents) : null,
    estimatedValueCents: r.estimatedValueCents != null ? Number(r.estimatedValueCents) : null,
    createdAt: r.createdAt,
  }));
});

/**
 * Real, dated trips from today forward — the operational spine of the
 * dashboard. One query feeds both the departures board and the money-owed
 * list, so "what's sailing" and "who still owes" can never disagree.
 * Reuses the board's own query, so payment/captain/ops fields come joined.
 */
export const getUpcomingTrips = cache(
  async (daysAhead = 30): Promise<BookingListItem[]> => {
    await assertAdmin();
    const now = new Date();
    const result = await bookingService.getAllBookings({
      dateFrom: startOfDay(now).toISOString(),
      dateTo: endOfDay(addDays(now, daysAhead)).toISOString(),
      archivedView: false,
      limit: 100,
    });
    return result.bookings
      // Inquiries carry *requested* dates — they aren't trips yet.
      .filter((b) => b.bookingStatus !== "INQUIRY" && b.startDateTime != null)
      .sort(
        (a, b) =>
          new Date(a.startDateTime as Date).getTime() -
          new Date(b.startDateTime as Date).getTime()
      );
  }
);

/**
 * The signed-in admin's own live deals — their desk. Excludes completed work
 * and anything archived; sorted by how long it's been sitting untouched so
 * the stalest deal is always on top.
 */
export const getMyOpenDeals = cache(
  async (adminId: string, limit = 6): Promise<BookingListItem[]> => {
    await assertAdmin();
    const result = await bookingService.getAllBookings({
      assignedAdminId: adminId,
      archivedView: false,
      limit: 50,
    });
    // "Last touch" = when we last spoke to them, else when it landed.
    const lastTouch = (b: BookingListItem) =>
      new Date(b.firstContactedAt ?? b.createdAt).getTime();
    return result.bookings
      .filter((b) => b.bookingStatus !== "COMPLETED")
      .sort((a, b) => lastTouch(a) - lastTouch(b))
      .slice(0, limit);
  }
);

/** GMV expression shared by trend + leaderboard: ops override, else quote
 *  total minus the service fee — GMV is fee-exclusive everywhere. */
const GMV = sql`COALESCE(SUM(COALESCE(${bookingOps.gmvCents}, ${bookingPricing.totalAmountCents} - COALESCE(${bookingPricing.serviceFeeCents}, 0))), 0)`;
/** Real trips only — INQUIRY deals aren't booked, CANCELLED aren't happening. */
const REAL_TRIPS = notInArray(bookings.bookingStatus, ["CANCELLED", "INQUIRY"]);

/**
 * Monthly charter volume for the trailing window, oldest first, current month
 * last. Empty months are zero-filled so the chart never has holes, and the
 * final entry doubles as the headline "this month" metrics.
 */
export const getRevenueTrend = cache(async (months = 6): Promise<RevenueMonth[]> => {
  await assertAdmin();

  const now = new Date();
  const from = startOfMonth(subMonths(now, months - 1));
  const to = endOfMonth(now);
  const monthExpr = sql`to_char(date_trunc('month', ${bookings.startDateTime}), 'YYYY-MM')`;

  const rows = await db
    .select({
      key: sql<string>`${monthExpr}`,
      gmvCents: sql<number>`${GMV}`,
      commissionCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.commissionKosCents}, 0)), 0)`,
      trips: sql<number>`COUNT(${bookings.id})::int`,
    })
    .from(bookings)
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
    .where(and(gte(bookings.startDateTime, from), lte(bookings.startDateTime, to), REAL_TRIPS))
    .groupBy(monthExpr);

  const byKey = new Map(rows.map((r) => [r.key, r]));
  return eachMonthOfInterval({ start: from, end: now }).map((month) => {
    const key = format(month, "yyyy-MM");
    const row = byKey.get(key);
    return {
      key,
      label: format(month, "MMM"),
      monthName: format(month, "MMMM"),
      gmvCents: Number(row?.gmvCents ?? 0),
      commissionCents: Number(row?.commissionCents ?? 0),
      trips: Number(row?.trips ?? 0),
    };
  });
});

/** This month's GMV leaderboard by boat — who is actually earning the fleet's keep. */
export const getFleetLeaders = cache(async (limit = 5): Promise<FleetLeader[]> => {
  await assertAdmin();

  const now = new Date();
  const rows = await db
    .select({
      boatId: boats.id,
      name: boats.name,
      mainImage: boats.mainImage,
      gmvCents: sql<number>`${GMV}`,
      trips: sql<number>`COUNT(${bookings.id})::int`,
    })
    .from(bookings)
    .innerJoin(boats, eq(bookings.boatId, boats.id))
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
    .where(
      and(
        gte(bookings.startDateTime, startOfMonth(now)),
        lte(bookings.startDateTime, endOfMonth(now)),
        REAL_TRIPS
      )
    )
    .groupBy(boats.id, boats.name, boats.mainImage)
    .orderBy(desc(sql`4`), desc(sql`5`)) // ordinals: gmvCents, trips
    .limit(limit);

  return rows.map((r) => ({
    boatId: r.boatId,
    name: r.name,
    mainImage: r.mainImage,
    gmvCents: Number(r.gmvCents),
    trips: Number(r.trips),
  }));
});
