"use server";

import { db } from "@/database/db";
import {
  boats,
  bookingEvents,
  bookingOps,
  bookingPricing,
  bookings,
  inquiry,
  inquiryEvents,
} from "@/database/schema";
import { and, asc, count, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
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
import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import {
  formatBookingActivityMessage,
  formatInquiryActivityMessage,
} from "@/features/admin/dashboard/dashboard-utils";

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

export const getPendingBookingRequests = cache(async (): Promise<BookingListItem[]> => {
  await assertAdmin();
  const result = await bookingService.getAllBookings({
    bookingStatus: "PENDING",
    limit: 6,
  });
  return result.bookings;
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
  return result.bookings;
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

    const [[mtdRow], boatCount] = await Promise.all([
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
            ne(bookings.bookingStatus, "CANCELLED")
          )
        ),
      db.select({ value: count() }).from(boats).where(eq(boats.active, true)),
    ]);

    return {
      monthLabel: format(now, "MMMM"),
      gmvMtdCents: Number(mtdRow?.gmvMtdCents ?? 0),
      kosCommissionMtdCents: Number(mtdRow?.kosCommissionMtdCents ?? 0),
      tripsThisMonth: Number(mtdRow?.tripsThisMonth ?? 0),
      activeBoats: Number(boatCount[0]?.value ?? 0),
    };
  }
);

/** Recent cross-module activity from booking + inquiry timelines. */
export const getRecentDashboardActivity = cache(
  async (limit = 12): Promise<DashboardActivityItem[]> => {
    await assertAdmin();

    const perSource = Math.ceil(limit / 2);

    const [bookingRows, inquiryRows] = await Promise.all([
      db
        .select({
          id: bookingEvents.id,
          bookingId: bookingEvents.bookingId,
          customerName: bookings.customerName,
          eventType: bookingEvents.eventType,
          displayMessage: bookingEvents.displayMessage,
          content: bookingEvents.content,
          createdAt: bookingEvents.createdAt,
        })
        .from(bookingEvents)
        .innerJoin(bookings, eq(bookingEvents.bookingId, bookings.id))
        .orderBy(desc(bookingEvents.createdAt))
        .limit(perSource),
      db
        .select({
          id: inquiryEvents.id,
          inquiryId: inquiryEvents.inquiryId,
          inquiryName: inquiry.name,
          eventType: inquiryEvents.eventType,
          content: inquiryEvents.content,
          previousStage: inquiryEvents.previousStage,
          newStage: inquiryEvents.newStage,
          previousOutcome: inquiryEvents.previousOutcome,
          newOutcome: inquiryEvents.newOutcome,
          contactMethod: inquiryEvents.contactMethod,
          createdAt: inquiryEvents.createdAt,
        })
        .from(inquiryEvents)
        .innerJoin(inquiry, eq(inquiryEvents.inquiryId, inquiry.id))
        .orderBy(desc(inquiryEvents.createdAt))
        .limit(perSource),
    ]);

    const merged: DashboardActivityItem[] = [
      ...bookingRows.map((row) => ({
        id: `b-${row.id}`,
        kind: "booking" as const,
        subjectId: row.bookingId,
        subjectLabel: row.customerName,
        message: formatBookingActivityMessage(row),
        createdAt: row.createdAt,
        href: `/admin/bookings/${row.bookingId}`,
      })),
      ...inquiryRows.map((row) => ({
        id: `i-${row.id}`,
        kind: "inquiry" as const,
        subjectId: row.inquiryId,
        subjectLabel: row.inquiryName,
        message: formatInquiryActivityMessage(row),
        createdAt: row.createdAt,
        href: `/admin/inquiries/${row.inquiryId}`,
      })),
    ];

    return merged
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
);
