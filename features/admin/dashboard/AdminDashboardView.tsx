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
import { Archive, Inbox, Ship } from "lucide-react";

import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type {
  DashboardActivityItem,
  DashboardHeadlineMetrics,
} from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { updateInquiryOutcome } from "@/features/inquiries/inquiry.actions";
import { AssignInquiryMenu } from "@/features/inquiries/components/AssignInquiryMenu";
import { ClaimInquiryButton } from "@/features/inquiries/components/ClaimInquiryButton";
import {
  LEAD_TYPE_AVATAR_TINTS,
  SOURCE_LABELS,
  adminInitials,
  leadTripSummary,
  type AdminOption,
} from "@/features/inquiries/inquiry-ui";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsWholeDollars } from "@/shared/lib/utils/money-utils";
import { useToast } from "@/shared/lib/hooks/use-toast";

export type { AdminOption };

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  unassignedLeads: InquiryListItem[];
  weeksBookings: BookingListItem[];
  recentActivity: DashboardActivityItem[];
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

/* Card white now comes from the theme token (matches header/sidebar);
   the gray canvas + soft shadow do the separation. */
const CARD_CLASS = "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm";
const CARD_HEADER_CLASS =
  "flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4";
const PILL_LINK_CLASS =
  "rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70";

export function AdminDashboardView({
  firstName,
  pricingTiers,
  unassignedLeads,
  weeksBookings,
  recentActivity,
  metrics,
  admins,
}: AdminDashboardViewProps) {
  const days = useMemo(() => {
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

  const weekRevenue = weeksBookings.reduce((s, b) => s + (b.totalAmountCents ?? 0), 0);
  const avgCharterCents =
    metrics.tripsThisMonth > 0 ? Math.round(metrics.gmvMtdCents / metrics.tripsThisMonth) : 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    /* The gray canvas comes from the theme's --color-background now. */
    <div className="flex w-full flex-1 flex-col gap-8 pb-14">
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
          triggerClassName="gap-1.5 rounded-full bg-primary px-5 text-primary-foreground shadow-sm hover:bg-primary/90"
        />
      </header>

      {/* ── Row 1: week on the water + monthly financials ──────── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Week calendar */}
        <section className={cn(CARD_CLASS, "lg:col-span-2")}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Ship className="h-4 w-4 text-muted-foreground" />
              On the water
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {weeksBookings.length} charter{weeksBookings.length === 1 ? "" : "s"} this week
                {weekRevenue > 0 ? ` · ${formatCentsCompact(weekRevenue)}` : ""}
              </span>
            </h2>
            <Link href="/admin/bookings?view=calendar" className={PILL_LINK_CLASS}>
              Calendar
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 lg:grid-cols-7">
            {days.map(({ day, isToday, trips }) => {
              const dayRevenue = trips.reduce((s, t) => s + (t.totalAmountCents ?? 0), 0);
              const shown = trips.slice(0, 3);
              const extra = trips.length - shown.length;
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex min-h-[9.5rem] flex-col gap-1.5 rounded-xl p-2",
                    isToday && "bg-primary-soft ring-1 ring-primary/30"
                  )}
                >
                  <p
                    className={cn(
                      "px-1 text-[11px] font-semibold",
                      isToday ? "text-primary-strong" : "text-muted-foreground"
                    )}
                  >
                    {isToday ? "Today" : format(day, "EEE d")}
                  </p>

                  {trips.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center text-xs text-muted-foreground/40">
                      —
                    </p>
                  ) : (
                    <div className="flex flex-1 flex-col gap-1">
                      {shown.map((t) => (
                        <Link
                          key={t.id}
                          href={`/admin/bookings/${t.id}`}
                          className={cn(
                            "rounded-lg px-2 py-1.5 transition-colors",
                            isToday
                              ? "bg-primary/20 hover:bg-primary/30"
                              : "bg-muted hover:bg-muted/70"
                          )}
                        >
                          <span
                            className={cn(
                              "block text-[11px] font-semibold tabular-nums",
                              isToday && "text-primary-strong"
                            )}
                          >
                            {format(new Date(t.startDateTime), "h:mm a")}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {t.boatName ?? t.customerName ?? "Charter"}
                          </span>
                        </Link>
                      ))}
                      {extra > 0 ? (
                        <Link
                          href="/admin/bookings?view=calendar"
                          className="px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          +{extra} more
                        </Link>
                      ) : null}
                    </div>
                  )}

                  <p className="px-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {dayRevenue > 0 ? formatCentsCompact(dayRevenue) : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly financials */}
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="text-sm font-semibold">{metrics.monthLabel} financials</h2>
            <Link href="/admin/bookings" className={PILL_LINK_CLASS}>
              Bookings
            </Link>
          </div>
          <div className="p-5">
            <p className="text-3xl font-semibold tabular-nums tracking-tight">
              {formatCentsAsWholeDollars(metrics.gmvMtdCents)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Gross charter volume</p>

            <dl className="mt-5 flex flex-col">
              <FinRow
                label="KOS commission"
                value={formatCentsAsWholeDollars(metrics.kosCommissionMtdCents)}
                accent="text-success"
              />
              <FinRow label="Charters" value={metrics.tripsThisMonth.toLocaleString()} />
              <FinRow
                label="Avg per charter"
                value={avgCharterCents > 0 ? formatCentsAsWholeDollars(avgCharterCents) : "—"}
              />
              <FinRow label="Open pipeline" value={`${metrics.openInquiries} leads`} last />
            </dl>
          </div>
        </section>
      </div>

      {/* ── Row 2: unassigned leads + live activity, 50/50 ─────── */}
      <div className="grid items-start gap-8 lg:grid-cols-2">
        {/* Unassigned leads — narrow queue */}
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="flex items-center gap-2.5 text-sm font-semibold">
              Unassigned leads
              {metrics.unassignedLeads > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold tabular-nums text-destructive-foreground">
                  {metrics.unassignedLeads}
                </span>
              ) : null}
            </h2>
            <Link href="/admin/bookings?scope=unassigned" className={PILL_LINK_CLASS}>
              View all
            </Link>
          </div>

          {unassignedLeads.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5 text-success" />}
              title="Every lead has an owner"
              subtitle="New inquiries from the website, marketplaces, and socials land here."
            />
          ) : (
            <ul className="max-h-[30rem] divide-y divide-border/40 overflow-y-auto">
              {unassignedLeads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} admins={admins} />
              ))}
            </ul>
          )}
        </section>

        {/* Recent activity — live feed */}
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              Recent activity
              <span className="text-[11px] font-medium uppercase tracking-wide text-success">
                Live
              </span>
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5 text-success" />}
              title="All quiet"
              subtitle="New leads, assignments, and booking updates will show here."
            />
          ) : (
            <ul className="max-h-[30rem] divide-y divide-border/40 overflow-y-auto">
              {recentActivity.map((item) => (
                <li key={item.id} className="relative px-5 py-3 transition-colors hover:bg-muted/40">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        item.kind === "booking" ? "bg-primary" : "bg-sky-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-semibold">{item.subjectLabel ?? "—"}</span>
                        <span className="text-muted-foreground"> · {item.message}</span>
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(item.createdAt))} ago
                      </p>
                    </div>
                  </div>
                  <Link href={item.href} aria-label={item.message} className="absolute inset-0" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function FinRow({
  label,
  value,
  accent,
  last = false,
}: {
  label: string;
  value: string;
  accent?: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2.5",
        !last && "border-b border-border/40"
      )}
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-sm font-semibold tabular-nums", accent)}>{value}</dd>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-soft">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-[18rem] text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/** Compact row for the narrow queue: identity, trip, value, actions stacked. */
function LeadRow({ lead, admins }: { lead: InquiryListItem; admins: AdminOption[] }) {
  const tint = LEAD_TYPE_AVATAR_TINTS[lead.leadType] ?? LEAD_TYPE_AVATAR_TINTS.GENERAL_QUOTE;
  const trip = leadTripSummary(lead);
  const ageHours = differenceInHours(new Date(), new Date(lead.createdAt));
  const isStale = ageHours >= 24;

  return (
    <li className="relative px-4 py-3.5 transition-colors hover:bg-muted/40">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            tint
          )}
        >
          {adminInitials(lead.name) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold">{lead.name}</p>
            {lead.estimatedTotalCents != null ? (
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {formatCentsCompact(lead.estimatedTotalCents)}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {SOURCE_LABELS[lead.source] ?? lead.source}
            {" · "}
            <span
              className={cn(
                "tabular-nums",
                isStale && "font-medium text-warning"
              )}
            >
              {formatDistanceToNowStrict(new Date(lead.createdAt))} ago
            </span>
          </p>
          {trip ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{trip}</p> : null}

          <div className="relative z-10 mt-2 flex items-center gap-1.5">
            <ClaimInquiryButton inquiryId={lead.id} className="rounded-full" />
            <AssignInquiryMenu inquiryId={lead.id} admins={admins} triggerClassName="rounded-full" />
            <ArchiveButton inquiryId={lead.id} />
          </div>
        </div>
      </div>

      {/* Whole row navigates to the lead (actions sit above on z-10). */}
      <Link
        href={`/admin/bookings/${lead.id}`}
        aria-label={`View lead from ${lead.name}`}
        className="absolute inset-0"
      />
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
