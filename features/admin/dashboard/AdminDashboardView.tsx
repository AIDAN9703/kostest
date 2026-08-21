"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  differenceInCalendarDays,
  differenceInHours,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
} from "date-fns";
import {
  ChevronRight,
  Clock,
  DollarSign,
  Ship,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type {
  DashboardLead,
  FleetLeader,
  RevenueMonth,
} from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import { AssignDealMenu } from "@/features/bookings/components/admin/AssignDealMenu";
import { ClaimDealButton } from "@/features/bookings/components/admin/ClaimDealButton";
import { DEAL_SOURCE_LABELS, PRETRIP_URGENT_HOURS } from "@/features/bookings/deal-status";
import type { AdminOption } from "@/shared/lib/utils/people-display";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsWholeDollars } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";

export type { AdminOption };

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  unassignedLeads: DashboardLead[];
  upcomingTrips: BookingListItem[];
  myDeals: BookingListItem[];
  trend: RevenueMonth[];
  leaders: FleetLeader[];
  admins: AdminOption[];
}

/* ── Layout language ─────────────────────────────────────────────────
   shadcn dashboard-01 anatomy on KOS data: a SectionCards stat row
   (gradient cards + trend badges), an interactive area chart with a
   range toggle, then the two operational lists (departures board +
   action queue), then two recharts breakdowns (pipeline funnel +
   fleet leaderboard). All charts read the admin theme's gold via
   var(--color-primary); the tooltip/legend machinery is the vendored
   shadcn chart.tsx. */

/** Gradient treatment shadcn puts on its stat cards — gold-tinted here. */
const STAT_CARD = "bg-gradient-to-t from-primary/5 to-card";

