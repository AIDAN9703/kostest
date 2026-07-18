import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { differenceInHours, format, formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { inquiryService } from "@/features/inquiries/inquiry.service";
import { userService } from "@/features/users/user.service";
import {
  LEAD_TYPE_AVATAR_TINTS,
  LEAD_TYPE_BADGES,
  OUTCOME_CHIP_CLASSES,
  OUTCOME_LABELS,
  SOURCE_LABELS,
  TIME_OF_DAY_LABELS,
  adminDisplayName,
  adminInitials,
} from "@/features/inquiries/inquiry-ui";
import { InquiryTimeline } from "@/features/inquiries/components/InquiryTimeline";
import { InquiryActions } from "@/features/inquiries/components/InquiryActions";
import { InquiryCloseActions } from "@/features/inquiries/components/InquiryCloseActions";
import { DealPipelineBar } from "@/features/bookings/components/admin/DealPipelineBar";
import {
  ContactField,
  DealHeaderCard,
} from "@/features/bookings/components/admin/view-booking/DealHeaderCard";
import { AssignInquiryMenu } from "@/features/inquiries/components/AssignInquiryMenu";
import { ClaimInquiryButton } from "@/features/inquiries/components/ClaimInquiryButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn, formatDate, formatPlainDate } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { InquiryEvent } from "@/database/types";

/**
 * The lead-phase face of the unified deal page. Rendered by
 * /admin/bookings/[id] when the id resolves to an unconverted inquiry —
 * same design language as the booking view, one pipeline vocabulary.
 */
export function LeadDetailView({ inquiryId }: { inquiryId: string }) {
  return (
    <Suspense fallback={<InquiryDetailSkeleton />}>
      <InquiryDetail inquiryId={inquiryId} />
    </Suspense>
  );
}

async function InquiryDetail({ inquiryId }: { inquiryId: string }) {
  const [inquiry, admins] = await Promise.all([
    inquiryService.getInquiryById(inquiryId),
    userService.getAdmins(),
  ]);

  if (!inquiry) notFound();

  const badge = LEAD_TYPE_BADGES[inquiry.leadType] ?? LEAD_TYPE_BADGES.GENERAL_QUOTE;
  const tint = LEAD_TYPE_AVATAR_TINTS[inquiry.leadType] ?? LEAD_TYPE_AVATAR_TINTS.GENERAL_QUOTE;
  const isOpen = inquiry.outcome === "OPEN";
  const phoneDigits = inquiry.phone?.replace(/[^\d+]/g, "") ?? "";
  const events = inquiry.events as InquiryEvent[];

  const ageHours = differenceInHours(new Date(), new Date(inquiry.createdAt));
  const isStale = isOpen && !inquiry.assignee && ageHours >= 24;

  // Lost/archived reason lives on the closing OUTCOME_CHANGE event.
  const closeReason = !isOpen
    ? (events.find(
        (e) => e.eventType === "OUTCOME_CHANGE" && e.newOutcome === inquiry.outcome
      )?.content ?? null)
    : null;

  const estimatedValue =
    inquiry.estimatedTotalCents != null
      ? formatCentsAsCurrency(inquiry.estimatedTotalCents)
      : (inquiry.budget ?? null);

  return (
    <div className="flex w-full flex-1 flex-col pb-8">
      {/* Back */}
      <div className="pb-4 pt-1">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted/70"
        >
          <ArrowLeft className="h-3 w-3" />
          All bookings
        </Link>
      </div>

      {/* ── One grid, two rows — cards in the same row stretch to equal
             height so every edge lines up:
             row 1: identity header (2/3) · action center (1/3)
             row 2: trip request (2/3) · activity (1/3) ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Identity header — identical structure on both faces of the deal page */}
        <DealHeaderCard
          eyebrow={`Inquiry #${inquiry.id.slice(0, 6).toUpperCase()}`}
          name={inquiry.name}
          avatarInitials={adminInitials(inquiry.name) || "?"}
          avatarClassName={tint}
          typeChip={
            <span
              className={cn(
                "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold",
                badge.className
              )}
            >
              {badge.label}
            </span>
          }
          meta={
            <>
              {SOURCE_LABELS[inquiry.source] ?? inquiry.source}
              {" · received "}
              <span className={cn("tabular-nums", isStale && "font-medium text-warning")}>
                {formatDistanceToNowStrict(new Date(inquiry.createdAt))} ago
              </span>
              {" · "}
              {formatDate(inquiry.createdAt)}
            </>
          }
          value={estimatedValue ? { label: "Est. value", text: estimatedValue } : null}
          email={inquiry.email}
          phone={inquiry.phone}
          extraContact={
            <ContactField label="SMS consent" value={inquiry.smsConsent ? "Yes" : "No"} />
          }
          pipeline={
            isOpen ? (
              <DealPipelineBar
                lead={{ inquiryId: inquiry.id, stage: inquiry.stage, outcome: inquiry.outcome }}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    OUTCOME_CHIP_CLASSES[inquiry.outcome] ?? OUTCOME_CHIP_CLASSES.OPEN
                  )}
                >
                  {OUTCOME_LABELS[inquiry.outcome] ?? inquiry.outcome}
                </span>
                {closeReason ? (
                  <span className="text-sm text-muted-foreground">{closeReason}</span>
                ) : null}
                {inquiry.convertedBookingId ? (
                  <Link
                    href={`/admin/bookings/${inquiry.convertedBookingId}`}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3.5 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20"
                  >
                    View booking →
                  </Link>
                ) : null}
              </div>
            )
          }
        />

        {/* Action center — row 1 right, squared off with the header */}
        <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold">Assigned to</h2>
            <div className="flex items-center gap-3 pt-3">
              {inquiry.assignee ? (
                <>
                  <Avatar className="h-8 w-8 shrink-0">
                    {inquiry.assignee.profileImage ? (
                      <AvatarImage
                        src={inquiry.assignee.profileImage}
                        alt={adminDisplayName(inquiry.assignee)}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {adminInitials(adminDisplayName(inquiry.assignee))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {adminDisplayName(inquiry.assignee)}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-sm font-medium text-destructive">Unassigned</span>
              )}
              {!inquiry.assignee && isOpen ? (
                <ClaimInquiryButton inquiryId={inquiry.id} />
              ) : null}
              <AssignInquiryMenu
                inquiryId={inquiry.id}
                admins={admins}
                currentAssigneeId={inquiry.assignee?.id ?? null}
                triggerLabel={inquiry.assignee ? "Reassign" : "Assign"}
              />
            </div>
          </div>

          <div className="mt-auto border-t border-border/50 pt-4">
            <InquiryCloseActions inquiryId={inquiry.id} currentOutcome={inquiry.outcome} />
          </div>
        </section>

          {/* Trip request — row 2 left */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:col-span-2">
            <h2 className="border-b border-border/50 px-5 py-3 text-sm font-semibold">
              Trip request
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
              <Fact
                label="Boat requested"
                value={
                  inquiry.boatId ? (
                    <Link
                      href={`/boats/${inquiry.boatId}`}
                      className="text-primary-strong hover:underline"
                    >
                      {inquiry.boatName ?? "View boat"}
                    </Link>
                  ) : null
                }
              />
              <Fact
                label="Date"
                value={
                  inquiry.requestedStartDateTime
                    ? formatDate(inquiry.requestedStartDateTime)
                    : inquiry.preferredDate
                      ? formatPlainDate(inquiry.preferredDate)
                      : inquiry.date
                        ? formatDate(inquiry.date)
                        : null
                }
              />
              <Fact
                label="Time"
                value={
                  inquiry.requestedStartDateTime
                    ? format(new Date(inquiry.requestedStartDateTime), "h:mm a")
                    : inquiry.preferredTimeOfDay
                      ? (TIME_OF_DAY_LABELS[inquiry.preferredTimeOfDay] ?? null)
                      : (inquiry.time ?? null)
                }
              />
              <Fact
                label="Duration"
                value={
                  inquiry.requestedDurationDays ? `${inquiry.requestedDurationDays}+ days` : null
                }
              />
              <Fact label="Destination" value={inquiry.destination} />
              <Fact label="Guests" value={inquiry.guests != null ? `${inquiry.guests}` : null} />
              <Fact label="Budget" value={inquiry.budget} />
              <Fact
                label="Estimated total"
                value={
                  inquiry.estimatedTotalCents != null
                    ? formatCentsAsCurrency(inquiry.estimatedTotalCents)
                    : null
                }
              />
              <Fact
                label="Captain"
                value={
                  inquiry.needsCaptain == null
                    ? null
                    : inquiry.needsCaptain
                      ? "Needed"
                      : "Not needed"
                }
              />
            </dl>
            {inquiry.message ? (
              <div className="border-t border-border/50 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Message
                </p>
                <p className="mt-1.5 max-w-prose whitespace-pre-wrap text-sm leading-relaxed">
                  {inquiry.message}
                </p>
              </div>
            ) : null}
          </section>

        {/* Activity — row 2 right, squared off with the trip request */}
        <section className="min-w-0 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <InquiryTimeline
              events={events}
              actions={
                <InquiryActions
                  inquiryId={inquiry.id}
                  currentStage={inquiry.stage}
                  currentOutcome={inquiry.outcome}
                />
              }
            />
        </section>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

function InquiryDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-1">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-44 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
