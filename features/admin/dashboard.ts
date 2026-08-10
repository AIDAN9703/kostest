"use server";

import { db } from "@/database/db";
import { bookingEvents, bookingOps, bookingPricing, bookings } from "@/database/schema";
import { and, desc, eq, gte, isNull, lte, notInArray, sql } from "drizzle-orm";
import { cache } from "react";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  format,
} from "date-fns";
import { bookingService } from "@/features/bookings/services/booking.service";
import { BOOKING_EVENT_TYPES } from "@/features/bookings/booking-events.constants";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import type { BookingListItem } from "@/features/bookings/booking.types";
import { formatBookingActivityMessage } from "@/features/admin/dashboard/dashboard-utils";

async function assertAdmin(): Promise<void> {
  const { error } = await getAdminSession();
  if (error) {
    throw new Error(error);
  }
}

export interface DashboardHeadlineMetrics {
  /** e.g. "June" */
  monthLabel: string;
  /** Gross merchandise value for trips starting this month (cents). */
  gmvMtdCents: number;
  /** KOS commission earned on trips starting this month (cents). */
  kosCommissionMtdCents: number;
  /** Non-cancelled trips starting this month. */
  tripsThisMonth: number;
}

/** The deal funnel, live: how many sit at each stage and what they're worth. */
export interface PipelineSnapshot {
  /** Live leads (INQUIRY, not archived/cold). */
  leads: number;
  leadsValueCents: number;
  /** Published proposals awaiting a customer decision. */
  proposalsOut: number;
  proposalsValueCents: number;
  /** APPROVED — payment link in the customer's hands. */
  awaitingPayment: number;
  awaitingPaymentValueCents: number;
  /** CONFIRMED trips still ahead. */
  bookedUpcoming: number;
  bookedUpcomingValueCents: number;
}

