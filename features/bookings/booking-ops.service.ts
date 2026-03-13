/**
 * Booking Ops Service
 * Manages operational/admin fields for bookings (duration, expense, revenue, crew, etc.)
 */

import { db } from "@/database/db";
import { bookingOps } from "@/database/schema";
import { eq } from "drizzle-orm";

export interface BookingOpsData {
  durationHours: string | null;
  expenseCents: number | null;
  revenueCents: number | null;
  balanceOwnerCents: number | null;
  balanceClientCents: number | null;
  crewName: string | null;
  contractSigned: boolean | null;
  captainPaid: boolean | null;
  agentCode: string | null;
  commissionCents: number | null;
  sourceOverride: string | null;
}

export interface BookingOpsInput {
  durationHours?: string | null;
  expenseCents?: number | null;
  revenueCents?: number | null;
  balanceOwnerCents?: number | null;
  balanceClientCents?: number | null;
  crewName?: string | null;
  contractSigned?: boolean | null;
  captainPaid?: boolean | null;
  agentCode?: string | null;
  commissionCents?: number | null;
  sourceOverride?: string | null;
}

export const bookingOpsService = {
  async getByBookingId(bookingId: string): Promise<BookingOpsData | null> {
    const [row] = await db
      .select()
      .from(bookingOps)
      .where(eq(bookingOps.bookingId, bookingId))
      .limit(1);

    if (!row) return null;

    return {
      durationHours: row.durationHours,
      expenseCents: row.expenseCents,
      revenueCents: row.revenueCents,
      balanceOwnerCents: row.balanceOwnerCents,
      balanceClientCents: row.balanceClientCents,
      crewName: row.crewName,
      contractSigned: row.contractSigned,
      captainPaid: row.captainPaid,
      agentCode: row.agentCode,
      commissionCents: row.commissionCents,
      sourceOverride: row.sourceOverride,
    };
  },

  async upsert(bookingId: string, input: BookingOpsInput): Promise<BookingOpsData> {
    const now = new Date();
    // Only include fields that are explicitly provided (partial update support)
    const setValues: Record<string, unknown> = { updatedAt: now };
    if (input.durationHours !== undefined) setValues.durationHours = input.durationHours;
    if (input.expenseCents !== undefined) setValues.expenseCents = input.expenseCents;
    if (input.revenueCents !== undefined) setValues.revenueCents = input.revenueCents;
    if (input.balanceOwnerCents !== undefined) setValues.balanceOwnerCents = input.balanceOwnerCents;
    if (input.balanceClientCents !== undefined) setValues.balanceClientCents = input.balanceClientCents;
    if (input.crewName !== undefined) setValues.crewName = input.crewName;
    if (input.contractSigned !== undefined) setValues.contractSigned = input.contractSigned;
    if (input.captainPaid !== undefined) setValues.captainPaid = input.captainPaid;
    if (input.agentCode !== undefined) setValues.agentCode = input.agentCode;
    if (input.commissionCents !== undefined) setValues.commissionCents = input.commissionCents;
    if (input.sourceOverride !== undefined) setValues.sourceOverride = input.sourceOverride;

    const insertValues = {
      bookingId,
      durationHours: input.durationHours ?? null,
      expenseCents: input.expenseCents ?? null,
      revenueCents: input.revenueCents ?? null,
      balanceOwnerCents: input.balanceOwnerCents ?? null,
      balanceClientCents: input.balanceClientCents ?? null,
      crewName: input.crewName ?? null,
      contractSigned: input.contractSigned ?? null,
      captainPaid: input.captainPaid ?? null,
      agentCode: input.agentCode ?? null,
      commissionCents: input.commissionCents ?? null,
      sourceOverride: input.sourceOverride ?? null,
    };

    const [row] = await db
      .insert(bookingOps)
      .values(insertValues)
      .onConflictDoUpdate({
        target: bookingOps.bookingId,
        set: setValues as Record<string, string | number | boolean | Date | null>,
      })
      .returning();

    return {
      durationHours: row.durationHours,
      expenseCents: row.expenseCents,
      revenueCents: row.revenueCents,
      balanceOwnerCents: row.balanceOwnerCents,
      balanceClientCents: row.balanceClientCents,
      crewName: row.crewName,
      contractSigned: row.contractSigned,
      captainPaid: row.captainPaid,
      agentCode: row.agentCode,
      commissionCents: row.commissionCents,
      sourceOverride: row.sourceOverride,
    };
  },
};
