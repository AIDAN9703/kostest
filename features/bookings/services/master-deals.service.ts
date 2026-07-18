import { db } from "@/database/db";
import { boats, inquiry as inquiryTable, users } from "@/database/schema";
import { and, count, desc, eq, gte, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";

import { bookingService } from "@/features/bookings/services/booking.service";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { BookingFilterInput } from "@/features/bookings/booking.validation";
import {
  computeDealStatusForBooking,
  computeDealStatusForLead,
  type DealStatus,
} from "@/features/bookings/deal-status";

/**
 * The master "deals" list — the boss's one-view directive. A deal row is
 * either a booking or an unconverted lead (inquiry). Converted (WON) leads
 * never appear as rows: their booking is the row, and the lead's history
 * folds into the booking's detail page. The two tables stay separate in the
 * schema; this service is the seam that makes them read as one.
 */

export interface LeadDealRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  leadType: string;
  source: string;
  stage: string;
  outcome: string;
  boatId: string | null;
  boatName: string | null;
  /** Best-known trip start: exact request, else preferred date, else null. */
  tripStart: Date | null;
  guests: number | null;
  estimatedTotalCents: number | null;
  budget: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  createdAt: Date;
}

export type MasterDealRow =
  | { kind: "booking"; id: string; createdAt: Date; dealStatus: DealStatus; booking: BookingListItem }
  | { kind: "lead"; id: string; createdAt: Date; dealStatus: DealStatus; lead: LeadDealRow };

export interface MasterDealsFilters {
  search?: string;
  /** Admin id for the "My bookings" scope — applies to both arms. */
  assignedToId?: string;
  unassignedOnly?: boolean;
  /** ISO timestamps mapped from the Upcoming/Past pills or explicit range. */
  dateFrom?: string;
  dateTo?: string;
  /** false/undefined = live view (hides cancelled/lost/abandoned); true = only those. */
  archived?: boolean;
  /** Booking-only popover filters — when any is set, lead rows are excluded
   *  (a lead has no booking status/payment/amount to match against). */
  bookingStatus?: BookingFilterInput["bookingStatus"];
  paymentStatus?: BookingFilterInput["paymentStatus"];
  bookingType?: BookingFilterInput["bookingType"];
  needsCaptain?: boolean;
  minAmount?: number;
  maxAmount?: number;
  bookingGroupId?: string;
  page?: number;
  limit?: number;
}

function hasBookingOnlyFilters(filters: MasterDealsFilters): boolean {
  return Boolean(
    filters.bookingStatus ||
      filters.paymentStatus ||
      filters.bookingType ||
      filters.needsCaptain !== undefined ||
      filters.minAmount != null ||
      filters.maxAmount != null ||
      filters.bookingGroupId
  );
}

export interface MasterDealsResponse {
  rows: MasterDealRow[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Leads sort/filter on the best-known trip date, falling back to intake time. */
const leadTripStartSql = sql<Date | null>`COALESCE(${inquiryTable.requestedStartDateTime}, ${inquiryTable.preferredDate}::timestamptz)`;
const leadTimeAnchorSql = sql`COALESCE(${inquiryTable.requestedStartDateTime}, ${inquiryTable.preferredDate}::timestamptz, ${inquiryTable.createdAt})`;

export async function getMasterDeals(
  filters: MasterDealsFilters
): Promise<MasterDealsResponse> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, Math.min(100, filters.limit ?? 25));
  // Correct union pagination without a SQL UNION: pull the top
  // offset+limit rows from each arm, merge-sort, slice.
  const fetchLimit = page * limit;

  // An explicit booking-status filter beats the archived-bucket defaults.
  const bookingStatus =
    filters.bookingStatus ?? (filters.archived ? "CANCELLED" : undefined);

  const [bookingsArm, leadsArm] = await Promise.all([
    bookingService.getAllBookings({
      search: filters.search || undefined,
      assignedAdminId: filters.assignedToId,
      unassignedOnly: filters.unassignedOnly || undefined,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      excludeCancelled: (!filters.archived && !filters.bookingStatus) || undefined,
      bookingStatus,
      paymentStatus: filters.paymentStatus,
      bookingType: filters.bookingType,
      needsCaptain: filters.needsCaptain,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      bookingGroupId: filters.bookingGroupId,
      page: 1,
      limit: fetchLimit,
    }),
    hasBookingOnlyFilters(filters)
      ? Promise.resolve({ leads: [], totalCount: 0 })
      : fetchLeadDeals(filters, fetchLimit),
  ]);

