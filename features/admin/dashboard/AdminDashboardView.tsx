"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  addDays,
  eachDayOfInterval,
  format,
  formatDistanceToNowStrict,
  isSameDay,
  startOfDay,
} from "date-fns";
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Coins,
  Inbox,
  MessageSquare,
  Sailboat,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type {
  DashboardActivityItem,
  DashboardHeadlineMetrics,
} from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  formatCentsAsCurrency,
  formatCentsAsWholeDollars,
} from "@/shared/lib/utils/money-utils";
import { Badge } from "@/shared/components/ui/badge";

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  followUps: InquiryListItem[];
  weeksBookings: BookingListItem[];
  pendingBookings: BookingListItem[];
  metrics: DashboardHeadlineMetrics;
  recentActivity: DashboardActivityItem[];
}

export function AdminDashboardView({
  firstName,
  pricingTiers,
  followUps,
  weeksBookings,
  pendingBookings,
  metrics,
  recentActivity,
}: AdminDashboardViewProps) {
  // Calendar lane: today → +6 days (the full week glance).
  const weekDays = useMemo(() => {
    const start = startOfDay(new Date());
    return eachDayOfInterval({ start, end: addDays(start, 6) }).map((day) => ({
      day,
      isToday: isSameDay(day, new Date()),
      trips: weeksBookings
        .filter((b) => isSameDay(new Date(b.startDateTime), day))
        .sort(
          (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        ),
    }));
  }, [weeksBookings]);

  const weekRevenue = useMemo(
    () => weeksBookings.reduce((sum, b) => sum + (b.totalAmountCents ?? 0), 0),
    [weeksBookings]
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}{firstName ? `, ${firstName}` : ""}{" "}
            <span aria-hidden="true">👋</span>
          </h1>
        </div>
        <NewBookingModal
          pricingTiers={pricingTiers}
          triggerLabel="New booking"
          triggerSize="default"
          triggerClassName="shrink-0 gap-1.5 rounded-2xl shadow-sm"
        />
      </header>

      <MetricCards metrics={metrics} />

      <WeekAhead days={weekDays} revenueCents={weekRevenue} />

      {/* ── Inbox + Activity (compact, equal columns) ──────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <InboxFeed pending={pendingBookings} leads={followUps} />
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}

/* ───────────────────────── metric cards ───────────────────────── */

function MetricCards({ metrics }: { metrics: DashboardHeadlineMetrics }) {
  const cards = [
    {
      label: `${metrics.monthLabel} GMV`,
      value: formatCentsAsWholeDollars(metrics.gmvMtdCents),
      sub: `${metrics.tripsThisMonth} charter${
        metrics.tripsThisMonth === 1 ? "" : "s"
      } this month`,
      href: "/admin/bookings",
      art: TrendingUp,
    },
    {
      label: "KOS commission",
      value: formatCentsAsWholeDollars(metrics.kosCommissionMtdCents),
      sub: `Earned in ${metrics.monthLabel}`,
      href: "/admin/bookings",
      art: Coins,
    },
    {
      label: "Fleet",
      value: metrics.activeBoats.toLocaleString(),
      sub: "Active boats",
      href: "/admin/boats",
      art: Sailboat,
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(({ label, value, sub, href, art: Art }) => (
        <Link
          key={label}
          href={href}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.05] p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
        >
          {/* Decorative artwork underlay, bottom-right corner */}
          <Art
            aria-hidden="true"
            strokeWidth={1.1}
            className="pointer-events-none absolute -bottom-5 -right-4 h-32 w-32 text-primary/[0.07] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:text-primary/[0.1]"
          />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:text-primary" />
          </div>
          <p className="relative mt-4 text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground">{sub}</p>
        </Link>
      ))}
    </div>
  );
}

/* ───────────────────────── week ahead ───────────────────────── */

function WeekAhead({
  days,
  revenueCents,
}: {
  days: { day: Date; isToday: boolean; trips: BookingListItem[] }[];
  revenueCents: number;
}) {
  const total = days.reduce((sum, d) => sum + d.trips.length, 0);

  return (
    <SectionShell
      title="The week ahead"
      sub={`${total} charter${total === 1 ? "" : "s"} · ${formatCentsAsCurrency(
        revenueCents
      )} expected`}
      action={
        <Link
          href="/admin/bookings?view=calendar"
          className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Open calendar
        </Link>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        {days.map(({ day, isToday, trips }) => (
          <div
            key={day.toISOString()}
            className={cn(
              "flex min-h-[8rem] flex-col border-b border-r border-border/50 p-2.5",
              isToday && "bg-primary/[0.04]"
            )}
          >
            <div className="mb-2 flex items-baseline justify-between">
              <span
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}
              >
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
            {trips.length === 0 ? (
              <span className="mt-1 text-[11px] text-muted-foreground/40">—</span>
            ) : (
              <ul className="flex flex-col gap-1">
                {trips.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/admin/bookings/${t.id}`}
                      className="block rounded-md bg-primary/10 px-1.5 py-1 text-[11px] leading-tight transition-colors hover:bg-primary/20"
                    >
                      <span className="font-medium tabular-nums">
                        {format(new Date(t.startDateTime), "h:mma").toLowerCase()}
                      </span>
                      <span className="block truncate text-muted-foreground">
                        {t.customerName ?? t.boatName ?? "Trip"}
                      </span>
                    </Link>
                  </li>
                ))}
                {trips.length > 3 ? (
                  <Link
                    href="/admin/bookings?view=calendar"
                    className="px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    +{trips.length - 3} more
                  </Link>
                ) : null}
              </ul>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ───────────────────────── inbox feed ───────────────────────── */

function InboxFeed({
  pending,
  leads,
}: {
  pending: BookingListItem[];
  leads: InquiryListItem[];
}) {
  const isEmpty = pending.length === 0 && leads.length === 0;

  return (
    <SectionShell
      title="Needs a reply"
      sub={isEmpty ? "Nothing waiting" : "Booking requests & new leads"}
      action={
        !isEmpty ? <Badge variant="secondary">{pending.length + leads.length}</Badge> : null
      }
    >
      {isEmpty ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="All caught up"
          body="No booking requests or leads need you right now."
          tone="positive"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {pending.map((b) => (
            <li key={`p-${b.id}`}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <FeedIcon tone="warn" icon={CalendarCheck2} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{b.customerName ?? "Guest"}</p>
                    <Badge variant="warning" className="h-4 shrink-0 px-1.5 text-[10px]">
                      Approve
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.boatName ?? "—"} · {format(new Date(b.startDateTime), "MMM d, h:mm a")}
                  </p>
                </div>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition group-hover:text-foreground" />
              </Link>
            </li>
          ))}
          {leads.map((lead) => (
            <li key={`l-${lead.id}`}>
              <Link
                href={`/admin/inquiries/${lead.id}`}
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <FeedIcon tone="muted" icon={Inbox} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNowStrict(new Date(lead.updatedAt))}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.message?.slice(0, 64) || lead.email}
                  </p>
                </div>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!isEmpty ? (
        <div className="mt-auto flex items-center justify-end gap-4 border-t border-border/60 px-4 py-2.5 text-xs">
          <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">
            All inquiries →
          </Link>
          <Link href="/admin/bookings" className="text-muted-foreground hover:text-foreground">
            All requests →
          </Link>
        </div>
      ) : null}
    </SectionShell>
  );
}

/* ───────────────────────── recent activity ───────────────────────── */

function RecentActivity({ items }: { items: DashboardActivityItem[] }) {
  return (
    <SectionShell
      title="Recent activity"
      sub="Latest booking & inquiry updates"
      action={items.length > 0 ? <LiveIndicator /> : null}
    >
      {items.length === 0 ? (
        <EmptyBlock
          icon={Clock}
          title="No recent activity"
          body="Status changes, notes, and contacts will show up here."
        />
      ) : (
        <ul className="divide-y divide-border/50">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
              >
                <FeedIcon
                  tone={item.kind === "booking" ? "primary" : "muted"}
                  icon={item.kind === "booking" ? CalendarCheck2 : MessageSquare}
                />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{item.subjectLabel}</p>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                      {formatDistanceToNowStrict(item.createdAt, { addSuffix: false })}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.message}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}

function FeedIcon({
  icon: Icon,
  tone,
}: {
  icon: LucideIcon;
  tone: "warn" | "muted" | "primary";
}) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
        tone === "warn"
          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
          : tone === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

/* ───────────────────────── shared ───────────────────────── */

function SectionShell({
  title,
  sub,
  action,
  children,
  className,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  body,
  tone = "default",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  tone?: "default" | "positive";
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <Icon
        className={cn(
          "mb-2.5 h-7 w-7",
          tone === "positive" ? "text-emerald-500/60" : "text-muted-foreground/40"
        )}
      />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
