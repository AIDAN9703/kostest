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
import { Activity, Archive, CheckCircle2, Clock, Inbox, Ship } from "lucide-react";

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
  LEAD_TYPE_BADGES,
  SOURCE_LABELS,
  STAGE_CHIP_CLASSES,
  STAGE_LABELS,
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
  pendingBookings: BookingListItem[];
  followUps: InquiryListItem[];
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
  pendingBookings,
  followUps,
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

      {/* ── Top row: week on the water + monthly financials ────── */}
      <div className="grid gap-6 lg:grid-cols-3">
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
                    isToday && "bg-primary/5 ring-1 ring-primary/15"
                  )}
                >
                  <p
                    className={cn(
                      "px-1 text-[11px] font-semibold",
                      isToday ? "text-primary" : "text-muted-foreground"
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
                              ? "bg-primary/10 hover:bg-primary/20"
                              : "bg-muted hover:bg-muted/70"
                          )}
                        >
                          <span
                            className={cn(
                              "block text-[11px] font-semibold tabular-nums",
                              isToday && "text-primary"
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
                accent="text-emerald-700 dark:text-emerald-400"
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

      {/* ── Unassigned leads ───────────────────────────────────── */}
      <section className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <h2 className="flex items-center gap-2.5 text-sm font-semibold">
            Unassigned leads
            {metrics.unassignedLeads > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold tabular-nums text-white">
                {metrics.unassignedLeads}
              </span>
            ) : null}
          </h2>
          <Link href="/admin/inquiries?scope=unassigned" className={PILL_LINK_CLASS}>
            All inquiries
          </Link>
        </div>

        {unassignedLeads.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            title="Every lead has an owner"
            subtitle="New inquiries from the website, marketplaces, and socials land here."
          />
        ) : (
          <ul className="divide-y divide-border/40">
            {unassignedLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} admins={admins} />
            ))}
          </ul>
        )}
      </section>

      {/* ── Approvals + follow-ups + activity ──────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Pending approvals */}
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="flex items-center gap-2.5 text-sm font-semibold">
              Pending approvals
              {pendingBookings.length > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold tabular-nums text-white">
                  {pendingBookings.length}
                </span>
              ) : null}
            </h2>
            <Link href="/admin/bookings" className={PILL_LINK_CLASS}>
              Bookings
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              title="No requests waiting"
              subtitle="Booking requests that need approval will show up here."
            />
          ) : (
            <ul className="divide-y divide-border/40">
              {pendingBookings.map((b) => (
                <li key={b.id} className="relative px-5 py-3.5 transition-colors hover:bg-muted/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{b.customerName ?? "Guest"}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {b.boatName ?? "—"} · {format(new Date(b.startDateTime), "MMM d, h:mm a")}
                      </p>
                    </div>
                    {typeof b.totalAmountCents === "number" ? (
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatCentsCompact(b.totalAmountCents)}
                      </span>
                    ) : null}
                  </div>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    aria-label={`Review booking for ${b.customerName ?? "guest"}`}
                    className="absolute inset-0"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Needs follow-up */}
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Needs follow-up
            </h2>
            <Link href="/admin/inquiries" className={PILL_LINK_CLASS}>
              All inquiries
            </Link>
          </div>

          {followUps.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              title="Nothing needs a nudge"
              subtitle="Open leads that go quiet the longest will surface here."
            />
          ) : (
            <ul className="divide-y divide-border/40">
              {followUps.map((lead) => {
                const idleHours = differenceInHours(new Date(), new Date(lead.updatedAt));
                const stale = idleHours >= 48;
                return (
                  <li
                    key={lead.id}
                    className="relative px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-semibold">{lead.name}</p>
                          <span
                            className={cn(
                              "inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              STAGE_CHIP_CLASSES[lead.stage] ?? STAGE_CHIP_CLASSES.NEW
                            )}
                          >
                            {STAGE_LABELS[lead.stage] ?? lead.stage}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "mt-0.5 truncate text-xs tabular-nums",
                            stale
                              ? "font-medium text-amber-700 dark:text-amber-400"
                              : "text-muted-foreground"
                          )}
                        >
                          Quiet for {formatDistanceToNowStrict(new Date(lead.updatedAt))}
                        </p>
                      </div>
                      {lead.estimatedTotalCents != null ? (
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatCentsCompact(lead.estimatedTotalCents)}
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/admin/inquiries/${lead.id}`}
                      aria-label={`View lead from ${lead.name}`}
                      className="absolute inset-0"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section className={cn(CARD_CLASS, "lg:col-span-2 xl:col-span-1")}>
          <div className={CARD_HEADER_CLASS}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent activity
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              title="All quiet"
              subtitle="New leads, assignments, and booking updates will show here."
            />
          ) : (
            <ul className="divide-y divide-border/40">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="relative px-5 py-3 transition-colors hover:bg-muted/40"
                >
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
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-[18rem] text-xs text-muted-foreground">{subtitle}</p>
    </div>
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
        <AssignInquiryMenu inquiryId={lead.id} admins={admins} triggerClassName="rounded-full" />
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
