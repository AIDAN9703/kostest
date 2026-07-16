"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addDays,
  differenceInHours,
  eachDayOfInterval,
  format,
  formatDistanceToNowStrict,
  isSameDay,
  startOfDay,
} from "date-fns";
import { Anchor, Archive, HandCoins, Inbox, Landmark, Ship } from "lucide-react";

import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type { DashboardHeadlineMetrics } from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { updateInquiryOutcome } from "@/features/inquiries/inquiry.actions";
import { AssignInquiryMenu } from "@/features/inquiries/components/AssignInquiryMenu";
import { ClaimInquiryButton } from "@/features/inquiries/components/ClaimInquiryButton";
import {
  LEAD_TYPE_AVATAR_TINTS,
  LEAD_TYPE_BADGES,
  SOURCE_LABELS,
  adminInitials,
  leadTripSummary,
  type AdminOption,
} from "@/features/inquiries/inquiry-ui";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  formatCentsAsCurrency,
  formatCentsAsWholeDollars,
} from "@/shared/lib/utils/money-utils";
import { useToast } from "@/shared/lib/hooks/use-toast";

export type { AdminOption };

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  unassignedLeads: InquiryListItem[];
  weeksBookings: BookingListItem[];
  metrics: DashboardHeadlineMetrics;
  admins: AdminOption[];
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
  const todayRevenue = today.trips.reduce((s, t) => s + (t.totalAmountCents ?? 0), 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex w-full flex-1 flex-col gap-6 pb-12">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {greeting}
            {firstName ? `, ${firstName}` : ""} <span aria-hidden>👋</span>
          </h1>
        </div>
        <NewBookingModal
          pricingTiers={pricingTiers}
          triggerLabel="New booking"
          triggerSize="default"
          triggerClassName="gap-1.5 rounded-full px-5 shadow-sm"
        />
      </header>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          href="/admin/bookings"
          icon={<Landmark className="h-4 w-4" />}
          tint="bg-primary/12 text-primary"
          value={formatCentsAsWholeDollars(metrics.gmvMtdCents)}
          label={`${metrics.monthLabel} GMV`}
        />
        <StatCard
          href="/admin/bookings"
          icon={<HandCoins className="h-4 w-4" />}
          tint="bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
          value={formatCentsAsWholeDollars(metrics.kosCommissionMtdCents)}
          label="KOS commission"
        />
        <StatCard
          href="/admin/bookings"
          icon={<Anchor className="h-4 w-4" />}
          tint="bg-sky-500/12 text-sky-700 dark:text-sky-400"
          value={metrics.tripsThisMonth.toLocaleString()}
          label="Charters this month"
        />
        <StatCard
          href="/admin/inquiries?scope=unassigned"
          icon={<Inbox className="h-4 w-4" />}
          tint="bg-red-500/12 text-red-600 dark:text-red-400"
          value={metrics.unassignedLeads.toLocaleString()}
          label="Unassigned leads"
          urgent={metrics.unassignedLeads > 0}
        />
      </div>

      {/* ── On the water ───────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Ship className="h-4 w-4 text-muted-foreground" />
            On the water
          </h2>
          <Link
            href="/admin/bookings?view=calendar"
            className="rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
          >
            Calendar
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Today */}
          <div className="flex min-w-0 flex-col p-5 lg:w-[38%]">
            <div className="flex items-baseline justify-between gap-3 pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                Today
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {today.trips.length === 0
                  ? "No charters"
                  : `${today.trips.length} charter${today.trips.length === 1 ? "" : "s"} · ${formatCentsCompact(todayRevenue)}`}
              </span>
            </div>
            {today.trips.length === 0 ? (
              <p className="flex flex-1 items-center py-6 text-sm text-muted-foreground">
                The dock is quiet — nothing on the water today.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {today.trips.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/admin/bookings/${t.id}`}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5 transition-colors hover:bg-muted"
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

          {/* Next six days */}
          <div className="grid flex-1 grid-cols-3 gap-2 border-t border-border/50 p-5 sm:grid-cols-6 lg:border-l lg:border-t-0">
            {upcoming.map(({ day, trips }) => {
              const dayRevenue = trips.reduce((s, t) => s + (t.totalAmountCents ?? 0), 0);
              return (
                <Link
                  key={day.toISOString()}
                  href="/admin/bookings?view=calendar"
                  className="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors hover:bg-muted/60"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {format(day, "EEE")} <span className="tabular-nums">{format(day, "d")}</span>
                  </span>
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold tabular-nums",
                      trips.length > 0
                        ? "bg-primary/12 text-primary"
                        : "bg-muted/60 text-muted-foreground/40"
                    )}
                  >
                    {trips.length}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {trips.length === 0 ? "open" : dayRevenue > 0 ? formatCentsCompact(dayRevenue) : "booked"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Unassigned leads ───────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
          <h2 className="flex items-center gap-2.5 text-sm font-semibold">
            Unassigned leads
            {metrics.unassignedLeads > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold tabular-nums text-white">
                {metrics.unassignedLeads}
              </span>
            ) : null}
          </h2>
          <Link
            href="/admin/inquiries"
            className="rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
          >
            All inquiries
          </Link>
        </div>

        {unassignedLeads.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Inbox className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold">Every lead has an owner</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New inquiries from the website, marketplaces, and socials land here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {unassignedLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} admins={admins} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function StatCard({
  href,
  icon,
  tint,
  value,
  label,
  urgent = false,
}: {
  href: string;
  icon: React.ReactNode;
  tint: string;
  value: string;
  label: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <span
        className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tint)}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-xl font-semibold tabular-nums tracking-tight",
            urgent && "text-red-600 dark:text-red-400"
          )}
        >
          {value}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{label}</span>
      </span>
    </Link>
  );
}

function LeadRow({ lead, admins }: { lead: InquiryListItem; admins: AdminOption[] }) {
  const badge = LEAD_TYPE_BADGES[lead.leadType] ?? LEAD_TYPE_BADGES.GENERAL_QUOTE;
  const tint = LEAD_TYPE_AVATAR_TINTS[lead.leadType] ?? LEAD_TYPE_AVATAR_TINTS.GENERAL_QUOTE;
  const trip = leadTripSummary(lead);
  const ageHours = differenceInHours(new Date(), new Date(lead.createdAt));
  const isStale = ageHours >= 24;

  return (
    <li className="relative flex flex-col gap-x-5 gap-y-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:px-5 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,4.5fr)_minmax(0,1.8fr)_auto] lg:items-center">
      {/* Who */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            tint
          )}
        >
          {adminInitials(lead.name) || "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{lead.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {badge.label}
            {" · "}
            {SOURCE_LABELS[lead.source] ?? lead.source}
            {" · "}
            <span
              className={cn(
                "tabular-nums",
                isStale && "font-medium text-amber-700 dark:text-amber-400"
              )}
            >
              {formatDistanceToNowStrict(new Date(lead.createdAt))} ago
            </span>
          </p>
        </div>
      </div>

      {/* Trip intent */}
      <div className="min-w-0">
        <p className="truncate text-sm">
          {trip ?? <span className="text-muted-foreground/50">No trip details yet</span>}
        </p>
        {lead.message ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{lead.message}</p>
        ) : null}
      </div>

      {/* Value */}
      <span className="text-sm font-semibold tabular-nums lg:text-right">
        {lead.estimatedTotalCents != null ? (
          formatCentsAsCurrency(lead.estimatedTotalCents)
        ) : lead.budget ? (
          <span className="font-medium text-muted-foreground">{lead.budget}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </span>

      {/* Whole row navigates to the lead. */}
      <Link
        href={`/admin/inquiries/${lead.id}`}
        aria-label={`View lead from ${lead.name}`}
        className="absolute inset-0"
      />

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-1.5 lg:justify-end">
        <ClaimInquiryButton inquiryId={lead.id} className="rounded-full" />
        <AssignInquiryMenu
          inquiryId={lead.id}
          admins={admins}
          triggerClassName="rounded-full"
        />
        <ArchiveButton inquiryId={lead.id} />
      </div>
    </li>
  );
}

function ArchiveButton({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function archive() {
    setPending(true);
    const res = await updateInquiryOutcome(inquiryId, "ABANDONED", "Archived from dashboard");
    setPending(false);
    if (res.success) {
      toast({ title: "Lead archived" });
      router.refresh();
    } else {
      toast({ title: "Couldn't archive", description: res.error, variant: "destructive" });
    }
  }

  return (
    <button
      type="button"
      onClick={archive}
      disabled={pending}
      aria-label="Archive lead"
      title="Archive lead"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <Archive className="h-3.5 w-3.5" />
    </button>
  );
}
