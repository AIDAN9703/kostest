/**
 * Booking lifecycle checklist
 *
 * Renders the at-a-glance "what's still left to do" list on the admin booking
 * detail page (mirrors the test-route design). Some items are **derived** from
 * real data (payments ledger, captain assignment, booking status), others are
 * **manual flags** on `booking_ops` that the admin toggles.
 *
 * Derived items can never drift out of sync with reality. Manual flags exist
 * because the actual event happens outside the app (DocuSign-style contract
 * signing, Zelle/wire to captain).
 */
import {
  computeEffectiveGmvCents,
  computeOpsBalanceOwnerCents,
} from "@/shared/lib/utils/ops-revenue";
import type { BookingDetails } from "@/features/bookings/booking.types";

/**
 * Manual flags toggle a column on `booking_ops`. Derived flags are read-only.
 */
export type BookingChecklistItemKind = "manual" | "derived";

/**
 * The `booking_ops` column we mutate when an admin toggles a manual item.
 * Kept narrow on purpose — only flags we actually surface in the checklist.
 */
export type BookingChecklistManualField = "contractSigned" | "captainPaid";

export interface BookingChecklistItem {
  id: string;
  label: string;
  /** Short hover explanation — surfaces *where* the truth comes from. */
  hint: string;
  done: boolean;
  kind: BookingChecklistItemKind;
  /** Only set when `kind === "manual"`. */
  field?: BookingChecklistManualField;
}

export interface ComputeBookingChecklistInput {
  bookingStatus: BookingDetails["bookingStatus"];
  totalAmountCents: number | null | undefined;
  totalPaidCents: number | null | undefined;
  captainUserId: string | null | undefined;
  opsContractSigned: boolean | null | undefined;
  opsCaptainPaid: boolean | null | undefined;
  opsGmvCents: number | null | undefined;
  opsExpenseCents: number | null | undefined;
  opsSentToOwnerCents: number | null | undefined;
}

/**
 * Build the canonical checklist for a booking. Order = lifecycle order.
 *
 * Reordering rules: keep the "needs-something-from-admin" items near the top
 * so the page reads like a to-do list, with the trip-completion item last.
 */
export function computeBookingChecklist(
  input: ComputeBookingChecklistInput
): BookingChecklistItem[] {
  const totalAmount = Number(input.totalAmountCents ?? 0);
  const totalPaid = Number(input.totalPaidCents ?? 0);
  const clientPaidInFull = totalAmount > 0 && totalPaid >= totalAmount;

  const effectiveGmv = computeEffectiveGmvCents(
    input.opsGmvCents,
    input.totalAmountCents
  );
  const expense = Number(input.opsExpenseCents ?? 0);
  const ownerBalance = computeOpsBalanceOwnerCents(
    input.opsExpenseCents,
    input.opsSentToOwnerCents
  );
  const ownerPaidOut = expense > 0 && ownerBalance <= 0;

  const tripCompleted = input.bookingStatus === "COMPLETED";

  return [
    {
      id: "contractSigned",
      label: "Contract signed",
      hint: "Charter agreement signed by client. Toggle when you receive the signed copy.",
      done: !!input.opsContractSigned,
      kind: "manual",
      field: "contractSigned",
    },
    {
      id: "clientPaidInFull",
      label: "Client paid in full",
      hint:
        totalAmount > 0
          ? `Auto: sum of succeeded payments (${(totalPaid / 100).toFixed(0)}) vs charter total (${(totalAmount / 100).toFixed(0)}).`
          : "Auto: no charter total set yet.",
      done: clientPaidInFull,
      kind: "derived",
    },
    {
      id: "captainAssigned",
      label: "Captain assigned",
      hint: "Auto: captain user is linked on the booking. Assign one in Trip details.",
      done: !!input.captainUserId,
      kind: "derived",
    },
    {
      id: "ownerPaidOut",
      label: "Owner paid out",
      hint:
        expense > 0
          ? "Auto: cumulative sent-to-owner meets or exceeds the owner expense total."
          : "Auto: no owner expense recorded yet — add expense lines in the Ops section.",
      done: ownerPaidOut,
      kind: "derived",
    },
    {
      id: "captainPaid",
      label: "Captain paid",
      hint: "Captain payout sent (Zelle / wire / cash). Toggle once the captain has been paid.",
      done: !!input.opsCaptainPaid,
      kind: "manual",
      field: "captainPaid",
    },
    {
      id: "tripCompleted",
      label: "Trip completed",
      hint: tripCompleted
        ? "Booking status is COMPLETED."
        : `Auto: marked when booking status transitions to COMPLETED (currently ${input.bookingStatus}).`,
      done: tripCompleted,
      kind: "derived",
    },
  ];

  // Note (re-introduce later): if you want explicit "Captain confirmed for
  // charter" and "Post-trip review sent" rows from the test design, that's a
  // small migration adding two booleans on `booking_ops` and two more entries
  // here. Skipped for now per the user's "no migration" Phase 1 scope.
  // Also note: `effectiveGmv` is computed for the hint above but currently not
  // surfaced; kept around for clarity if we add a "Charter quoted" item later.
  void effectiveGmv;
}

/**
 * Progress summary — used to render the "3 / 6 complete" pill in the card header.
 */
export interface BookingChecklistSummary {
  done: number;
  total: number;
  /** 0..1 */
  ratio: number;
}

export function summarizeChecklist(
  items: BookingChecklistItem[]
): BookingChecklistSummary {
  const done = items.filter((item) => item.done).length;
  return {
    done,
    total: items.length,
    ratio: items.length === 0 ? 0 : done / items.length,
  };
}
