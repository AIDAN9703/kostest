import { Check } from "lucide-react";

import type { DealStatus } from "@/features/bookings/deal-status";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * THE deal lifecycle bar — one pipeline for every deal, read-only because
 * every step is derived: Contacted from firstContactedAt, Proposal sent from
 * DRAFT, Accepted from APPROVED (the customer's approval — the admin's was
 * sending it), the money steps from the payments ledger, Completed from
 * status. Actions that move the deal live in the header and section cards.
 */
const DEAL_STEPS = [
  "Inquiry",
  "Contacted",
  "Proposal sent",
  "Accepted",
  "Partial payment",
  "Payment complete",
  "Completed",
] as const;

function stepIndex(dealStatus: DealStatus, contacted: boolean): number {
  switch (dealStatus) {
    case "COMPLETED":
      return 6;
    case "PAYMENT_COMPLETE":
    case "DISPUTE":
      return 5;
    case "PARTIAL_PAYMENT":
      return 4;
    case "ACCEPTED":
      return 3;
    case "PROPOSAL_SENT":
      return 2;
    default:
      // INQUIRY / BOOKING_INQUIRY bucket — pre-proposal either way.
      return contacted ? 1 : 0;
  }
}

interface DealPipelineBarProps {
  dealStatus: DealStatus;
  /** firstContactedAt set — lights the Contacted step for INQUIRY deals. */
  contacted?: boolean;
}

export function DealPipelineBar({ dealStatus, contacted = false }: DealPipelineBarProps) {
  const terminal =
    dealStatus === "CANCELLED" ? "Cancelled" : dealStatus === "ARCHIVED" ? "Archived" : null;

  if (terminal) {
    return (
      <span
        className={cn(
          "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold",
          terminal === "Cancelled"
            ? "bg-destructive-soft text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        {terminal}
      </span>
    );
  }

  const currentIndex = stepIndex(dealStatus, contacted);

  return (
    <div className="overflow-x-auto">
      {/* w-max: labels never wrap/squash — the row scrolls instead.
          min-w-full: on wide screens the connectors stretch to fill. */}
      <ol className="flex w-max min-w-full items-center">
        {DEAL_STEPS.map((label, i) => {
          const isDone = currentIndex > i;
          const isCurrent = currentIndex === i;
          return (
            <li key={label} className={cn("flex items-center", i > 0 && "flex-1")}>
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1 h-px min-w-2.5 flex-1 sm:mx-1.5",
                    isDone || isCurrent ? "bg-primary/50" : "bg-border/70"
                  )}
                />
              ) : null}
              <span className="flex shrink-0 items-center gap-1.5 px-1.5 py-1">
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
                    isDone && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background ring-2 ring-primary/30",
                    !isDone && !isCurrent && "border-border bg-background"
                  )}
                >
                  {isDone ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs",
                    isCurrent
                      ? "font-semibold"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
