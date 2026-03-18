/**
 * Booking Ops Service
 * Manages operational/admin fields for bookings (Excel workflow fields)
 */

import { db } from "@/database/db";
import { bookingOps } from "@/database/schema";
import { eq } from "drizzle-orm";

export interface BookingOpsData {
  expenseCents: number | null;
  gmvCents: number | null;
  revenueCents: number | null;
  paidCents: number | null;
  balanceOwnerCents: number | null;
  balanceClientCents: number | null;
  crewName: string | null;
  opsNote: string | null;
  contractSigned: boolean | null;
  connected: boolean | null;
  clientPaid: boolean | null;
  captainPaid: boolean | null;
  allPaid: boolean | null;
  sheetsSent: boolean | null;
  agentCode: string | null;
  commissionAgentCents: number | null;
  commissionKosCents: number | null;
  commissionCents: number | null;
  sourceOverride: string | null;
}

export interface BookingOpsInput {
  expenseCents?: number | null;
  gmvCents?: number | null;
  revenueCents?: number | null;
  paidCents?: number | null;
  balanceOwnerCents?: number | null;
  balanceClientCents?: number | null;
  crewName?: string | null;
  opsNote?: string | null;
  contractSigned?: boolean | null;
  connected?: boolean | null;
  clientPaid?: boolean | null;
  captainPaid?: boolean | null;
  allPaid?: boolean | null;
  sheetsSent?: boolean | null;
  agentCode?: string | null;
  commissionAgentCents?: number | null;
  commissionKosCents?: number | null;
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
      expenseCents: row.expenseCents,
      gmvCents: row.gmvCents,
      revenueCents: row.revenueCents,
      paidCents: row.paidCents,
      balanceOwnerCents: row.balanceOwnerCents,
      balanceClientCents: row.balanceClientCents,
      crewName: row.crewName,
      opsNote: row.opsNote,
      contractSigned: row.contractSigned,
      connected: row.connected,
      clientPaid: row.clientPaid,
      captainPaid: row.captainPaid,
      allPaid: row.allPaid,
      sheetsSent: row.sheetsSent,
      agentCode: row.agentCode,
      commissionAgentCents: row.commissionAgentCents,
      commissionKosCents: row.commissionKosCents,
      commissionCents: row.commissionCents,
      sourceOverride: row.sourceOverride,
    };
  },

  async upsert(bookingId: string, input: BookingOpsInput): Promise<BookingOpsData> {
    const now = new Date();
    const setValues: Record<string, unknown> = { updatedAt: now };

    const fields: (keyof BookingOpsInput)[] = [
      "expenseCents", "gmvCents", "revenueCents", "paidCents",
      "balanceOwnerCents", "balanceClientCents", "crewName", "opsNote",
      "contractSigned", "connected", "clientPaid", "captainPaid",
      "allPaid", "sheetsSent", "agentCode",
      "commissionAgentCents", "commissionKosCents", "commissionCents",
      "sourceOverride",
    ];
    for (const f of fields) {
      if (input[f] !== undefined) setValues[f] = input[f];
    }

    const insertValues = {
      bookingId,
      expenseCents: input.expenseCents ?? null,
      gmvCents: input.gmvCents ?? null,
      revenueCents: input.revenueCents ?? null,
      paidCents: input.paidCents ?? null,
      balanceOwnerCents: input.balanceOwnerCents ?? null,
      balanceClientCents: input.balanceClientCents ?? null,
      crewName: input.crewName ?? null,
      opsNote: input.opsNote ?? null,
      contractSigned: input.contractSigned ?? null,
      connected: input.connected ?? null,
      clientPaid: input.clientPaid ?? null,
      captainPaid: input.captainPaid ?? null,
      allPaid: input.allPaid ?? null,
      sheetsSent: input.sheetsSent ?? null,
      agentCode: input.agentCode ?? null,
      commissionAgentCents: input.commissionAgentCents ?? null,
      commissionKosCents: input.commissionKosCents ?? null,
      commissionCents: input.commissionCents ?? null,
      sourceOverride: input.sourceOverride ?? null,
    } satisfies typeof bookingOps.$inferInsert;

    const [row] = await db
      .insert(bookingOps)
      .values(insertValues)
      .onConflictDoUpdate({
        target: bookingOps.bookingId,
        set: setValues as Record<string, string | number | boolean | Date | null>,
      })
      .returning();

    return {
      expenseCents: row.expenseCents,
      gmvCents: row.gmvCents,
      revenueCents: row.revenueCents,
      paidCents: row.paidCents,
      balanceOwnerCents: row.balanceOwnerCents,
      balanceClientCents: row.balanceClientCents,
      crewName: row.crewName,
      opsNote: row.opsNote,
      contractSigned: row.contractSigned,
      connected: row.connected,
      clientPaid: row.clientPaid,
      captainPaid: row.captainPaid,
      allPaid: row.allPaid,
      sheetsSent: row.sheetsSent,
      agentCode: row.agentCode,
      commissionAgentCents: row.commissionAgentCents,
      commissionKosCents: row.commissionKosCents,
      commissionCents: row.commissionCents,
      sourceOverride: row.sourceOverride,
    };
  },
};
