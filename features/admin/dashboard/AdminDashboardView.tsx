"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  addDays,
  differenceInCalendarDays,
  differenceInHours,
  eachDayOfInterval,
  format,
  formatDistanceToNowStrict,
  isSameDay,
  isToday,
  isTomorrow,
  startOfDay,
} from "date-fns";
import { ChevronRight, Clock, DollarSign } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type {
  DashboardHeadlineMetrics,
  DashboardLead,
  PipelineSnapshot,
} from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import { AssignDealMenu } from "@/features/bookings/components/admin/AssignDealMenu";
import { ClaimDealButton } from "@/features/bookings/components/admin/ClaimDealButton";
import { DEAL_SOURCE_LABELS, PRETRIP_URGENT_HOURS } from "@/features/bookings/deal-status";
import type { AdminOption } from "@/shared/lib/utils/people-display";
import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { formatCentsAsWholeDollars } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";

export type { AdminOption };

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  unassignedLeads: DashboardLead[];
  upcomingTrips: BookingListItem[];
  myDeals: BookingListItem[];
  pipeline: PipelineSnapshot;
  metrics: DashboardHeadlineMetrics;
  admins: AdminOption[];
}

/* ── Layering (lighter = closer, per admin-theme.css) ────────────────
   canvas dark-bg → section surfaces bg-card → nested pieces
   bg-secondary (#1c2f40, a real step lighter than card — bg-muted is
   DARKER than card and reads flat, never use it for elevation inside
   a card). Pipeline + This week stay as open sections with uppercase
   labels; Your move + Recent activity are detail-page cards. Worklist
   rows share one anatomy: tone bubble → name → muted meta line. */

const SECTION_HEAD =
  "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
// Worklist row shell; the parent <ul> draws dividers (divide-y).
const ROW =
  "-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/30";

const BUBBLE_TONE = {
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  sky: "bg-sky-400/15 text-sky-400",
} as const;

