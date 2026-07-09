"use client";

import { useQueryStates } from "nuqs";
import { inquirySearchParams } from "../searchParams";
import { cn } from "@/shared/lib/utils/general-utils";
import type { InquiryOutcome, InquiryStage } from "@/database/schema";

const OUTCOME_TABS: { value: InquiryOutcome | null; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "ABANDONED", label: "Archived" },
  { value: null, label: "All" },
];

const STAGE_PILLS: { value: InquiryStage; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "OFFER_SENT", label: "Offer sent" },
  { value: "CONVERTED", label: "Converted" },
  { value: "COLD", label: "Cold" },
];

/** Outcome tabs + stage pills, synced to the URL. */
export function InquiryFilterPills() {
  const [filters, setFilters] = useQueryStates(inquirySearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Outcome segmented control */}
      <div className="flex items-center rounded-full bg-muted p-0.5">
        {OUTCOME_TABS.map((tab) => {
          const active = filters.outcome === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setFilters({ outcome: tab.value, page: 1 })}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stage pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STAGE_PILLS.map((pill) => {
          const active = filters.stage === pill.value;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() =>
                setFilters({ stage: active ? null : pill.value, page: 1 })
              }
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