export interface DashboardActivityItem {
  id: string;
  kind: "booking" | "inquiry";
  subjectId: string;
  subjectLabel: string;
  message: string;
  createdAt: Date;
  href: string;
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

/**
 * Headline finance + fleet metrics for the dashboard cards.
 * GMV/commission cover non-cancelled trips that *start* in the current calendar month,
 * mirroring the ops sheet (ops override falls back to the booking quote total).
 */
export const getDashboardHeadlineMetrics = cache(
  async (): Promise<DashboardHeadlineMetrics> => {
    await assertAdmin();

    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);

    const [mtdRow] = await db
      .select({
        gmvMtdCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.gmvCents}, ${bookingPricing.totalAmountCents})), 0)`,
        kosCommissionMtdCents: sql<number>`COALESCE(SUM(COALESCE(${bookingOps.commissionKosCents}, 0)), 0)`,
        tripsThisMonth: sql<number>`COUNT(${bookings.id})::int`,
      })
      .from(bookings)
      .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
      .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
      .where(
        and(
          gte(bookings.startDateTime, from),
          lte(bookings.startDateTime, to),
          // Real trips only — INQUIRY deals aren't booked, CANCELLED aren't happening.
          notInArray(bookings.bookingStatus, ["CANCELLED", "INQUIRY"])
        )
      );

    return {
      monthLabel: format(now, "MMMM"),
      gmvMtdCents: Number(mtdRow?.gmvMtdCents ?? 0),
      kosCommissionMtdCents: Number(mtdRow?.kosCommissionMtdCents ?? 0),
      tripsThisMonth: Number(mtdRow?.tripsThisMonth ?? 0),
    };
  }
);

/** Live stage filter fragments shared by the pipeline snapshot. */
const LIVE = sql`${bookings.archivedAt} IS NULL`;

/**
 * One query, one row: the whole funnel with counts and value at each stage.
 * Value = quoted total (booking_pricing); leads use their estimate/budget.
 */
export const getPipelineSnapshot = cache(async (): Promise<PipelineSnapshot> => {
  await assertAdmin();

  const [row] = await db
    .select({
      leads: sql<number>`COUNT(*) FILTER (WHERE ${bookings.bookingStatus} = 'INQUIRY' AND ${LIVE})::int`,
      leadsValueCents: sql<number>`COALESCE(SUM(COALESCE(${bookings.estimatedValueCents}, ${bookings.budgetCents})) FILTER (WHERE ${bookings.bookingStatus} = 'INQUIRY' AND ${LIVE}), 0)`,
      proposalsOut: sql<number>`COUNT(*) FILTER (WHERE ${bookings.bookingStatus} = 'DRAFT' AND ${bookings.publishedAt} IS NOT NULL AND ${LIVE})::int`,
      proposalsValueCents: sql<number>`COALESCE(SUM(${bookingPricing.totalAmountCents}) FILTER (WHERE ${bookings.bookingStatus} = 'DRAFT' AND ${bookings.publishedAt} IS NOT NULL AND ${LIVE}), 0)`,
      awaitingPayment: sql<number>`COUNT(*) FILTER (WHERE ${bookings.bookingStatus} = 'APPROVED' AND ${LIVE})::int`,
      awaitingPaymentValueCents: sql<number>`COALESCE(SUM(${bookingPricing.totalAmountCents}) FILTER (WHERE ${bookings.bookingStatus} = 'APPROVED' AND ${LIVE}), 0)`,
      bookedUpcoming: sql<number>`COUNT(*) FILTER (WHERE ${bookings.bookingStatus} = 'CONFIRMED' AND ${bookings.startDateTime} >= NOW())::int`,
      bookedUpcomingValueCents: sql<number>`COALESCE(SUM(${bookingPricing.totalAmountCents}) FILTER (WHERE ${bookings.bookingStatus} = 'CONFIRMED' AND ${bookings.startDateTime} >= NOW()), 0)`,
    })
    .from(bookings)
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId));

  return {
    leads: Number(row?.leads ?? 0),
    leadsValueCents: Number(row?.leadsValueCents ?? 0),
    proposalsOut: Number(row?.proposalsOut ?? 0),
    proposalsValueCents: Number(row?.proposalsValueCents ?? 0),
    awaitingPayment: Number(row?.awaitingPayment ?? 0),
    awaitingPaymentValueCents: Number(row?.awaitingPaymentValueCents ?? 0),
    bookedUpcoming: Number(row?.bookedUpcoming ?? 0),
    bookedUpcomingValueCents: Number(row?.bookedUpcomingValueCents ?? 0),
  };
});

/** Recent activity from the one deal timeline (booking_event). */
export const getRecentDashboardActivity = cache(
  async (limit = 12): Promise<DashboardActivityItem[]> => {
    await assertAdmin();

    const rows = await db
      .select({
        id: bookingEvents.id,
        bookingId: bookingEvents.bookingId,
        customerName: bookings.customerName,
        bookingStatus: bookings.bookingStatus,
        eventType: bookingEvents.eventType,
        displayMessage: bookingEvents.displayMessage,
        content: bookingEvents.content,
        createdAt: bookingEvents.createdAt,
      })
      .from(bookingEvents)
      .innerJoin(bookings, eq(bookingEvents.bookingId, bookings.id))
      // Basics only — internal notes and logged contact attempts stay off the board.
      .where(
        notInArray(bookingEvents.eventType, [
          BOOKING_EVENT_TYPES.NOTE_ADDED,
          BOOKING_EVENT_TYPES.CONTACT_LOGGED,
          "lead.note",
          "lead.contact_attempt",
        ])
      )
      .orderBy(desc(bookingEvents.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      kind: row.bookingStatus === "INQUIRY" ? ("inquiry" as const) : ("booking" as const),
      subjectId: row.bookingId,
      subjectLabel: row.customerName,
      message: formatBookingActivityMessage(row),
      createdAt: row.createdAt,
      href: `/admin/bookings/${row.bookingId}`,
    }));
  }
);
