import Link from "next/link";
import { differenceInHours, formatDistanceToNowStrict } from "date-fns";
import { Inbox } from "lucide-react";

import type { InquiryWithAssignee } from "@/features/inquiries/inquiry.service";
import {
  LEAD_TYPE_AVATAR_TINTS,
  LEAD_TYPE_BADGES,
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
}

const ROW_GRID =
  "lg:grid lg:grid-cols-[minmax(0,3.8fr)_minmax(0,3.8fr)_minmax(0,2.2fr)_minmax(0,1.7fr)_minmax(0,1.6fr)_minmax(0,2.1fr)] lg:items-center";

/**
 * Contained list card — rounded container, soft column labels,
 * tinted lead avatars, full-row click. The admin template list.
 */
export function InquiriesList({ inquiries }: InquiriesListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold">No inquiries found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different tab or clear the search.
          </p>
        </div>
      ) : (
        <>
          {/* Column labels */}
          <div
            className={cn(
              "hidden gap-x-5 border-b border-border/50 bg-muted/40 px-5 py-2.5",
              ROW_GRID
            )}
          >
            <ColumnLabel>Lead</ColumnLabel>
            <ColumnLabel>Trip request</ColumnLabel>
            <ColumnLabel>Boat requested</ColumnLabel>
            <ColumnLabel className="lg:text-right">Value</ColumnLabel>
            <ColumnLabel className="lg:text-center">Status</ColumnLabel>
            <ColumnLabel className="lg:text-right">Assigned to</ColumnLabel>
          </div>

          <ul className="divide-y divide-border/40">
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
        "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

function InquiryRow({ inquiry }: { inquiry: InquiryWithAssignee }) {
  const badge = LEAD_TYPE_BADGES[inquiry.leadType] ?? LEAD_TYPE_BADGES.GENERAL_QUOTE;
  const tint = LEAD_TYPE_AVATAR_TINTS[inquiry.leadType] ?? LEAD_TYPE_AVATAR_TINTS.GENERAL_QUOTE;
  const trip = leadTripSummary(inquiry);
  const isOpen = inquiry.outcome === "OPEN";
  const ageHours = differenceInHours(new Date(), new Date(inquiry.createdAt));
  const isStale = isOpen && !inquiry.assignedTo && ageHours >= 24;

  return (
    <li
      className={cn(
        "relative flex flex-col gap-x-5 gap-y-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:px-5",
        ROW_GRID
      )}
    >
      {/* Lead */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            tint
          )}
        >
          {adminInitials(inquiry.name) || "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{inquiry.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {badge.label}
            {" · "}
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
      </div>

      {/* Trip request */}
      <div className="min-w-0">
        <p className="truncate text-sm">
          {trip ?? <span className="text-muted-foreground/50">No trip details</span>}
        </p>
        {inquiry.message ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{inquiry.message}</p>
        ) : null}
      </div>

      {/* Boat requested */}
      <div className="min-w-0">
        {inquiry.boatId ? (
          inquiry.boatName ? (
            <Link
              href={`/boats/${inquiry.boatId}`}
              className="relative z-10 inline-block max-w-full truncate text-sm font-medium text-primary hover:underline"
            >
              {inquiry.boatName}
            </Link>
          ) : (
            <span className="text-sm font-medium">Yes</span>
          )
        ) : (
          <span className="text-sm text-muted-foreground/50">No</span>
        )}
      </div>

      {/* Value */}
      <span className="text-sm font-semibold tabular-nums lg:text-right">
        {inquiry.estimatedTotalCents != null ? (
          formatCentsAsCurrency(inquiry.estimatedTotalCents)
        ) : inquiry.budget ? (
          <span className="font-medium text-muted-foreground">{inquiry.budget}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </span>

      {/* Status */}
      <div className="lg:justify-self-center">
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold",
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
            <span className="truncate text-xs font-medium text-muted-foreground">
              {adminDisplayName(inquiry.assignee)}
            </span>
          </>
        ) : isOpen ? (
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
            Unassigned
          </span>
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
