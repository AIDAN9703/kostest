import type { CaptainStatus, CrewStatus } from "@/database/types";

export function canPromoteToCaptain(
  status: CaptainStatus | null | undefined
): boolean {
  return status == null || status === "INACTIVE";
}

export function canPromoteToCrew(status: CrewStatus | null | undefined): boolean {
  // PENDING: legacy promote used PENDING; allow again so admin can activate for assignment.
  return status == null || status === "INACTIVE" || status === "PENDING";
}