  const bookingRows: MasterDealRow[] = bookingsArm.bookings.map((b) => ({
    kind: "booking",
    id: b.id,
    createdAt: new Date(b.createdAt),
    dealStatus: computeDealStatusForBooking({
      bookingStatus: b.bookingStatus,
      paymentDisplayStatus: b.paymentDisplayStatus,
      hasRefund: b.hasRefund,
    }),
    booking: b,
  }));

  const leadRows: MasterDealRow[] = leadsArm.leads.map((lead) => ({
    kind: "lead",
    id: lead.id,
    createdAt: lead.createdAt,
    dealStatus: computeDealStatusForLead(lead),
    lead,
  }));

  const merged = [...bookingRows, ...leadRows].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const start = (page - 1) * limit;
  const rows = merged.slice(start, start + limit);
  const totalCount = bookingsArm.totalCount + leadsArm.totalCount;

  return {
    rows,
    totalCount,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
}

async function fetchLeadDeals(
  filters: MasterDealsFilters,
  fetchLimit: number
): Promise<{ leads: LeadDealRow[]; totalCount: number }> {
  const conditions = [];

  // Live view: open leads only. Archived view: lost + abandoned.
  // WON leads are represented by their booking row in the other arm.
  conditions.push(
    filters.archived
      ? inArray(inquiryTable.outcome, ["LOST", "ABANDONED"])
      : eq(inquiryTable.outcome, "OPEN")
  );

  const search = filters.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    const searchClause = or(
      ilike(inquiryTable.name, pattern),
      ilike(inquiryTable.email, pattern),
      ilike(inquiryTable.phone, pattern)
    );
    if (searchClause) conditions.push(searchClause);
  }
  if (filters.assignedToId) {
    conditions.push(eq(inquiryTable.assignedTo, filters.assignedToId));
  }
  if (filters.unassignedOnly) {
    conditions.push(isNull(inquiryTable.assignedTo));
  }
  if (filters.dateFrom) {
    conditions.push(gte(leadTimeAnchorSql, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(leadTimeAnchorSql, new Date(filters.dateTo)));
  }

  const whereClause = and(...conditions);

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: inquiryTable.id,
        name: inquiryTable.name,
        email: inquiryTable.email,
        phone: inquiryTable.phone,
        leadType: inquiryTable.leadType,
        source: inquiryTable.source,
        stage: inquiryTable.stage,
        outcome: inquiryTable.outcome,
        boatId: inquiryTable.boatId,
        boatName: boats.name,
        tripStart: leadTripStartSql,
        guests: inquiryTable.guests,
        estimatedTotalCents: inquiryTable.estimatedTotalCents,
        budget: inquiryTable.budget,
        assignedToId: inquiryTable.assignedTo,
        assigneeFirstName: users.firstName,
        assigneeLastName: users.lastName,
        assigneeEmail: users.email,
        createdAt: inquiryTable.createdAt,
      })
      .from(inquiryTable)
      .leftJoin(users, eq(inquiryTable.assignedTo, users.id))
      .leftJoin(boats, eq(inquiryTable.boatId, boats.id))
      .where(whereClause)
      .orderBy(desc(inquiryTable.createdAt))
      .limit(fetchLimit),
    db.select({ value: count() }).from(inquiryTable).where(whereClause),
  ]);

  return {
    leads: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      leadType: r.leadType,
      source: r.source,
      stage: r.stage,
      outcome: r.outcome,
      boatId: r.boatId,
      boatName: r.boatName ?? null,
      tripStart: r.tripStart ? new Date(r.tripStart) : null,
      guests: r.guests,
      estimatedTotalCents: r.estimatedTotalCents,
      budget: r.budget,
      assignedToId: r.assignedToId,
      assignedToName: r.assignedToId
        ? [r.assigneeFirstName, r.assigneeLastName].filter(Boolean).join(" ") ||
          r.assigneeEmail
        : null,
      createdAt: new Date(r.createdAt),
    })),
    totalCount: Number(countResult[0]?.value ?? 0),
  };
}
