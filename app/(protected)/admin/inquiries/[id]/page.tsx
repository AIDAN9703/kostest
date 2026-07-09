import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";

import { inquiryService } from "@/features/inquiries/inquiry.service";
import { userService } from "@/features/users/user.service";
import {
  LEAD_TYPE_BADGES,
  OUTCOME_CHIP_CLASSES,
  OUTCOME_LABELS,
  SOURCE_LABELS,
  STAGE_CHIP_CLASSES,
  STAGE_LABELS,
  TIME_OF_DAY_LABELS,
} from "@/features/inquiries/inquiry-ui";
import { InquiryTimeline } from "@/features/inquiries/components/InquiryTimeline";
import { InquiryActions } from "@/features/inquiries/components/InquiryActions";
import { InquiryCloseActions } from "@/features/inquiries/components/InquiryCloseActions";
import { InquiryPipelineRail } from "@/features/inquiries/components/InquiryPipelineRail";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn, formatDate, formatPlainDate } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { format } from "date-fns";
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
  const isOpen = inquiry.outcome === "OPEN";
  const phoneDigits = inquiry.phone?.replace(/[^\d+]/g, "") ?? "";

  return (
    <div className="flex w-full flex-1 flex-col pb-10">
      {/* Back */}
      <div className="pb-4 pt-1">
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
        >
          <ArrowLeft className="h-3 w-3" />
          All inquiries
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{inquiry.name}</h1>
            <span
              className={cn(
                "inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                badge.className
              )}
            >
              {badge.label}
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${inquiry.email}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
            >
              <Mail className="h-3 w-3 text-muted-foreground" />
              {inquiry.email}
            </a>
            {inquiry.phone ? (
              <>
                <a
                  href={`tel:${phoneDigits}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
                >
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {inquiry.phone}
                </a>
                <a
                  href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
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
      <div className="grid gap-10 pt-6 lg:grid-cols-3 lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-2">
          {/* Trip request */}
          <section>
            <h2 className="border-b border-border/60 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
              Trip request
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 pt-4 sm:grid-cols-3">
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
                  inquiry.needsCaptain == null ? null : inquiry.needsCaptain ? "Needed" : "Not needed"
                }
              />
              <Fact
                label="SMS consent"
                value={inquiry.smsConsent ? "Yes" : "No"}
              />
            </dl>
          </section>

          {/* Message */}
          {inquiry.message ? (
            <section>
              <h2 className="border-b border-border/60 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Message
              </h2>
              <p className="whitespace-pre-wrap pt-3 text-sm leading-relaxed">
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
        <aside className="flex min-w-0 flex-col gap-8 lg:border-l lg:border-border/60 lg:pl-8">
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
              <h2 className="border-b border-border/60 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Converted
              </h2>
              <Link
                href={`/admin/bookings/${inquiry.convertedBookingId}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                View booking →
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

function InquiryDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pt-1">
      <Skeleton className="h-7 w-28 rounded-full" />
      <Skeleton className="h-24 w-full max-w-xl" />
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
