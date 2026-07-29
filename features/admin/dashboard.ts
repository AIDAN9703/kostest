"use server";

import { db } from "@/database/db";
import {
  boats,
  bookingEvents,
  bookingOps,
  bookingPricing,
  bookings,
  users,
} from "@/database/schema";
import { and, count, desc, eq, gte, isNull, lte, ne, notInArray, sql } from "drizzle-orm";
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
  /** Active boats in the fleet. */
  activeBoats: number;
  /** Boats added to the fleet this month. */
  boatsAddedThisMonth: number;
  /** New user accounts created this month. */
  newUsersThisMonth: number;
  /** Live INQUIRY-status deals across the pipeline. */
  openInquiries: number;
  /** Live inquiries with no admin assigned yet. */
  unassignedLeads: number;
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
  email: string | null;
  phone: string | null;
  bookingType: string;
  source: string | null;
  /** Best-known trip start: exact request, else preferred date. */
  tripStart: Date | null;
  guests: number | null;
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
      email: bookings.customerEmail,
      phone: bookings.customerPhone,
      bookingType: bookings.bookingType,
      source: bookings.source,
      startDateTime: bookings.startDateTime,
      preferredDate: bookings.preferredDate,
      guests: bookings.numberOfPassengers,
      budgetCents: bookings.budgetCents,
      estimatedValueCents: bookings.estimatedValueCents,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.bookingStatus, "INQUIRY"),
        isNull(bookings.assignedAdminId),
        isNull(bookings.archivedAt),
        // Cold = deliberately parked; it doesn't belong in "needs attention".
        isNull(bookings.coldAt)
      )
    )
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    bookingType: r.bookingType,
    source: r.source,
    tripStart:
      r.startDateTime ?? (r.preferredDate ? new Date(`${r.preferredDate}T00:00:00`) : null),
    guests: r.guests,
    budgetCents: r.budgetCents != null ? Number(r.budgetCents) : null,
    estimatedValueCents: r.estimatedValueCents != null ? Number(r.estimatedValueCents) : null,
    createdAt: r.createdAt,
  }));
});

/** Today through the next 6 days. */
export const getWeeksBookings = cache(async (): Promise<BookingListItem[]> => {
  await assertAdmin();
  const now = new Date();
  const result = await bookingService.getAllBookings({
    dateFrom: startOfDay(now).toISOString(),
    dateTo: endOfDay(addDays(now, 6)).toISOString(),
    limit: 20,
  });
  // Boat inquiries carry requested dates but aren't trips yet.
  return result.bookings.filter((b) => b.bookingStatus !== "INQUIRY");
});

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

    const [[mtdRow], boatCount, [leadCounts], boatsAddedRes, newUsersRes] =
      await Promise.all([
      db
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
        ),
      db.select({ value: count() }).from(boats).where(eq(boats.active, true)),
      db
        .select({
          open: sql<number>`COUNT(*) FILTER (WHERE ${bookings.bookingStatus} = 'INQUIRY' AND ${bookings.archivedAt} IS NULL AND ${bookings.coldAt} IS NULL)::int`,
          unassigned: sql<number>`COUNT(*) FILTER (WHERE ${bookings.bookingStatus} = 'INQUIRY' AND ${bookings.archivedAt} IS NULL AND ${bookings.coldAt} IS NULL AND ${bookings.assignedAdminId} IS NULL)::int`,
        })
        .from(bookings),
      db
        .select({ value: count() })
        .from(boats)
        .where(and(gte(boats.createdAt, from), lte(boats.createdAt, to))),
      db
        .select({ value: count() })
        .from(users)
        .where(and(gte(users.createdAt, from), lte(users.createdAt, to))),
    ]);

    return {
      monthLabel: format(now, "MMMM"),
      gmvMtdCents: Number(mtdRow?.gmvMtdCents ?? 0),
      kosCommissionMtdCents: Number(mtdRow?.kosCommissionMtdCents ?? 0),
      tripsThisMonth: Number(mtdRow?.tripsThisMonth ?? 0),
      activeBoats: Number(boatCount[0]?.value ?? 0),
      boatsAddedThisMonth: Number(boatsAddedRes[0]?.value ?? 0),
      newUsersThisMonth: Number(newUsersRes[0]?.value ?? 0),
      openInquiries: Number(leadCounts?.open ?? 0),
      unassignedLeads: Number(leadCounts?.unassigned ?? 0),
    };
  }
);

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
