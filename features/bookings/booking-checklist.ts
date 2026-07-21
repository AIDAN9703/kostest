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

/** Display grouping for the checks panel (fleet-inspection style sections). */
export type BookingChecklistSection = "Sales" | "Money" | "Paperwork" | "Crew" | "Trip";

export interface BookingChecklistItem {
  id: string;
  label: string;
  /** Short hover explanation — surfaces *where* the truth comes from. */
  hint: string;
  done: boolean;
  kind: BookingChecklistItemKind;
  /** Only set when `kind === "manual"`. */
  field?: BookingChecklistManualField;
  section: BookingChecklistSection;
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
  // Lead-phase inputs (drive the INQUIRY checklist)
  assignedAdminId?: string | null;
  firstContactedAt?: Date | string | null;
  boatId?: string | null;
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

  // Inquiry stage gets its own to-do list: work the lead, pick a boat, get a
  // proposal out. The booking checklist takes over once the deal is priced.
  if (input.bookingStatus === "INQUIRY" || input.bookingStatus === "PENDING") {
    return [
      {
        id: "adminAssigned",
        label: "Admin assigned",
        hint: "Auto: an admin owns this deal. Claim it or assign via Quick actions.",
        done: !!input.assignedAdminId,
        kind: "derived",
        section: "Sales",
      },
      {
        id: "customerContacted",
        label: "Customer contacted",
        hint: "Auto: set when a contact is logged (Quick actions → Log contact).",
        done: input.firstContactedAt != null,
        kind: "derived",
        section: "Sales",
      },
      {
        id: "boatSelected",
        label: "Boat selected",
        hint: "Auto: a boat is linked to this deal.",
        done: !!input.boatId,
        kind: "derived",
        section: "Trip",
      },
      {
        id: "proposalSent",
        label: "Proposal sent",
        hint: "Auto: done once this is priced into a proposal (moves the deal past the inquiry stage).",
        done: false,
        kind: "derived",
        section: "Paperwork",
      },
    ];
  }

  return [
    {
      id: "contractSigned",
      label: "Contract signed",
      hint: "Charter agreement signed by client. Toggle when you receive the signed copy.",
      done: !!input.opsContractSigned,
      kind: "manual",
      field: "contractSigned",
      section: "Paperwork",
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
      section: "Money",
    },
    {
      id: "captainAssigned",
      label: "Captain assigned",
      hint: "Auto: captain user is linked on the booking. Assign one in Trip details.",
      done: !!input.captainUserId,
      kind: "derived",
      section: "Crew",
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
      section: "Money",
    },
    {
      id: "captainPaid",
      label: "Captain paid",
      hint: "Captain payout sent (Zelle / wire / cash). Toggle once the captain has been paid.",
      done: !!input.opsCaptainPaid,
      kind: "manual",
      field: "captainPaid",
      section: "Crew",
    },
    {
      id: "tripCompleted",
      label: "Trip completed",
      hint: tripCompleted
        ? "Booking status is COMPLETED."
        : `Auto: marked when booking status transitions to COMPLETED (currently ${input.bookingStatus}).`,
      done: tripCompleted,
      kind: "derived",
      section: "Trip",
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

