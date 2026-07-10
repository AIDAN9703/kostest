import Link from "next/link";
import { differenceInHours, formatDistanceToNowStrict } from "date-fns";
import { Inbox } from "lucide-react";

import type { InquiryWithAssignee } from "@/features/inquiries/inquiry.service";
import {
  LEAD_TYPE_BADGES,
  OUTCOME_CHIP_CLASSES,
  OUTCOME_LABELS,
  SOURCE_LABELS,
  STAGE_CHIP_CLASSES,
  STAGE_LABELS,
  leadTripSummary,
} from "@/features/inquiries/inquiry-ui";
import { adminDisplayName, adminInitials } from "./AssignInquiryMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";

interface InquiriesListProps {
  inquiries: InquiryWithAssignee[];
}

/**
 * Contained list card — the template list treatment for admin pages:
 * one rounded container, hairline-divided rows, full-row click.
 */
export function InquiriesList({ inquiries }: InquiriesListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Inbox className="mb-3 h-7 w-7 text-muted-foreground/40" />
          <p className="text-sm font-medium">No inquiries found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different tab or clear the search.
          </p>
        </div>
      ) : (
        <>
          {/* Column labels — same grid template as the rows below. */}
          <div className="hidden gap-x-5 border-b border-border/60 bg-muted/30 px-4 py-2 sm:px-5 lg:grid lg:grid-cols-[minmax(0,4.5fr)_minmax(0,5.5fr)_minmax(0,2.2fr)_minmax(0,2.2fr)]">
            <ColumnLabel>Lead</ColumnLabel>
            <ColumnLabel>Trip request</ColumnLabel>
            <ColumnLabel className="text-right">Value / Stage</ColumnLabel>
            <ColumnLabel className="text-right">Assigned to</ColumnLabel>
          </div>
          <ul className="divide-y divide-border/50">
            {inquiries.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ColumnLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

function InquiryRow({ inquiry }: { inquiry: InquiryWithAssignee }) {
  const badge = LEAD_TYPE_BADGES[inquiry.leadType] ?? LEAD_TYPE_BADGES.GENERAL_QUOTE;
  const trip = leadTripSummary(inquiry);
  const isOpen = inquiry.outcome === "OPEN";
  const ageHours = differenceInHours(new Date(), new Date(inquiry.createdAt));
  const isStale = isOpen && !inquiry.assignedTo && ageHours >= 24;

  return (
    <li className="relative flex flex-col gap-x-5 gap-y-1.5 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5 lg:grid lg:grid-cols-[minmax(0,4.5fr)_minmax(0,5.5fr)_minmax(0,2.2fr)_minmax(0,2.2fr)] lg:items-center">
      {/* Who */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              badge.className
            )}
          >
            {badge.label}
          </span>
          <span className="truncate text-sm font-medium">{inquiry.name}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {SOURCE_LABELS[inquiry.source] ?? inquiry.source}
          {" · "}
          <span
            className={cn(
              "tabular-nums",
              isStale && "font-medium text-amber-700 dark:text-amber-400"
            )}
          >
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
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{inquiry.message}</p>
        ) : null}
      </div>

      {/* Value + stage */}
      <div className="flex items-center gap-2 lg:flex-col lg:items-end lg:gap-1">
        <span className="text-sm font-medium tabular-nums">
          {inquiry.estimatedTotalCents != null ? (
            formatCentsAsCurrency(inquiry.estimatedTotalCents)
          ) : inquiry.budget ? (
            <span className="text-muted-foreground">{inquiry.budget}</span>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </span>
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
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
            <Avatar className="h-6 w-6 shrink-0">
              {inquiry.assignee.profileImage ? (
                <AvatarImage
                  src={inquiry.assignee.profileImage}
                  alt={adminDisplayName(inquiry.assignee)}
                />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {adminInitials(adminDisplayName(inquiry.assignee))}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs text-muted-foreground">
              {adminDisplayName(inquiry.assignee)}
            </span>
          </>
        ) : isOpen ? (
          <span className="text-xs font-medium text-red-600 dark:text-red-400">Unassigned</span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
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
