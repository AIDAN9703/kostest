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
import { Archive, CheckCircle2, UserPlus, Users } from "lucide-react";

import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type { DashboardHeadlineMetrics } from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { assignInquiry, updateInquiryOutcome } from "@/features/inquiries/inquiry.actions";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatPlainDate } from "@/shared/lib/utils/general-utils";
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

const LEAD_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  GENERAL_QUOTE: { label: "General", className: "bg-muted text-muted-foreground" },
  BOAT_REQUEST: { label: "Boat", className: "bg-primary/10 text-primary" },
  TERM_CHARTER: {
    label: "Term",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  MANUAL: { label: "Manual", className: "bg-muted text-muted-foreground" },
};

const SOURCE_LABELS: Record<string, string> = {
  HOME_PAGE: "Home page",
  BOAT_PAGE: "Boat page",
  CONTACT_PAGE: "Contact page",
  TERM_CHARTER_PAGE: "Term charter page",
  PHONE: "Phone",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  ADMIN: "Admin",
  BROKER: "Broker",
  OTHER: "Other",
};

const TIME_OF_DAY_LABELS: Record<string, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  FLEXIBLE: "Flexible",
};

/** "Aug 15 · Afternoon" / "Aug 15, 2:00 PM · 7+ days · Bahamas" — trip intent, best fidelity available. */
function leadTripSummary(lead: InquiryListItem): string | null {
  const parts: string[] = [];
  if (lead.requestedStartDateTime) {
    parts.push(format(new Date(lead.requestedStartDateTime), "MMM d, h:mm a"));
  } else if (lead.preferredDate) {
    parts.push(formatPlainDate(lead.preferredDate));
    if (lead.preferredTimeOfDay) {
      parts.push(TIME_OF_DAY_LABELS[lead.preferredTimeOfDay] ?? lead.preferredTimeOfDay);
    }
  } else if (lead.date) {
    parts.push(format(new Date(lead.date), "MMM d"));
  }
  if (lead.requestedDurationDays) parts.push(`${lead.requestedDurationDays}+ days`);
  if (lead.destination) parts.push(lead.destination);
  if (lead.guests) parts.push(`${lead.guests} guests`);
  return parts.length > 0 ? parts.join(" · ") : null;
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
            {firstName ? `, ${firstName}` : ""} <span aria-hidden>👋</span>
          </h1>
        </div>

        {/* inline stats ticker */}
        <div className="order-last flex w-full flex-wrap items-center gap-x-7 gap-y-2 lg:order-none lg:ml-auto lg:w-auto">
          <Tick value={formatCentsAsWholeDollars(metrics.gmvMtdCents)} label={`${metrics.monthLabel} GMV`} href="/admin/bookings" />
          <Tick value={formatCentsAsWholeDollars(metrics.kosCommissionMtdCents)} label="Commission" href="/admin/bookings" />
          <Tick value={metrics.tripsThisMonth.toLocaleString()} label="Charters" href="/admin/bookings" />
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

      {/* ═══ Unassigned leads ═══════════════════════════════════ */}
      <section className="w-full pt-6 lg:max-w-3xl">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Unassigned leads
          </h2>
          {metrics.unassignedLeads > 0 ? (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold tabular-nums text-white">
              {metrics.unassignedLeads}
            </span>
          ) : null}
          <Link
            href="/admin/inquiries"
            className="ml-auto rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
          >
            All inquiries
          </Link>
        </div>

        {unassignedLeads.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="mb-2.5 h-6 w-6 text-emerald-500/60" />
            <p className="text-sm font-medium">Every lead has an owner</p>
            <p className="mt-1 max-w-[18rem] text-xs text-muted-foreground">
              New inquiries from the website, phone, and socials will land here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border/40">
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

function LeadRow({ lead, admins }: { lead: InquiryListItem; admins: AdminOption[] }) {
  const badge = LEAD_TYPE_BADGES[lead.leadType] ?? LEAD_TYPE_BADGES.GENERAL_QUOTE;
  const trip = leadTripSummary(lead);
  const ageHours = differenceInHours(new Date(), new Date(lead.createdAt));
  const isStale = ageHours >= 24;

  return (
    <li className="relative -mx-3 flex flex-col gap-x-5 gap-y-2 rounded-lg px-3 py-3.5 transition-colors hover:bg-muted/50 sm:grid sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,2.5fr)_auto] sm:items-center">
      {/* Who */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              badge.className
            )}
          >
            {badge.label}
          </span>
          <span className="truncate text-sm font-medium">{lead.name}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {SOURCE_LABELS[lead.source] ?? lead.source}
          {" · "}
          <span className={cn("tabular-nums", isStale && "font-medium text-amber-700 dark:text-amber-400")}>
            {formatDistanceToNowStrict(new Date(lead.createdAt))} old
          </span>
        </p>
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
      <div className="text-sm font-medium tabular-nums sm:text-right">
        {lead.estimatedTotalCents != null ? (
          formatCentsAsCurrency(lead.estimatedTotalCents)
        ) : lead.budget ? (
          <span className="text-muted-foreground">{lead.budget}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>

      {/* Whole row navigates to the lead; painted above static content,
          below the z-10 action buttons. */}
      <Link
        href={`/admin/inquiries/${lead.id}`}
        aria-label={`View lead from ${lead.name}`}
        className="absolute inset-0 rounded-lg"
      />

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-1.5 sm:justify-end">
        <AssignMenu inquiryId={lead.id} admins={admins} />
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
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <Archive className="h-3.5 w-3.5" />
    </button>
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {pending ? "Assigning…" : "Assign"}
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