/** The shared row badge — a small tone-colored notification bubble. */
function RowBubble({ tone, children }: { tone: keyof typeof BUBBLE_TONE; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        BUBBLE_TONE[tone]
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

/** $12.4K / $1.65M — compact money for dense reading. */
function compactMoney(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 10_000) return `$${(dollars / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatCentsAsWholeDollars(cents);
}

function tripTiming(trip: BookingListItem) {
  const start = new Date(trip.startDateTime as Date);
  // Boat-local throughout: a Mykonos trip must not be labelled by the
  // viewer's calendar day.
  const boat = { timezone: trip.boatTimezone };
  const parsed = parseDateTimeInBoatTimezone(start, boat);
  const boatDay = parsed.date ?? start;
  return {
    start,
    dayLabel: isToday(boatDay)
      ? "today"
      : isTomorrow(boatDay)
        ? "tomorrow"
        : format(boatDay, "EEE, MMM d"),
    time: parsed.time ? formatTime12Hour(parsed.time) : "",
    imminent: differenceInHours(start, new Date()) <= PRETRIP_URGENT_HOURS,
  };
}

/** What's still missing before this boat can leave the dock. */
function readinessGaps(trip: BookingListItem) {
  const gaps: string[] = [];
  if (trip.needsCaptain && !trip.captainUserId) gaps.push("Captain");
  if (!trip.opsContractSigned) gaps.push("Contract");
  const total = trip.totalAmountCents ?? 0;
  if (total > 0 && (trip.totalPaidCents ?? 0) < total) gaps.push("Balance");
  return gaps;
}

export function AdminDashboardView({
  firstName,
  pricingTiers,
  unassignedLeads,
  upcomingTrips,
  myDeals,
  pipeline,
  metrics,
  admins,
}: AdminDashboardViewProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Seven-day schedule: today + 6.
  const week = useMemo(() => {
    const start = startOfDay(new Date());
    return eachDayOfInterval({ start, end: addDays(start, 6) }).map((day) => ({
      day,
      isToday: isSameDay(day, new Date()),
      trips: upcomingTrips
        .filter((t) => isSameDay(new Date(t.startDateTime as Date), day))
        .sort(
          (a, b) =>
            new Date(a.startDateTime as Date).getTime() -
            new Date(b.startDateTime as Date).getTime()
        ),
    }));
  }, [upcomingTrips]);

  // Your move: unclaimed leads, balances to chase on confirmed trips, stale deals.
  const collectRows = useMemo(
    () =>
      upcomingTrips
        .filter(
          (t) =>
            t.bookingStatus === "CONFIRMED" &&
            (t.totalAmountCents ?? 0) > 0 &&
            (t.totalPaidCents ?? 0) < (t.totalAmountCents ?? 0)
        )
        .slice(0, 4),
    [upcomingTrips]
  );
  const staleDeals = useMemo(
    () =>
      myDeals
        .filter(
          (d) =>
            differenceInCalendarDays(new Date(), new Date(d.firstContactedAt ?? d.createdAt)) >= 3
        )
        .slice(0, 4),
    [myDeals]
  );

  const yourMoveCount = unassignedLeads.length + collectRows.length + staleDeals.length;

  return (
    <div className="flex w-full flex-1 flex-col gap-10 pb-16">
      {/* ── Header: greeting + the month in one line ── */}
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {metrics.monthLabel} so far:{" "}
            <span className="font-semibold text-primary-strong">
              {compactMoney(metrics.gmvMtdCents)}
            </span>{" "}
            across{" "}
            <span className="font-medium text-foreground">{metrics.tripsThisMonth}</span>{" "}
            {metrics.tripsThisMonth === 1 ? "charter" : "charters"} ·{" "}
            <span className="font-medium text-foreground">
              {compactMoney(metrics.kosCommissionMtdCents)}
            </span>{" "}
            commission
          </p>
        </div>
        <NewBookingModal
          pricingTiers={pricingTiers}
          admins={admins}
          triggerLabel="New booking"
          triggerClassName="gap-1.5 rounded-full px-5 shadow-sm"
        />
      </header>

      {/* ── Pipeline: the funnel as one connected bar ── */}
      <section>
        <h2 className={SECTION_HEAD}>Pipeline</h2>
        <div className="mt-2 flex items-stretch overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
          <PipelineStage
            href="/admin/bookings?bookingType=INQUIRY"
            count={pipeline.leads}
            label="Leads"
            valueCents={pipeline.leadsValueCents}
            estimate
          />
          <PipelineStage
            href="/admin/bookings?bookingStatus=DRAFT"
            count={pipeline.proposalsOut}
            label="Proposals out"
            valueCents={pipeline.proposalsValueCents}
          />
          <PipelineStage
            href="/admin/bookings?bookingStatus=APPROVED"
            count={pipeline.awaitingPayment}
            label="Awaiting payment"
            valueCents={pipeline.awaitingPaymentValueCents}
          />
          <PipelineStage
            href="/admin/bookings?bookingType=BOOKING&time=upcoming"
            count={pipeline.bookedUpcoming}
            label="Booked & upcoming"
            valueCents={pipeline.bookedUpcomingValueCents}
            last
          />
        </div>
      </section>

      {/* ── This week on the water ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className={SECTION_HEAD}>This week</h2>
          <Link
            href="/admin/bookings?view=calendar"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Full calendar →
          </Link>
        </div>
        <div className="mt-2 overflow-x-auto">
          <div className="grid min-w-[42rem] grid-cols-7 gap-1.5">
            {week.map(({ day, isToday: today, trips }) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[6.5rem] rounded-xl p-2",
                  today ? "bg-primary-soft" : "bg-muted/30"
                )}
              >
                <p
                  className={cn(
                    "px-0.5 pb-1.5 text-[11px] font-semibold",
                    today ? "text-primary-strong" : "text-muted-foreground"
                  )}
                >
                  {today ? "Today" : format(day, "EEE d")}
                </p>
                {trips.length === 0 ? (
                  <p className="px-0.5 text-xs text-muted-foreground/30">—</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {trips.slice(0, 3).map((t) => {
                      const gaps = readinessGaps(t);
                      return (
                        <Link
                          key={t.id}
                          href={`/admin/bookings/${t.id}`}
                          className="rounded-lg bg-card/80 px-1.5 py-1 transition-colors hover:bg-card"
                        >
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                gaps.length === 0
                                  ? "bg-success"
                                  : tripTiming(t).imminent
                                    ? "bg-destructive"
                                    : "bg-warning"
                              )}
                              aria-hidden
                            />
                            <span className="truncate text-[11px] font-medium tabular-nums text-foreground">
                              {tripTiming(t).time || "TBD"}
                            </span>
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {t.boatName ?? t.customerName ?? "Charter"}
                          </span>
                        </Link>
                      );
                    })}
                    {trips.length > 3 ? (
                      <span className="px-1 text-[10px] text-muted-foreground">
                        +{trips.length - 3} more
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Your move ── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-baseline gap-2 text-base">
              Your move
              {yourMoveCount > 0 ? (
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {yourMoveCount}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yourMoveCount === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nothing waiting on you.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {unassignedLeads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} admins={admins} />
                ))}
                {collectRows.map((trip) => (
                  <CollectRow key={trip.id} trip={trip} />
                ))}
                {staleDeals.map((deal) => (
                  <FollowUpRow key={deal.id} deal={deal} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────── */

function PipelineStage({
  href,
  count,
  label,
  valueCents,
  estimate = false,
  last = false,
}: {
  href: string;
  count: number;
  label: string;
  valueCents: number;
  estimate?: boolean;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-w-[11rem] flex-1 items-center justify-between gap-2 px-5 py-4 transition-colors first:rounded-l-2xl last:rounded-r-2xl hover:bg-secondary/30 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-border/50"
    >
      <span>
        <span className="block text-2xl font-semibold leading-7 tabular-nums text-foreground">
          {count}
        </span>
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        <span className="mt-0.5 block text-[11px] tabular-nums text-muted-foreground/70">
          {valueCents > 0 ? `${estimate ? "est. " : ""}${compactMoney(valueCents)}` : "—"}
        </span>
      </span>
      {!last ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" aria-hidden />
      ) : null}
    </Link>
  );
}

function LeadRow({ lead, admins }: { lead: DashboardLead; admins: AdminOption[] }) {
  const value = lead.estimatedValueCents ?? lead.budgetCents;
  return (
    // Plain <li> so divide-y dividers stay full row width; the -mx-2 hover
    // surface lives on the inner div (same as the Link rows).
    <li>
      <div className={cn(ROW, "relative")}>
        <Link
          href={`/admin/bookings/${lead.id}`}
          className="absolute inset-0"
          aria-label={`Open lead from ${lead.name}`}
        />
        <RowBubble tone="warning">
          <span className="text-[13px] font-bold leading-none">!</span>
        </RowBubble>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{lead.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            New lead · {DEAL_SOURCE_LABELS[lead.source ?? ""] ?? "Unknown source"}
            {value ? ` · est. ${compactMoney(value)}` : ""} ·{" "}
            {formatDistanceToNowStrict(new Date(lead.createdAt))} ago
          </span>
        </span>
        <span className="relative z-10 flex shrink-0 items-center gap-1.5">
          <ClaimDealButton bookingId={lead.id} />
          <AssignDealMenu bookingId={lead.id} admins={admins} />
        </span>
      </div>
    </li>
  );
}

function CollectRow({ trip }: { trip: BookingListItem }) {
  const timing = tripTiming(trip);
  const total = trip.totalAmountCents ?? 0;
  const paid = trip.totalPaidCents ?? 0;
  return (
    <li>
      <Link href={`/admin/bookings/${trip.id}`} className={ROW}>
        <RowBubble tone="destructive">
          <DollarSign className="h-3.5 w-3.5" />
        </RowBubble>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {trip.customerName || "Unnamed customer"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Collect {compactMoney(total - paid)} · sails{" "}
            <span className={cn(timing.imminent && "font-medium text-destructive")}>
              {timing.dayLabel}
            </span>
            {total > 0 ? ` · ${Math.round((paid / total) * 100)}% paid` : ""}
          </span>
        </span>
      </Link>
    </li>
  );
}

function FollowUpRow({ deal }: { deal: BookingListItem }) {
  const daysQuiet = differenceInCalendarDays(
    new Date(),
    new Date(deal.firstContactedAt ?? deal.createdAt)
  );
  return (
    <li>
      <Link href={`/admin/bookings/${deal.id}`} className={ROW}>
        <RowBubble tone="sky">
          <Clock className="h-3.5 w-3.5" />
        </RowBubble>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {deal.customerName || "Unnamed deal"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Follow up · quiet {daysQuiet} {daysQuiet === 1 ? "day" : "days"}
            {deal.boatName ? ` · ${deal.boatName}` : ""}
          </span>
        </span>
      </Link>
    </li>
  );
}
