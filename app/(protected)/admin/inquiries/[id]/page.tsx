import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";

import { inquiryService } from "@/features/inquiries/inquiry.service";
import { userService } from "@/features/users/user.service";
import {
  LEAD_TYPE_AVATAR_TINTS,
  LEAD_TYPE_BADGES,
  OUTCOME_CHIP_CLASSES,
  OUTCOME_LABELS,
  SOURCE_LABELS,
  STAGE_CHIP_CLASSES,
  STAGE_LABELS,
  TIME_OF_DAY_LABELS,
  adminInitials,
} from "@/features/inquiries/inquiry-ui";
import { InquiryTimeline } from "@/features/inquiries/components/InquiryTimeline";
import { InquiryActions } from "@/features/inquiries/components/InquiryActions";
import { InquiryCloseActions } from "@/features/inquiries/components/InquiryCloseActions";
import { InquiryPipelineRail } from "@/features/inquiries/components/InquiryPipelineRail";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn, formatDate, formatPlainDate } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { InquiryEvent } from "@/database/types";

interface InquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 30;

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<InquiryDetailSkeleton />}>
      <InquiryDetail inquiryId={resolvedParams.id} />
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
  const contactChipClass =
    "inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted/70";

  return (
    <div className="flex w-full flex-1 flex-col pb-12">
      {/* Back */}
      <div className="pb-5 pt-1">
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted/70"
        >
          <ArrowLeft className="h-3 w-3" />
          All inquiries
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-start gap-4 pb-8">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold",
            tint
          )}
        >
          {adminInitials(inquiry.name) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{inquiry.name}</h1>
            <span
              className={cn(
                "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold",
                badge.className
              )}
            >
              {badge.label}
            </span>
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

          <p className="mt-1 text-xs text-muted-foreground">
            {SOURCE_LABELS[inquiry.source] ?? inquiry.source}
            {" · received "}
            <span className="tabular-nums">
              {formatDistanceToNowStrict(new Date(inquiry.createdAt))} ago
            </span>
            {" · "}
            {formatDate(inquiry.createdAt)}
          </p>

          {/* Contact chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {inquiry.email ? (
              <a href={`mailto:${inquiry.email}`} className={contactChipClass}>
                <Mail className="h-3 w-3 text-muted-foreground" />
                {inquiry.email}
              </a>
            ) : null}
            {inquiry.phone ? (
              <>
                <a href={`tel:${phoneDigits}`} className={contactChipClass}>
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {inquiry.phone}
                </a>
                <a
                  href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactChipClass}
                >
                  <MessageCircle className="h-3 w-3 text-muted-foreground" />
                  WhatsApp
                </a>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Body: main + rail */}
      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-2">
          {/* Trip request — soft panel */}
          <section>
            <h2 className="pb-3 text-sm font-semibold">Trip request</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl bg-muted/40 p-5 sm:grid-cols-3">
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
                value={inquiry.requestedDurationDays ? `${inquiry.requestedDurationDays}+ days` : null}
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
                  inquiry.needsCaptain == null ? null : inquiry.needsCaptain ? "Needed" : "Not needed"
                }
              />
              <Fact label="SMS consent" value={inquiry.smsConsent ? "Yes" : "No"} />
            </dl>
          </section>

          {/* Message */}
          {inquiry.message ? (
            <section>
              <h2 className="pb-3 text-sm font-semibold">Message</h2>
              <p className="max-w-prose whitespace-pre-wrap rounded-2xl bg-muted/40 p-5 text-sm leading-relaxed">
                {inquiry.message}
              </p>
            </section>
          ) : null}

          {/* Activity */}
          <InquiryTimeline
            events={inquiry.events as InquiryEvent[]}
            actions={
              <InquiryActions
                inquiryId={inquiry.id}
                currentStage={inquiry.stage}
                currentOutcome={inquiry.outcome}
              />
            }
          />
        </div>

        {/* Rail */}
        <aside className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-8 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <InquiryPipelineRail
              inquiryId={inquiry.id}
              stage={inquiry.stage}
              outcome={inquiry.outcome}
              assignee={inquiry.assignee}
              admins={admins}
            />
            <InquiryCloseActions inquiryId={inquiry.id} currentOutcome={inquiry.outcome} />
            {inquiry.convertedBookingId ? (
              <section>
                <h2 className="pb-3 text-sm font-semibold">Converted</h2>
                <Link
                  href={`/admin/bookings/${inquiry.convertedBookingId}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                >
                  View booking →
                </Link>
              </section>
            ) : null}
          </div>
        </aside>
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
    <div className="flex flex-1 flex-col gap-6 pt-1">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="flex gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <Skeleton className="h-24 w-full max-w-lg" />
      </div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
