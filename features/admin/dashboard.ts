"use server";

import { db } from "@/database/db";
import {
  bookings,
  bookingOps,
  bookingPricing,
  inquiry,
} from "@/database/schema";
import { and, asc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { cache } from "react";
import { startOfDay, endOfDay, addDays, endOfMonth, startOfMonth } from "date-fns";
import { bookingService } from "@/features/bookings/services/booking.service";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";

/** These loaders are server actions (public RPC) — every one must verify admin. */
async function assertAdmin(): Promise<void> {
  const { error } = await getAdminSession();
  if (error) {
    throw new Error(error);
  }
}

/* Types */
import { BookingListItem } from "@/features/bookings/booking.types";
import { InquiryListItem } from "@/features/inquiries/inquiry.types";

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

/** Counts for the dashboard “needs attention” strip — only surfaced when non-zero. */
export interface DashboardActionCounts {
  openInquiryCount: number;
  unassignedInquiryCount: number;
  pendingBookingCount: number;
  ownerPayoutsDueCents: number;
  ownerPayoutsDueCount: number;
  captainNeededTodayCount: number;
  missingExpensesCount: number;
}

// ============================================================================
// OPERATIONS (MTD — trips starting this calendar month)
// ============================================================================

export const getOperationsMtdSummary = cache(async (): Promise<OperationsMtdSummary> => {
  await assertAdmin();
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

/** OPEN inquiries, longest since last update first — best “who needs a nudge” ordering. */
export const getFollowUpInquiries = cache(async (limit = 6): Promise<InquiryListItem[]> => {
  await assertAdmin();
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

// ============================================================================
// BOOKINGS (Today / This Week)
// ============================================================================

export const getTodaysBookings = cache(async (): Promise<BookingListItem[]> => {
  await assertAdmin();
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

// ============================================================================
// DASHBOARD ACTION COUNTS
// ============================================================================

export const getDashboardActionCounts = cache(
  async (): Promise<DashboardActionCounts> => {
    await assertAdmin();
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [inquiryRow] = await db
      .select({
        open: sql<number>`COUNT(*)::int`,
        unassigned: sql<number>`COUNT(*) FILTER (WHERE ${inquiry.assignedTo} IS NULL)::int`,
      })
      .from(inquiry)
      .where(eq(inquiry.outcome, "OPEN"));

    const [pendingRow] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(bookings)
      .where(eq(bookings.bookingStatus, "PENDING"));

    const [ownerRow] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
        totalCents: sql<number>`COALESCE(SUM(GREATEST(${bookingOps.balanceOwnerCents}, 0)), 0)`,
      })
      .from(bookings)
      .innerJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
      .where(
        and(ne(bookings.bookingStatus, "CANCELLED"), sql`${bookingOps.balanceOwnerCents} > 0`)
      );

    const [todayRow] = await db
      .select({
        captainNeeded: sql<number>`COUNT(*) FILTER (WHERE ${bookings.needsCaptain} = true AND ${bookings.captainUserId} IS NULL)::int`,
      })
      .from(bookings)
      .where(
        and(
          gte(bookings.startDateTime, todayStart),
          lte(bookings.startDateTime, todayEnd),
          ne(bookings.bookingStatus, "CANCELLED")
        )
      );

    const [missingExpenseRow] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(bookings)
      .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
      .where(
        and(
          eq(bookings.bookingStatus, "CONFIRMED"),
          gte(bookings.startDateTime, todayStart),
          sql`(${bookingOps.expenseCents} IS NULL OR ${bookingOps.bookingId} IS NULL)`
        )
      );

    return {
      openInquiryCount: Number(inquiryRow?.open ?? 0),
      unassignedInquiryCount: Number(inquiryRow?.unassigned ?? 0),
      pendingBookingCount: Number(pendingRow?.count ?? 0),
      ownerPayoutsDueCents: Number(ownerRow?.totalCents ?? 0),
      ownerPayoutsDueCount: Number(ownerRow?.count ?? 0),
      captainNeededTodayCount: Number(todayRow?.captainNeeded ?? 0),
      missingExpensesCount: Number(missingExpenseRow?.count ?? 0),
    };
  }
);

export const getPendingBookingRequests = cache(async (): Promise<BookingListItem[]> => {
  await assertAdmin();
  const result = await bookingService.getAllBookings({
    bookingStatus: "PENDING",
    limit: 6,
  });
  return result.bookings;
});

/** Next 7 days from today (today + 6 days) - no past bookings */
export const getWeeksBookings = cache(async (): Promise<BookingListItem[]> => {
  await assertAdmin();
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