/** $12.4K / $1.65M — compact money for dense reading. */
function compactMoney(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 10_000) return `$${(dollars / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatCentsAsWholeDollars(cents);
}

/** Whole dollars for chart tooltips/labels (input already in dollars). */
function chartDollars(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

/** Month-over-month percent, null when there is no base to compare. */
function pctChange(current: number, previous: number | undefined | null): number | null {
  if (previous == null || previous === 0) return null;
  return (current - previous) / previous;
}

/** Boat-local timing for a trip row: calendar-day label + urgency. */
function tripTiming(trip: BookingListItem) {
  const start = new Date(trip.startDateTime as Date);
  const parsed = parseDateTimeInBoatTimezone(start, { timezone: trip.boatTimezone });
  const boatDay = parsed.date ?? start;
  return {
    dayLabel: isToday(boatDay)
      ? "today"
      : isTomorrow(boatDay)
        ? "tomorrow"
        : format(boatDay, "EEE, MMM d"),
    imminent: differenceInHours(start, new Date()) <= PRETRIP_URGENT_HOURS,
  };
}

/** What's still missing before this boat can leave the dock. */
function readinessGaps(trip: BookingListItem) {
  const gaps: { label: string; tone: "warning" | "destructive" }[] = [];
  if (trip.needsCaptain && !trip.captainUserId) gaps.push({ label: "Captain", tone: "warning" });
  if (!trip.opsContractSigned) gaps.push({ label: "Contract", tone: "warning" });
  const total = trip.totalAmountCents ?? 0;
  const due = total - (trip.totalPaidCents ?? 0);
  if (total > 0 && due > 0) gaps.push({ label: `${compactMoney(due)} due`, tone: "destructive" });
  return gaps;
}

export function AdminDashboardView({
  firstName,
  pricingTiers,
  unassignedLeads,
  upcomingTrips,
  myDeals,
  trend,
  leaders,
  admins,
}: AdminDashboardViewProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const thisMonth = trend[trend.length - 1];
  const lastMonth = trend.length > 1 ? trend[trend.length - 2] : null;

  // Action queue: unclaimed leads, balances on confirmed trips, gone-quiet deals.
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
  const queueCount = unassignedLeads.length + collectRows.length + staleDeals.length;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 pb-16">
      {/* ── Masthead ── */}
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <NewBookingModal
          pricingTiers={pricingTiers}
          admins={admins}
          triggerLabel="New booking"
          triggerClassName="gap-1.5 rounded-full px-5 shadow-sm"
        />
      </header>

      {/* ── Section cards (dashboard-01 stat row) ── */}
      {thisMonth ? (
        <SectionCards thisMonth={thisMonth} lastMonth={lastMonth} trips={upcomingTrips} />
      ) : null}

      {/* ── Interactive area chart ── */}
      <VolumeAreaChart trend={trend} />

      {/* ── Operational row: fleet leaderboard + action queue ── */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
        {thisMonth ? <FleetChart leaders={leaders} monthName={thisMonth.monthName} /> : null}
        <ActionQueue
          count={queueCount}
          unassignedLeads={unassignedLeads}
          collectRows={collectRows}
          staleDeals={staleDeals}
          admins={admins}
        />
      </div>
    </div>
  );
}

/* ── Section cards ──────────────────────────────────────────────────── */

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta == null) return null;
  const up = delta >= 0;
  return (
    <Badge variant="outline" className="gap-1 tabular-nums">
      {up ? (
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" aria-hidden />
      )}
      {up ? "+" : ""}
      {Math.round(delta * 100)}%
    </Badge>
  );
}

function StatCard({
  label,
  value,
  badge,
  footerLead,
  footerSub,
}: {
  label: string;
  value: string;
  badge?: ReactNode;
  footerLead: ReactNode;
  footerSub: string;
}) {
  return (
    <Card className={cn(STAT_CARD, "gap-4 py-5")}>
      <CardHeader className="gap-1.5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums lg:text-3xl">{value}</CardTitle>
        {badge ? <CardAction>{badge}</CardAction> : null}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex items-center gap-2 font-medium">{footerLead}</div>
        <div className="text-xs text-muted-foreground">{footerSub}</div>
      </CardFooter>
    </Card>
  );
}

function SectionCards({
  thisMonth,
  lastMonth,
  trips,
}: {
  thisMonth: RevenueMonth;
  lastMonth: RevenueMonth | null;
  trips: BookingListItem[];
}) {
  const gmvDelta = pctChange(thisMonth.gmvCents, lastMonth?.gmvCents);
  const commissionDelta = pctChange(thisMonth.commissionCents, lastMonth?.commissionCents);
  const tripsDelta = pctChange(thisMonth.trips, lastMonth?.trips);

  const marginPct =
    thisMonth.gmvCents > 0
      ? Math.round((thisMonth.commissionCents / thisMonth.gmvCents) * 100)
      : null;
  const avgCents = thisMonth.trips > 0 ? Math.round(thisMonth.gmvCents / thisMonth.trips) : 0;

  const nextTrip = trips[0] ?? null;
  const needsPrep = trips.filter((t) => readinessGaps(t).length > 0).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Charter volume"
        value={formatCentsAsWholeDollars(thisMonth.gmvCents)}
        badge={<TrendBadge delta={gmvDelta} />}
        footerLead={
          gmvDelta == null ? (
            <>First month on the books</>
          ) : gmvDelta >= 0 ? (
            <>
              Trending up this month <TrendingUp className="size-4" aria-hidden />
            </>
          ) : (
            <>
              Down vs {lastMonth?.monthName} <TrendingDown className="size-4" aria-hidden />
            </>
          )
        }
        footerSub={`GMV on trips sailing in ${thisMonth.monthName}`}
      />
      <StatCard
        label="KOS commission"
        value={formatCentsAsWholeDollars(thisMonth.commissionCents)}
        badge={<TrendBadge delta={commissionDelta} />}
        footerLead={marginPct != null ? <>{marginPct}% of volume</> : <>No commission logged yet</>}
        footerSub={`KOS earnings on ${thisMonth.monthName} charters`}
      />
      <StatCard
        label="Charters"
        value={String(thisMonth.trips)}
        badge={<TrendBadge delta={tripsDelta} />}
        footerLead={
          avgCents > 0 ? <>{compactMoney(avgCents)} avg per charter</> : <>Nothing on the books yet</>
        }
        footerSub={
          lastMonth
            ? `${thisMonth.monthName} so far · ${lastMonth.trips} sailed in ${lastMonth.monthName}`
            : `Booked for ${thisMonth.monthName}`
        }
      />
      <StatCard
        label="Upcoming departures"
        value={String(trips.length)}
        badge={
          trips.length > 0 ? (
            <Badge variant="outline" className="tabular-nums">
              {needsPrep > 0 ? `${needsPrep} to prep` : "All ready"}
            </Badge>
          ) : undefined
        }
        footerLead={
          nextTrip ? (
            <>
              Next: {nextTrip.boatName ?? "Boat TBD"} · {tripTiming(nextTrip).dayLabel}
            </>
          ) : (
            <>Nothing scheduled</>
          )
        }
        footerSub="Sailing in the next 30 days"
      />
    </div>
  );
}

/* ── Volume area chart ──────────────────────────────────────────────── */

const volumeChartConfig = {
  gmv: {
    label: "Charter volume",
    color: "var(--color-primary)",
  },
  commission: {
    label: "KOS commission",
    color: "#38bdf8",
  },
} satisfies ChartConfig;

const RANGES = [
  { key: "12m", label: "12 months", months: 12 },
  { key: "6m", label: "6 months", months: 6 },
  { key: "3m", label: "3 months", months: 3 },
] as const;

function VolumeAreaChart({ trend }: { trend: RevenueMonth[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("6m");
  const months = RANGES.find((r) => r.key === range)?.months ?? 6;

  const data = useMemo(
    () =>
      trend.slice(-months).map((m) => ({
        month: m.label,
        monthName: m.monthName,
        gmv: Math.round(m.gmvCents / 100),
        commission: Math.round(m.commissionCents / 100),
      })),
    [trend, months]
  );
  const totalCents = useMemo(
    () => trend.slice(-months).reduce((sum, m) => sum + m.gmvCents, 0),
    [trend, months]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charter volume</CardTitle>
        <CardDescription>
          {compactMoney(totalCents)} booked across the last {months} months
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  range === r.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/10 text-muted-foreground hover:bg-foreground/15 hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={volumeChartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillGmv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-gmv)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-gmv)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-commission)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-commission)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.monthName ?? ""}
                  formatter={(value, name, item) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: item?.color }}
                      />
                      <span className="text-muted-foreground">
                        {volumeChartConfig[name as keyof typeof volumeChartConfig]?.label ?? name}
                      </span>
                      <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                        {chartDollars(Number(value))}
                      </span>
                    </>
                  )}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="commission"
              type="natural"
              fill="url(#fillCommission)"
              stroke="var(--color-commission)"
              strokeWidth={2}
            />
            <Area
              dataKey="gmv"
              type="natural"
              fill="url(#fillGmv)"
              stroke="var(--color-gmv)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* ── Action queue ───────────────────────────────────────────────────── */

const QUEUE_ROW =
  "-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/30";

function QueueBubble({
  tone,
  children,
}: {
  tone: "warning" | "destructive" | "sky";
  children: ReactNode;
}) {
  const tones = {
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    sky: "bg-sky-400/15 text-sky-400",
  } as const;
  return (
    <span
      className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", tones[tone])}
      aria-hidden
    >
      {children}
    </span>
  );
}

function ActionQueue({
  count,
  unassignedLeads,
  collectRows,
  staleDeals,
  admins,
}: {
  count: number;
  unassignedLeads: DashboardLead[];
  collectRows: BookingListItem[];
  staleDeals: BookingListItem[];
  admins: AdminOption[];
}) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>Action queue</CardTitle>
        <CardDescription>
          {count === 0 ? "Nothing waiting on you" : `${count} ${count === 1 ? "item needs" : "items need"} a human`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Ship className="h-6 w-6 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">All clear — enjoy the calm water.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {unassignedLeads.length > 0 ? (
              <QueueGroup label="Unclaimed leads">
                {unassignedLeads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} admins={admins} />
                ))}
              </QueueGroup>
            ) : null}
            {collectRows.length > 0 ? (
              <QueueGroup label="Balances to collect">
                {collectRows.map((trip) => (
                  <CollectRow key={trip.id} trip={trip} />
                ))}
              </QueueGroup>
            ) : null}
            {staleDeals.length > 0 ? (
              <QueueGroup label="Gone quiet">
                {staleDeals.map((deal) => (
                  <FollowUpRow key={deal.id} deal={deal} />
                ))}
              </QueueGroup>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QueueGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <ul className="mt-1 divide-y divide-border/30">{children}</ul>
    </div>
  );
}

function LeadRow({ lead, admins }: { lead: DashboardLead; admins: AdminOption[] }) {
  const value = lead.estimatedValueCents ?? lead.budgetCents;
  return (
    // Plain <li> so divide-y dividers stay full width; the overlay Link keeps
    // the whole row clickable while Claim/Assign stay interactive above it.
    <li>
      <div className={cn(QUEUE_ROW, "relative")}>
        <Link
          href={`/admin/bookings/${lead.id}`}
          className="absolute inset-0"
          aria-label={`Open lead from ${lead.name}`}
        />
        <QueueBubble tone="warning">
          <span className="text-[13px] font-bold leading-none">!</span>
        </QueueBubble>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{lead.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {DEAL_SOURCE_LABELS[lead.source ?? ""] ?? "Unknown source"}
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
      <Link href={`/admin/bookings/${trip.id}`} className={QUEUE_ROW}>
        <QueueBubble tone="destructive">
          <DollarSign className="h-3.5 w-3.5" />
        </QueueBubble>
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
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" aria-hidden />
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
      <Link href={`/admin/bookings/${deal.id}`} className={QUEUE_ROW}>
        <QueueBubble tone="sky">
          <Clock className="h-3.5 w-3.5" />
        </QueueBubble>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {deal.customerName || "Unnamed deal"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Quiet {daysQuiet} {daysQuiet === 1 ? "day" : "days"}
            {deal.boatName ? ` · ${deal.boatName}` : ""}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" aria-hidden />
      </Link>
    </li>
  );
}

/* ── Fleet chart ────────────────────────────────────────────────────── */

const fleetChartConfig = {
  gmv: { label: "GMV", color: "var(--color-primary)" },
} satisfies ChartConfig;

function FleetChart({ leaders, monthName }: { leaders: FleetLeader[]; monthName: string }) {
  const router = useRouter();
  const data = leaders.map((l) => ({
    boatId: l.boatId,
    name: l.name,
    trips: l.trips,
    gmv: Math.round(l.gmvCents / 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet leaders</CardTitle>
        <CardDescription>{monthName} GMV by boat</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No charters on the books for {monthName} yet.
          </p>
        ) : (
          <ChartContainer config={fleetChartConfig} className="aspect-auto h-[220px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 56 }}>
              <CartesianGrid horizontal={false} strokeOpacity={0.15} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={130}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        />
                        <span className="text-muted-foreground">
                          {item?.payload?.trips} {item?.payload?.trips === 1 ? "charter" : "charters"}
                        </span>
                        <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                          {chartDollars(Number(value))}
                        </span>
                      </>
                    )}
                  />
                }
              />
              <Bar
                dataKey="gmv"
                fill="var(--color-primary)"
                radius={6}
                className="cursor-pointer"
                onClick={(_, index) => router.push(`/admin/boats/${data[index].boatId}`)}
              >
                <LabelList
                  dataKey="gmv"
                  position="right"
                  formatter={(v) => (Number(v) > 0 ? chartDollars(Number(v)) : "")}
                  className="fill-foreground font-medium tabular-nums"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
