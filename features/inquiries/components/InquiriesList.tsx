import Link from "next/link";
import { differenceInHours, formatDistanceToNowStrict } from "date-fns";

import type { InquiryWithAssignee } from "@/features/inquiries/inquiry.service";
import {
  LEAD_TYPE_BADGES,
  LEAD_TYPE_SPINES,
  OUTCOME_CHIP_CLASSES,
  OUTCOME_LABELS,
  SOURCE_LABELS,
  STAGE_CHIP_CLASSES,
  STAGE_LABELS,
  adminDisplayName,
  adminInitials,
  leadTripSummary,
} from "@/features/inquiries/inquiry-ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";

interface InquiriesListProps {
  inquiries: InquiryWithAssignee[];
  /** 1-based position of the first row, so ledger numbers survive pagination. */
  startIndex?: number;
}

/**
 * The Charter Manifest — ledger-numbered rows on heavy ink rules.
 * Template list treatment for the admin.
 */
export function InquiriesList({ inquiries, startIndex = 1 }: InquiriesListProps) {
  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="font-serif text-xl italic text-muted-foreground">
          The manifest is clear.
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
          No inquiries match — adjust scope, outcome, or search
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col">
      {inquiries.map((inquiry, i) => (
        <InquiryRow key={inquiry.id} inquiry={inquiry} index={startIndex + i} />
      ))}
    </ol>
  );
}

function InquiryRow({ inquiry, index }: { inquiry: InquiryWithAssignee; index: number }) {
  const badge = LEAD_TYPE_BADGES[inquiry.leadType] ?? LEAD_TYPE_BADGES.GENERAL_QUOTE;
  const spine = LEAD_TYPE_SPINES[inquiry.leadType] ?? LEAD_TYPE_SPINES.GENERAL_QUOTE;
  const trip = leadTripSummary(inquiry);
  const isOpen = inquiry.outcome === "OPEN";
  const ageHours = differenceInHours(new Date(), new Date(inquiry.createdAt));
  const isStale = isOpen && !inquiry.assignedTo && ageHours >= 24;

  return (
    <li className="group relative border-b border-border/60 transition-colors hover:bg-muted/30">
      <div className="flex flex-col gap-x-5 gap-y-2 py-4 lg:grid lg:grid-cols-[2.5rem_minmax(0,4.5fr)_minmax(0,5fr)_minmax(0,2fr)_minmax(0,1.8fr)_minmax(0,2.4fr)] lg:items-center">
        {/* Ledger number */}
        <span className="hidden font-mono text-[11px] tabular-nums text-muted-foreground/50 lg:block">
          {String(index).padStart(2, "0")}
        </span>

        {/* Who — serif name on a type spine */}
        <div className={cn("min-w-0 border-l-2 pl-3", spine)}>
          <p className="truncate font-serif text-[17px] leading-snug">{inquiry.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {badge.label}
            {" · "}
            {SOURCE_LABELS[inquiry.source] ?? inquiry.source}
            {" · "}
            <span className={cn(isStale && "font-semibold text-amber-700 dark:text-amber-400")}>
              {formatDistanceToNowStrict(new Date(inquiry.createdAt))} ago
            </span>
          </p>
        </div>

        {/* Trip intent */}
        <div className="min-w-0">
          <p className="truncate text-sm">
            {trip ?? <span className="text-muted-foreground/50">No trip details</span>}
          </p>
          {inquiry.message ? (
            <p className="mt-0.5 truncate font-serif text-[13px] italic text-muted-foreground">
              “{inquiry.message}”
            </p>
          ) : null}
        </div>

        {/* Value */}
        <span className="font-mono text-sm tabular-nums lg:text-right">
          {inquiry.estimatedTotalCents != null ? (
            formatCentsAsCurrency(inquiry.estimatedTotalCents)
          ) : inquiry.budget ? (
            <span className="text-muted-foreground">{inquiry.budget}</span>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </span>

        {/* Stage / outcome tag */}
        <div className="lg:justify-self-center">
          <span
            className={cn(
              "inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
              isOpen
                ? (STAGE_CHIP_CLASSES[inquiry.stage] ?? STAGE_CHIP_CLASSES.NEW)
                : (OUTCOME_CHIP_CLASSES[inquiry.outcome] ?? OUTCOME_CHIP_CLASSES.OPEN)
            )}
          >
            {isOpen
              ? (STAGE_LABELS[inquiry.stage] ?? inquiry.stage)
              : (OUTCOME_LABELS[inquiry.outcome] ?? inquiry.outcome)}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex min-w-0 items-center gap-2 lg:justify-end">
          {inquiry.assignee ? (
            <>
              <Avatar className="h-5 w-5 shrink-0">
                {inquiry.assignee.profileImage ? (
                  <AvatarImage
                    src={inquiry.assignee.profileImage}
                    alt={adminDisplayName(inquiry.assignee)}
                  />
                ) : null}
                <AvatarFallback className="text-[9px]">
                  {adminInitials(adminDisplayName(inquiry.assignee))}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {adminDisplayName(inquiry.assignee)}
              </span>
            </>
          ) : isOpen ? (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Unassigned
            </span>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground/40">—</span>
          )}
        </div>
      </div>

      {/* Whole row navigates to the inquiry. */}
      <Link
        href={`/admin/inquiries/${inquiry.id}`}
        aria-label={`View inquiry from ${inquiry.name}`}
        className="absolute inset-0"
      />
    </li>
  );
}
