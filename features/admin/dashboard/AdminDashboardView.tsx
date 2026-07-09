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
import { CheckCircle2, UserPlus, Users } from "lucide-react";

import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type { DashboardHeadlineMetrics } from "@/features/admin/dashboard";
import {
  MOCK_OPS_ALERTS,
  type DashboardOpsAlert,
} from "@/features/admin/dashboard/dashboard-mock-data";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { assignInquiry } from "@/features/inquiries/inquiry.actions";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  formatCentsAsCurrency,
  formatCentsAsWholeDollars,
} from "@/shared/lib/utils/money-utils";
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
  unassignedLeads: InquiryListItem[];
  weeksBookings: BookingListItem[];
  pendingBookings: BookingListItem[];
  metrics: DashboardHeadlineMetrics;
  admins: AdminOption[];
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

/** $12.4K / $1.65M — compact money for dense rows. */
function formatCentsCompact(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (dollars >= 10_000) return `$${(dollars / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatCentsAsWholeDollars(cents);
}

export function AdminDashboardView({
  firstName,
  pricingTiers,
  unassignedLeads,
  weeksBookings,
  pendingBookings,
  metrics,
  admins,
}: AdminDashboardViewProps) {
  const days = useMemo(() => {
    const start = startOfDay(new Date());
    return eachDayOfInterval({ start, end: addDays(start, 6) }).map((day) => ({
      day,
      trips: weeksBookings
        .filter((b) => isSameDay(new Date(b.startDateTime), day))
        .sort(
          (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        ),
    }));
  }, [weeksBookings]);

  const today = days[0];
  const upcoming = days.slice(1);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex w-full flex-1 flex-col pb-10">
      {/* ═══ Command bar ═══════════════════════════════════════ */}
      <header className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border/60 pb-5 pt-1">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {format(new Date(), "EEE, MMM d")}
          </p>
          <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </div>

        {/* inline stats ticker */}
        <div className="order-last flex w-full flex-wrap items-center gap-x-7 gap-y-2 lg:order-none lg:ml-auto lg:w-auto">
          <Tick value={formatCentsAsWholeDollars(metrics.gmvMtdCents)} label={`${metrics.monthLabel} GMV`} href="/admin/bookings" />
          <Tick value={formatCentsAsWholeDollars(metrics.kosCommissionMtdCents)} label="Commission" href="/admin/bookings" />
          <Tick value={metrics.tripsThisMonth.toLocaleString()} label="Charters" href="/admin/bookings" />
          <Tick value={metrics.openInquiries.toLocaleString()} label="Open leads" href="/admin/inquiries" />
        </div>

        <div className="ml-auto shrink-0 lg:ml-0">
          <NewBookingModal
            pricingTiers={pricingTiers}
            triggerLabel="Booking"
            triggerSize="sm"
            triggerClassName="gap-1 rounded-lg"
          />
        </div>
      </header>

      {/* ═══ Horizon strip — today wide, week beside it ════════ */}
      <section className="flex flex-col border-b border-border/60 lg:flex-row">
        {/* Today panel */}
        <div className="flex min-w-0 flex-col py-5 lg:w-[38%] lg:pr-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Today
            </h2>
            <span className="text-xs tabular-nums text-muted-foreground">
              {today.trips.length === 0
                ? "no charters"
                : `${today.trips.length} charter${today.trips.length === 1 ? "" : "s"} · ${formatCentsCompact(
                    today.trips.reduce((s, t) => s + (t.totalAmountCents ?? 0), 0)
                  )}`}
            </span>
          </div>
          {today.trips.length === 0 ? (
            <p className="flex flex-1 items-center py-8 text-sm text-muted-foreground">
              The dock is quiet — nothing on the water today.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1">
              {today.trips.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/bookings/${t.id}`}
                    className="group flex items-center gap-3 rounded-lg border-l-2 border-primary bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {format(new Date(t.startDateTime), "h:mm a")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {t.customerName ?? "Guest"}
                      <span className="text-muted-foreground"> · {t.boatName ?? "—"}</span>
                    </span>
                    {typeof t.totalAmountCents === "number" ? (
                      <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                        {formatCentsCompact(t.totalAmountCents)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Six day columns */}
        <div className="grid flex-1 grid-cols-3 border-t border-border/60 sm:grid-cols-6 lg:border-l lg:border-t-0">
          {upcoming.map(({ day, trips }, i) => {
            const dayRevenue = trips.reduce((s, t) => s + (t.totalAmountCents ?? 0), 0);
            return (
              <Link
                key={day.toISOString()}
                href="/admin/bookings?view=calendar"
                className={cn(
                  "group flex flex-col gap-1 px-3 py-5 transition-colors hover:bg-muted/40 sm:px-4",
                  i > 0 && "border-l border-border/40 max-sm:[&:nth-child(3n+1)]:border-l-0",
                  i >= 3 && "border-t border-border/40 sm:border-t-0"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {format(day, "EEE")} <span className="tabular-nums">{format(day, "d")}</span>
                </span>
                <span
                  className={cn(
                    "mt-1 text-2xl font-semibold leading-none tabular-nums tracking-tight",
                    trips.length === 0 && "text-muted-foreground/30"
                  )}
                >
                  {trips.length}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {trips.length === 0 ? "open" : dayRevenue > 0 ? formatCentsCompact(dayRevenue) : "booked"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Triage lanes ═══════════════════════════════════════ */}
      <section className="grid gap-x-10 gap-y-8 pt-6 md:grid-cols-2 xl:grid-cols-3">
        <Lane
          title="Approvals"
          count={pendingBookings.length}
          href="/admin/bookings"
          emptyText="No booking requests waiting."
        >
          {pendingBookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.customerName ?? "Guest"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.boatName ?? "—"} · {format(new Date(b.startDateTime), "MMM d, h:mm a")}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-amber-700 opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber-400">
                  Review →
                </span>
              </Link>
            </li>
          ))}
        </Lane>

        <Lane
          title="Leads to assign"
          count={metrics.unassignedLeads}
          href="/admin/inquiries"
          emptyText="Every lead has an owner."
        >
          {unassignedLeads.map((lead) => (
            <li key={lead.id} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2">
              <Link href={`/admin/inquiries/${lead.id}`} className="group min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:underline">{lead.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {formatDistanceToNowStrict(new Date(lead.createdAt))} old
                  </span>
                  {" · "}
                  {lead.message?.slice(0, 36) || lead.email}
                </p>
              </Link>
              <AssignMenu inquiryId={lead.id} admins={admins} />
            </li>
          ))}
        </Lane>

        <Lane
          title="Ops flags"
          count={MOCK_OPS_ALERTS.length}
          href="/admin/bookings"
          sample
          emptyText="Nothing flagged."
          className="md:col-span-2 xl:col-span-1"
        >
          {MOCK_OPS_ALERTS.map((alert) => (
            <OpsRow key={alert.id} alert={alert} />
          ))}
        </Lane>
      </section>
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function Tick({ value, label, href }: { value: string; label: string; href: string }) {
  return (
    <Link href={href} className="group flex items-baseline gap-2">
      <span className="text-base font-semibold tabular-nums tracking-tight">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
      </span>
    </Link>
  );
}

function Lane({
  title,
  count,
  href,
  sample,
  emptyText,
  className,
  children,
}: {
  title: string;
  count: number;
  href: string;
  sample?: boolean;
  emptyText: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex items-center gap-2.5 pb-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">{title}</h2>
        {count > 0 ? (
          <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-semibold tabular-nums text-background">
            {count}
          </span>
        ) : null}
        {sample ? (
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Sample
          </span>
        ) : null}
        <Link
          href={href}
          className="ml-auto text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          All →
        </Link>
      </div>
      {count === 0 ? (
        <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500/60" />
          {emptyText}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/40">{children}</ul>
      )}
    </div>
  );
}

function OpsRow({ alert }: { alert: DashboardOpsAlert }) {
  return (
    <li>
      <Link
        href={alert.href}
        className="group -mx-2 flex items-start gap-2.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
      >
        <span
          className={cn(
            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
            alert.severity === "urgent" ? "bg-amber-500" : "bg-muted-foreground/30"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{alert.title}</p>
            {alert.dueLabel ? (
              <span className="shrink-0 text-[10px] font-medium tabular-nums text-amber-700 dark:text-amber-400">
                {alert.dueLabel}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{alert.detail}</p>
        </div>
      </Link>
    </li>
  );
}

function AssignMenu({ inquiryId, admins }: { inquiryId: string; admins: AdminOption[] }) {
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
          aria-label="Assign lead"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" />
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
            <DropdownMenuItem key={admin.id} onSelect={() => assign(admin)} className="gap-2">
              <Avatar className="h-6 w-6">
                {admin.profileImage ? <AvatarImage src={admin.profileImage} alt={name} /> : null}
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
