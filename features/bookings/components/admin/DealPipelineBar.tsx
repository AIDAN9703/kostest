"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Snowflake } from "lucide-react";

import { updateInquiryStage } from "@/features/inquiries/inquiry.actions";
import type { DealStatus } from "@/features/bookings/deal-status";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * THE deal lifecycle bar — one pipeline for every deal, lead or booking.
 * Lead-phase steps are clickable while the row is still a lead; the money
 * steps light up from payment state once a booking exists. Cancelled/Lost
 * render as a banner instead of a step.
 */
const DEAL_STEPS = [
  { label: "Inquiry", leadStage: "NEW" },
  { label: "Contacted", leadStage: "CONTACTED" },
  { label: "Proposal sent", leadStage: "OFFER_SENT" },
  { label: "Deposit in", leadStage: null },
  { label: "Paid", leadStage: null },
  { label: "Completed", leadStage: null },
] as const;

function leadStepIndex(stage: string): number {
  if (stage === "OFFER_SENT" || stage === "CONVERTED") return 2;
  if (stage === "CONTACTED" || stage === "QUALIFIED") return 1;
  return 0; // NEW / NEEDS_CONTACT / CLAIMED / COLD
}

function bookingStepIndex(dealStatus: DealStatus): number {
  switch (dealStatus) {
    case "COMPLETED":
      return 5;
    case "PAYMENT_COMPLETE":
    case "RECONCILE":
      return 4;
    case "DEPOSIT_IN":
      return 3;
    default:
      // A booking exists, so the deal is at least at the proposal step.
      return 2;
  }
}

interface DealPipelineBarProps {
  /** Lead mode: pass the inquiry — steps 1-3 become clickable. */
  lead?: { inquiryId: string; stage: string; outcome: string };
  /** Booking mode: pass the computed deal status. */
  dealStatus?: DealStatus;
}

export function DealPipelineBar({ lead, dealStatus }: DealPipelineBarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const isLead = Boolean(lead);
  const isCold = lead?.stage === "COLD";
  const isOpenLead = lead?.outcome === "OPEN";

  const terminal =
    dealStatus === "CANCELLED" || lead?.outcome === "LOST"
      ? "Cancelled"
      : dealStatus === "ARCHIVED" || lead?.outcome === "ABANDONED"
        ? "Archived"
        : null;

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

  const currentIndex = lead
    ? isCold
      ? -1
      : leadStepIndex(lead.stage)
    : bookingStepIndex(dealStatus ?? "INQUIRY");

  async function setLeadStage(stage: string) {
    if (!lead || !isOpenLead || pending) return;
    setPending(true);
    const res = await updateInquiryStage(lead.inquiryId, stage);
    setPending(false);
    if (res.success) {
      router.refresh();
    } else {
      toast({ title: "Couldn't update stage", description: res.error, variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      <ol className="flex min-w-0 flex-1 items-center">
        {DEAL_STEPS.map((step, i) => {
          const isDone = currentIndex > i;
          const isCurrent = currentIndex === i;
          const clickable =
            isLead && isOpenLead && !pending && step.leadStage != null && !isCurrent;
          return (
            <li key={step.label} className={cn("flex items-center", i > 0 && "min-w-0 flex-1")}>
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1.5 h-px min-w-3 flex-1 sm:mx-2",
                    isDone || isCurrent ? "bg-primary/50" : "bg-border/70"
                  )}
                />
              ) : null}
              <button
                type="button"
                disabled={!clickable}
                onClick={() => step.leadStage && setLeadStage(step.leadStage)}
                title={
                  isLead && step.leadStage == null
                    ? "Reached automatically once a booking exists"
                    : undefined
                }
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 transition-colors",
                  clickable && "cursor-pointer hover:bg-muted/60"
                )}
              >
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
                    "whitespace-nowrap text-xs sm:text-sm",
                    isCurrent
                      ? "font-semibold"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Cold toggle — leads only */}
      {lead && isOpenLead ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => setLeadStage(isCold ? "NEW" : "COLD")}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            isCold
              ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Snowflake className="h-3 w-3" />
          {isCold ? "Cold — click to revive" : "Mark cold"}
        </button>
      ) : null}
    </div>
  );
}
