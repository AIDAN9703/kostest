/**
 * Booking Ops Service
 * Manages operational/admin fields for bookings (Excel workflow fields)
 */

import { db } from "@/database/db";
import { bookingOps, bookingPricing } from "@/database/schema";
import { eq } from "drizzle-orm";
import { computeOpsRevenueCents } from "@/shared/lib/utils/ops-revenue";

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
    const existing = await this.getByBookingId(bookingId);

    const [pricingRow] = await db
      .select({ total: bookingPricing.totalAmountCents })
      .from(bookingPricing)
      .where(eq(bookingPricing.bookingId, bookingId))
      .limit(1);
    const totalAmountCents =
      pricingRow?.total != null ? Number(pricingRow.total) : null;

    const expenseForCalc =
      input.expenseCents !== undefined
        ? input.expenseCents
        : existing?.expenseCents ?? null;
    const computedRevenueCents = computeOpsRevenueCents(
      totalAmountCents,
      expenseForCalc
    );

    const mergeForInsert = <K extends keyof BookingOpsInput>(
      key: K
    ): BookingOpsData[K] => {
      if (input[key] !== undefined) {
        return input[key] as BookingOpsData[K];
      }
      if (existing) {
        return existing[key as keyof BookingOpsData] as BookingOpsData[K];
      }
      return null as BookingOpsData[K];
    };

    const setValues: Record<string, unknown> = { updatedAt: now };

    const fields: (keyof BookingOpsInput)[] = [
      "expenseCents",
      "gmvCents",
      "paidCents",
      "balanceOwnerCents",
      "balanceClientCents",
      "crewName",
      "opsNote",
      "contractSigned",
      "connected",
      "clientPaid",
      "captainPaid",
      "allPaid",
      "sheetsSent",
      "agentCode",
      "commissionAgentCents",
      "commissionKosCents",
      "commissionCents",
      "sourceOverride",
    ];
    for (const f of fields) {
      if (input[f] !== undefined) setValues[f] = input[f];
    }
    setValues.revenueCents = computedRevenueCents;

    const insertValues = {
      bookingId,
      expenseCents: mergeForInsert("expenseCents"),
      gmvCents: mergeForInsert("gmvCents"),
      revenueCents: computedRevenueCents,
      paidCents: mergeForInsert("paidCents"),
      balanceOwnerCents: mergeForInsert("balanceOwnerCents"),
      balanceClientCents: mergeForInsert("balanceClientCents"),
      crewName: mergeForInsert("crewName"),
      opsNote: mergeForInsert("opsNote"),
      contractSigned: mergeForInsert("contractSigned"),
      connected: mergeForInsert("connected"),
      clientPaid: mergeForInsert("clientPaid"),
      captainPaid: mergeForInsert("captainPaid"),
      allPaid: mergeForInsert("allPaid"),
      sheetsSent: mergeForInsert("sheetsSent"),
      agentCode: mergeForInsert("agentCode"),
      commissionAgentCents: mergeForInsert("commissionAgentCents"),
      commissionKosCents: mergeForInsert("commissionKosCents"),
      commissionCents: mergeForInsert("commissionCents"),
      sourceOverride: mergeForInsert("sourceOverride"),
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
