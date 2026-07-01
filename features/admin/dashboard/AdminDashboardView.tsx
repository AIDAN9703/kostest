"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Inbox,
  MessageSquare,
  UserPlus,
  Users,
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
import { assignInquiry } from "@/features/inquiries/inquiry.actions";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  formatCentsAsCurrency,
  formatCentsAsWholeDollars,
} from "@/shared/lib/utils/money-utils";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useToast } from "@/shared/lib/hooks/use-toast";

export type AdminOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  profileImage: string | null;
};

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  followUps: InquiryListItem[];
  unassignedLeads: InquiryListItem[];
  weeksBookings: BookingListItem[];
  pendingBookings: BookingListItem[];
  metrics: DashboardHeadlineMetrics;
  recentActivity: DashboardActivityItem[];
  admins: AdminOption[];
}

/** Reused crisp card surface — white in light mode so it reads clearly. */
const CARD = "rounded-2xl border border-border bg-white shadow-sm dark:bg-card";

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function adminName(a: AdminOption) {
  return [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminDashboardView({
  firstName,
  pricingTiers,
  followUps,
  unassignedLeads,
  weeksBookings,
  pendingBookings,
  metrics,
  recentActivity,
  admins,
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
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}
            {firstName ? `, ${firstName}` : ""} <span aria-hidden="true">👋</span>
          </h1>
        </div>
        <NewBookingModal
          pricingTiers={pricingTiers}
          triggerLabel="New booking"
          triggerSize="default"
          triggerClassName="shrink-0 gap-1.5 rounded-xl shadow-sm"
        />
      </header>

      {/* ── Week ahead (majority) + monthly snapshot (skinny) ──────── */}
      {/* items-start so neither card stretches to match the other's height. */}
      <div className="grid items-start gap-5 xl:grid-cols-4">
        <WeekAhead
          className="xl:col-span-3"
          days={weekDays}
          revenueCents={weekRevenue}
        />
        <MonthlySnapshot className="xl:col-span-1" metrics={metrics} />
      </div>

      {/* ── Leads to assign + booking requests ─────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-3">
        <UnassignedLeads
          className="xl:col-span-2"
          leads={unassignedLeads}
          count={metrics.unassignedLeads}
          admins={admins}
        />
        <BookingRequests pending={pendingBookings} />
      </div>

      {/* ── Activity + follow-ups ──────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-3">
        <RecentActivity className="xl:col-span-2" items={recentActivity} />
        <FollowUps items={followUps} />
      </div>
    </div>
  );
}

/* ───────────────────────── the month ───────────────────────── */

/** Compact, ledger-style financials + growth for the current month. */
function MonthlySnapshot({
  metrics,
  className,
}: {
  metrics: DashboardHeadlineMetrics;
  className?: string;
}) {
  const rows = [
    { label: "GMV", value: formatCentsAsWholeDollars(metrics.gmvMtdCents) },
    {
      label: "KOS commission",
      value: formatCentsAsWholeDollars(metrics.kosCommissionMtdCents),
    },
    { label: "Vessels added", value: metrics.boatsAddedThisMonth.toLocaleString() },
    { label: "New users", value: metrics.newUsersThisMonth.toLocaleString() },
  ];

  return (
    <SectionShell className={className} title="The Month" sub={metrics.monthLabel}>
      <div className="flex flex-col divide-y divide-border/40">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold tabular-nums tracking-tight">
              {value}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ───────────────────────── week ahead ───────────────────────── */

function WeekAhead({
  days,
  revenueCents,
  className,
}: {
  days: { day: Date; isToday: boolean; trips: BookingListItem[] }[];
  revenueCents: number;
  className?: string;
}) {
  const total = days.reduce((sum, d) => sum + d.trips.length, 0);

  return (
    <SectionShell
      className={className}
      title="The week ahead"
      sub={`${total} charter${total === 1 ? "" : "s"} · ${formatCentsAsCurrency(
        revenueCents
      )} expected`}
      action={
        <Link
          href="/admin/bookings?view=calendar"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
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
              "flex min-h-[8.5rem] flex-col border-b border-r border-border/50 p-2.5",
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

/* ───────────────────────── unassigned leads ───────────────────────── */

function UnassignedLeads({
  leads,
  admins,
  count,
  className,
}: {
  leads: InquiryListItem[];
  admins: AdminOption[];
  count: number;
  className?: string;
}) {
  return (
    <SectionShell
      className={className}
      title="Unassigned leads"
      sub={leads.length === 0 ? "Every lead has an owner" : "Assign so nothing gets missed"}
      action={
        count > 0 ? (
          <Badge variant="warning" className="shrink-0">
            {count}
          </Badge>
        ) : null
      }
    >
      {leads.length === 0 ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="All leads assigned"
          body="New leads without an owner will appear here for quick routing."
          tone="positive"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <UserPlus className="h-4 w-4" />
              </span>
              <Link
                href={`/admin/inquiries/${lead.id}`}
                className="group min-w-0 flex-1"
              >
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium group-hover:underline">
                    {lead.name}
                  </p>
                  {lead.leadType ? (
                    <Badge
                      variant="secondary"
                      className="h-4 shrink-0 px-1.5 text-[10px] font-medium"
                    >
                      {humanize(lead.leadType)}
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {formatDistanceToNowStrict(new Date(lead.createdAt))} old
                  </span>{" "}
                  · {lead.message?.slice(0, 48) || lead.email}
                </p>
              </Link>
              <AssignMenu inquiryId={lead.id} admins={admins} />
            </li>
          ))}
        </ul>
      )}

      {leads.length > 0 ? (
        <div className="mt-auto flex items-center justify-end border-t border-border/60 px-4 py-2.5 text-xs">
          <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">
            All inquiries →
          </Link>
        </div>
      ) : null}
    </SectionShell>
  );
}

function AssignMenu({
  inquiryId,
  admins,
}: {
  inquiryId: string;
  admins: AdminOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function assign(admin: AdminOption) {
    setPending(true);
    const res = await assignInquiry(inquiryId, admin.id);
    setPending(false);
    if (res.success) {
      toast({ title: `Assigned to ${adminName(admin)} ✓` });
      router.refresh();
    } else {
      toast({
        title: "Couldn't assign",
        description: res.error,
        variant: "destructive",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending || admins.length === 0}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Assign
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Assign to
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {admins.map((admin) => {
          const name = adminName(admin);
          return (
            <DropdownMenuItem
              key={admin.id}
              onSelect={() => assign(admin)}
              className="gap-2"
            >
              <Avatar className="h-6 w-6">
                {admin.profileImage ? (
                  <AvatarImage src={admin.profileImage} alt={name} />
                ) : null}
                <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ───────────────────────── booking requests ───────────────────────── */

function BookingRequests({ pending }: { pending: BookingListItem[] }) {
  return (
    <SectionShell
      title="Booking requests"
      sub={pending.length === 0 ? "Nothing waiting" : "Awaiting your approval"}
      action={
        pending.length > 0 ? (
          <Badge variant="warning" className="shrink-0">
            {pending.length}
          </Badge>
        ) : null
      }
    >
      {pending.length === 0 ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="All caught up"
          body="No booking requests need your approval right now."
          tone="positive"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {pending.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <FeedIcon tone="warn" icon={CalendarCheck2} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {b.customerName ?? "Guest"}
                    </p>
                    <Badge variant="warning" className="h-4 shrink-0 px-1.5 text-[10px]">
                      Approve
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.boatName ?? "—"} ·{" "}
                    {format(new Date(b.startDateTime), "MMM d, h:mm a")}
                  </p>
                </div>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* ───────────────────────── follow ups ───────────────────────── */

function FollowUps({ items }: { items: InquiryListItem[] }) {
  return (
    <SectionShell
      title="Needs follow-up"
      sub={items.length === 0 ? "Nothing waiting" : "Oldest open inquiries"}
    >
      {items.length === 0 ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="All caught up"
          body="Open inquiries that have gone quiet will surface here."
          tone="positive"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((lead) => (
            <li key={lead.id}>
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
                    {lead.message?.slice(0, 56) || lead.email}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* ───────────────────────── recent activity ───────────────────────── */

function RecentActivity({
  items,
  className,
}: {
  items: DashboardActivityItem[];
  className?: string;
}) {
  return (
    <SectionShell
      className={className}
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
    <section className={cn(CARD, "flex min-w-0 flex-col overflow-hidden", className)}>
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
