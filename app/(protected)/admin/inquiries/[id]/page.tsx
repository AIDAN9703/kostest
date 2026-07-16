import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";

import { inquiryService } from "@/features/inquiries/inquiry.service";
import { userService } from "@/features/users/user.service";
import {
  LEAD_TYPE_BADGES,
  MANIFEST_LABEL_CLASS,
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
  const isOpen = inquiry.outcome === "OPEN";
  const phoneDigits = inquiry.phone?.replace(/[^\d+]/g, "") ?? "";
  const contactLinkClass =
    "font-mono text-[11px] uppercase tracking-wider underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

  return (
    <div className="flex w-full flex-1 flex-col pb-12">
      {/* Back */}
      <div className="pb-5 pt-1">
        <Link href="/admin/inquiries" className={cn(MANIFEST_LABEL_CLASS, "hover:text-foreground")}>
          ← All inquiries
        </Link>
      </div>

      {/* ── Masthead ─────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start gap-5 pb-6">
        {/* Monogram */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-primary font-serif text-2xl text-primary-foreground">
          {adminInitials(inquiry.name) || "—"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{inquiry.name}</h1>
            <span
              className={cn(
                "inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                badge.className
              )}
            >
              {badge.label}
            </span>
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

          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {SOURCE_LABELS[inquiry.source] ?? inquiry.source}
            {" · received "}
            {formatDistanceToNowStrict(new Date(inquiry.createdAt))} ago
            {" · "}
            {formatDate(inquiry.createdAt)}
          </p>

          {/* Contact links */}
          <div className="mt-3 flex flex-wrap items-center gap-5">
            <a href={`mailto:${inquiry.email}`} className={contactLinkClass}>
              {inquiry.email || "no email"} ↗
            </a>
            {inquiry.phone ? (
              <>
                <a href={`tel:${phoneDigits}`} className={contactLinkClass}>
                  {inquiry.phone} ↗
                </a>
                <a
                  href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactLinkClass}
                >
                  WhatsApp ↗
                </a>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div className="h-0.5 bg-foreground" />

      {/* ── Body: manifest + rail ────────────────────────────── */}
      <div className="grid gap-10 pt-8 lg:grid-cols-3 lg:gap-14">
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-2">
          {/* Trip spec */}
          <section>
            <SectionLabel>Trip spec</SectionLabel>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 pt-5 sm:grid-cols-3">
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
                mono
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
                mono
              />
              <Fact
                label="Duration"
                value={inquiry.requestedDurationDays ? `${inquiry.requestedDurationDays}+ days` : null}
                mono
              />
              <Fact label="Destination" value={inquiry.destination} />
              <Fact label="Guests" value={inquiry.guests != null ? `${inquiry.guests}` : null} mono />
              <Fact label="Budget" value={inquiry.budget} mono />
              <Fact
                label="Estimated total"
                value={
                  inquiry.estimatedTotalCents != null
                    ? formatCentsAsCurrency(inquiry.estimatedTotalCents)
                    : null
                }
                mono
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
              <SectionLabel>Message</SectionLabel>
              <p className="max-w-prose whitespace-pre-wrap pt-4 font-serif text-[15px] leading-relaxed">
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
        <aside className="flex min-w-0 flex-col gap-10 lg:border-l lg:border-border lg:pl-10">
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
              <SectionLabel>Converted</SectionLabel>
              <Link
                href={`/admin/bookings/${inquiry.convertedBookingId}`}
                className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-emerald-700 underline decoration-emerald-500/40 underline-offset-4 transition-colors hover:decoration-emerald-600 dark:text-emerald-400"
              >
                View booking ↗
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={cn(MANIFEST_LABEL_CLASS, "flex items-center gap-3")}>
      <span className="h-px w-6 bg-foreground/50" aria-hidden />
      {children}
    </h2>
  );
}

function Fact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode | null;
  mono?: boolean;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-1 truncate text-sm", mono ? "font-mono tabular-nums" : "font-medium")}>
        {value}
      </dd>
    </div>
  );
}

function InquiryDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pt-1">
      <Skeleton className="h-4 w-28" />
      <div className="flex gap-5">
        <Skeleton className="h-16 w-16" />
        <Skeleton className="h-24 w-full max-w-lg" />
      </div>
      <Skeleton className="h-0.5 w-full" />
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
