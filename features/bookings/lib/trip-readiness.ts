import { isTripImminent } from "@/features/bookings/deal-status";
import { effectiveTotalCents } from "@/features/bookings/lib/booking-money";
import { formatCentsCompact } from "@/shared/lib/utils/money-utils";

/**
 * "Can this boat leave the dock?" — the ONE definition of pre-trip readiness,
 * shared by the dashboard, the assistant tools, and anything else that needs
 * to say what's still missing. A trip is ready when it has a captain (if it
 * needs one), a signed contract, and no balance outstanding.
 */
export interface ReadinessInput {
  needsCaptain: boolean | null;
  captainUserId: string | null;
  opsContractSigned?: boolean | null;
  totalAmountCents: number | null;
  serviceFeeCents?: number | null;
  serviceFeeWaived?: boolean | null;
  totalPaidCents: number | null;
  startDateTime: Date | string | null;
}

export type ReadinessGap =
  | { kind: "captain"; label: "Captain"; tone: "warning" }
  | { kind: "contract"; label: "Contract"; tone: "warning" }
  | { kind: "balance"; label: string; dueCents: number; tone: "destructive" };

export function readinessGaps(trip: ReadinessInput): ReadinessGap[] {
  const gaps: ReadinessGap[] = [];
  if (trip.needsCaptain && !trip.captainUserId) {
    gaps.push({ kind: "captain", label: "Captain", tone: "warning" });
  }
  if (!trip.opsContractSigned) {
    gaps.push({ kind: "contract", label: "Contract", tone: "warning" });
  }
  const total = effectiveTotalCents(trip);
  const due = total - (trip.totalPaidCents ?? 0);
  if (total > 0 && due > 0) {
    gaps.push({ kind: "balance", label: `${formatCentsCompact(due)} due`, dueCents: due, tone: "destructive" });
  }
  return gaps;
}

/** Ready = nothing missing. */
export function isTripReady(trip: ReadinessInput): boolean {
  return readinessGaps(trip).length === 0;
}

/** Urgent = inside the pre-trip window with something still missing. */
export function isTripUrgent(trip: ReadinessInput, now = new Date()): boolean {
  return isTripImminent(trip.startDateTime, now) && readinessGaps(trip).length > 0;
}
