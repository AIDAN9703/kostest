"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Snowflake } from "lucide-react";

import { updateInquiryStage } from "@/features/inquiries/inquiry.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

const PIPELINE_STAGES = [
  { value: "NEW", label: "New" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "OFFER_SENT", label: "Offer sent" },
  { value: "CONVERTED", label: "Converted" },
] as const;

/** Legacy NEEDS_CONTACT is displayed and treated as NEW. */
function normalizeStage(stage: string) {
  return stage === "NEEDS_CONTACT" ? "NEW" : stage;
}

interface InquiryPipelineBarProps {
  inquiryId: string;
  stage: string;
  outcome: string;
}

/**
 * Horizontal pipeline stepper — the funnel reads left to right across the
 * header. Steps are clickable to move the lead (Converted is set only by
 * booking creation); the cold toggle sits at the far end.
 */
export function InquiryPipelineBar({ inquiryId, stage, outcome }: InquiryPipelineBarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const current = normalizeStage(stage);
  const isOpen = outcome === "OPEN";
  const isCold = current === "COLD";
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.value === current);

  async function setStage(newStage: string) {
    if (!isOpen || pending || newStage === current) return;
    setPending(true);
    const res = await updateInquiryStage(inquiryId, newStage);
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
        {PIPELINE_STAGES.map((s, i) => {
          const isDone = !isCold && currentIndex > i;
          const isCurrent = !isCold && currentIndex === i;
          const isConverted = s.value === "CONVERTED";
          const clickable = isOpen && !isConverted && !pending && !isCurrent;
          return (
            <li key={s.value} className={cn("flex items-center", i > 0 && "min-w-0 flex-1")}>
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
                onClick={() => setStage(s.value)}
                title={
                  isConverted
                    ? "Set automatically when a booking is created from this lead"
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
                        : "text-muted-foreground",
                    isConverted && !isCurrent && "text-muted-foreground/60"
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Cold toggle */}
      {isOpen ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => setStage(isCold ? "NEW" : "COLD")}
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
