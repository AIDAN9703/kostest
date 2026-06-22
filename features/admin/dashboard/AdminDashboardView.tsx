"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ClipboardList,
  Ship,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
import { Separator } from "@/shared/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type {
  DashboardActionCounts,
  OperationsMtdSummary,
} from "@/features/admin/dashboard";
import type { BookingListItem } from "@/features/bookings/booking.types";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";

interface AdminDashboardViewProps {
  firstName: string | null;
  pricingTiers: PricingTierOption[];
  ops: OperationsMtdSummary;
  counts: DashboardActionCounts;
  followUps: InquiryListItem[];
  todaysBookings: BookingListItem[];
  weeksBookings: BookingListItem[];
  pendingBookings: BookingListItem[];
}

function captainShort(booking: BookingListItem) {
  if (!booking.needsCaptain) return "—";
  const name = [booking.captainFirstName, booking.captainLastName].filter(Boolean).join(" ").trim();
  return name || "TBD";
}

function tripFlags(booking: BookingListItem, isToday: boolean) {
  const flags: { label: string; urgent: boolean }[] = [];
  if (booking.needsCaptain && !booking.captainUserId) flags.push({ label: "Captain", urgent: true });
  if (isToday && booking.bookingStatus === "CONFIRMED" && booking.opsExpenseCents == null) {
    flags.push({ label: "Expenses", urgent: true });
  }
  if (booking.opsBalanceClientCents != null && booking.opsBalanceClientCents > 0) {
    flags.push({ label: "Balance", urgent: false });
  }
  return flags;
}

function StatCard({
  label,
  value,
  detail,
  href,
  icon: Icon,
  alert,
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  alert?: boolean;
}) {
  return (
    <Link href={href} className="group block min-w-0">
      <Card
        className={cn(
          "@container/card gap-0 bg-gradient-to-t from-primary/5 to-card py-4 shadow-xs transition-colors hover:border-primary/25 dark:bg-card",
          alert && "border-amber-500/40 from-amber-500/10"
        )}
      >
        <CardHeader className="px-4 pb-0">
          <CardDescription className="text-xs">{label}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight @[220px]/card:text-3xl">
            {value}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Icon className="h-3 w-3" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="px-4 pt-2 text-xs text-muted-foreground">
          <span className="line-clamp-1">{detail}</span>
          <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </CardFooter>
      </Card>
    </Link>
  );
}

function BookingScheduleTable({
  bookings,
  showDate,
  isToday,
}: {
  bookings: BookingListItem[];
  showDate: boolean;
  isToday: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-10 text-sm text-muted-foreground">
        Nothing scheduled.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[88px] pl-4">Time</TableHead>
          <TableHead>Charter</TableHead>
          <TableHead className="hidden md:table-cell">Captain</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[140px]">Status</TableHead>
          <TableHead className="w-8 pr-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => {
          const flags = tripFlags(booking, isToday);
          const captain = captainShort(booking);
          return (
            <TableRow key={booking.id} className="group">
              <TableCell className="pl-4 align-top tabular-nums">
                <div className="text-sm font-medium">
                  {format(new Date(booking.startDateTime), "h:mm a")}
                </div>
                {showDate ? (
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(booking.startDateTime), "MMM d")}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="align-top">
                <Link href={`/admin/bookings/${booking.id}`} className="hover:underline">
                  <div className="font-medium">{booking.customerName ?? "Guest"}</div>
                  <div className="text-xs text-muted-foreground">
                    {booking.boatName ?? "—"}
                    {booking.numberOfPassengers ? ` · ${booking.numberOfPassengers} pax` : ""}
                  </div>
                </Link>
                {flags.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {flags.map((f) => (
                      <Badge
                        key={f.label}
                        variant={f.urgent ? "warning" : "secondary"}
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </TableCell>
              <TableCell
                className={cn(
                  "hidden align-top text-sm md:table-cell",
                  captain === "TBD" && "font-medium text-amber-700 dark:text-amber-300"
                )}
              >
                {captain}
              </TableCell>
              <TableCell className="text-right align-top font-medium tabular-nums">
                {booking.totalAmountCents ? formatCentsAsCurrency(booking.totalAmountCents) : "—"}
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <StatusBadge status={booking.bookingStatus} />
                  <StatusBadge status={booking.paymentDisplayStatus} />
                </div>
              </TableCell>
              <TableCell className="pr-4 align-top">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href={`/admin/bookings/${booking.id}`} aria-label="Open booking">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function PendingTable({ bookings }: { bookings: BookingListItem[] }) {
  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-10 text-sm text-muted-foreground">
        No pending requests.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">Guest</TableHead>
          <TableHead>Trip</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-8 pr-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="pl-4 font-medium">{booking.customerName ?? "Guest"}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {booking.boatName} · {format(new Date(booking.startDateTime), "MMM d, h:mm a")}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {booking.totalAmountCents ? formatCentsAsCurrency(booking.totalAmountCents) : "—"}
            </TableCell>
            <TableCell className="pr-4">
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link href={`/admin/bookings/${booking.id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminDashboardView({
  firstName,
  pricingTiers,
  ops,
  counts,
  followUps,
  todaysBookings,
  weeksBookings,
  pendingBookings,
}: AdminDashboardViewProps) {
  const actionTiles = useMemo(() => {
    const tiles: {
      key: string;
      count: number;
      label: string;
      href: string;
      urgent?: boolean;
    }[] = [];

    if (counts.pendingBookingCount > 0) {
      tiles.push({
        key: "pending",
        count: counts.pendingBookingCount,
        label: "Approve bookings",
        href: "/admin/bookings",
        urgent: true,
      });
    }
    if (counts.unassignedInquiryCount > 0) {
      tiles.push({
        key: "unassigned",
        count: counts.unassignedInquiryCount,
        label: "Assign leads",
        href: "/admin/inquiries",
        urgent: true,
      });
    } else if (counts.openInquiryCount > 0) {
      tiles.push({
        key: "open",
        count: counts.openInquiryCount,
        label: "Follow up leads",
        href: "/admin/inquiries",
      });
    }
    if (counts.captainNeededTodayCount > 0) {
      tiles.push({
        key: "captain",
        count: counts.captainNeededTodayCount,
        label: "Captain needed today",
        href: "/admin/bookings",
        urgent: true,
      });
    }
    if (counts.missingExpensesCount > 0) {
      tiles.push({
        key: "expenses",
        count: counts.missingExpensesCount,
        label: "Log expenses",
        href: "/admin/bookings",
      });
    }
    if (counts.ownerPayoutsDueCount > 0) {
      tiles.push({
        key: "owner",
        count: counts.ownerPayoutsDueCount,
        label: "Owner payouts",
        href: "/admin/bookings",
      });
    }
    return tiles;
  }, [counts]);

  const defaultTab =
    todaysBookings.length > 0
      ? "today"
      : pendingBookings.length > 0
        ? "pending"
        : "week";

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back{firstName ? `, ${firstName}` : ""}{" "}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <NewBookingModal
          pricingTiers={pricingTiers}
          triggerLabel="New booking"
          triggerSize="default"
          triggerClassName="shrink-0 gap-1.5 rounded-2xl shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 xl:gap-4">
        <StatCard
          label="Charters today"
          value={String(todaysBookings.length)}
          detail="On the water today"
          href="/admin/bookings"
          icon={Ship}
        />
        <StatCard
          label="Next 7 days"
          value={String(weeksBookings.length)}
          detail="Upcoming charters"
          href="/admin/bookings"
          icon={Calendar}
        />
        <StatCard
          label="Pending approval"
          value={String(counts.pendingBookingCount)}
          detail={
            counts.pendingBookingCount > 0 ? "Requests waiting on you" : "Inbox clear"
          }
          href="/admin/bookings"
          icon={AlertCircle}
          alert={counts.pendingBookingCount > 0}
        />
        <StatCard
          label="Open leads"
          value={String(counts.openInquiryCount)}
          detail={
            counts.unassignedInquiryCount > 0
              ? `${counts.unassignedInquiryCount} unassigned`
              : counts.openInquiryCount > 0
                ? "Inquiry pipeline"
                : "Inbox clear"
          }
          href="/admin/inquiries"
          icon={Users}
          alert={counts.unassignedInquiryCount > 0}
        />
        <StatCard
          label="Captain needed"
          value={String(counts.captainNeededTodayCount)}
          detail={
            counts.captainNeededTodayCount > 0 ? "Today — assign captain" : "All set for today"
          }
          href="/admin/bookings"
          icon={UserRound}
          alert={counts.captainNeededTodayCount > 0}
        />
        <StatCard
          label="Expenses to log"
          value={String(counts.missingExpensesCount)}
          detail={counts.missingExpensesCount > 0 ? "Today's trips" : "Nothing missing"}
          href="/admin/bookings"
          icon={ClipboardList}
          alert={counts.missingExpensesCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
        <Card className="gap-0 overflow-hidden py-0 xl:col-span-2">
          <Tabs defaultValue={defaultTab}>
            <CardHeader className="border-b py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Operations board</CardTitle>
                  <CardDescription className="text-xs">
                    Today&apos;s fleet, upcoming week, and pending requests
                  </CardDescription>
                </div>
                <TabsList className="h-8">
                  <TabsTrigger value="today" className="px-3 text-xs">
                    Today
                    {todaysBookings.length > 0 ? (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                        {todaysBookings.length}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="week" className="px-3 text-xs">
                    7 days
                    {weeksBookings.length > 0 ? (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                        {weeksBookings.length}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="px-3 text-xs">
                    Pending
                    {pendingBookings.length > 0 ? (
                      <Badge variant="warning" className="ml-1.5 h-5 px-1.5 text-[10px]">
                        {pendingBookings.length}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="today" className="m-0">
                <BookingScheduleTable
                  bookings={todaysBookings}
                  showDate={false}
                  isToday
                />
              </TabsContent>
              <TabsContent value="week" className="m-0">
                <BookingScheduleTable
                  bookings={weeksBookings}
                  showDate
                  isToday={false}
                />
              </TabsContent>
              <TabsContent value="pending" className="m-0">
                <PendingTable bookings={pendingBookings} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">Ops snapshot</CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(), "MMMM yyyy")} · actions & pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 py-4">
            {actionTiles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Needs attention
                </p>
                <div className="flex flex-col gap-1.5">
                  {actionTiles.map((tile) => (
                    <Link
                      key={tile.key}
                      href={tile.href}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                        tile.urgent
                          ? "border-amber-500/35 bg-amber-500/8"
                          : "border-border bg-muted/20"
                      )}
                    >
                      <span className="font-medium">{tile.label}</span>
                      <Badge variant={tile.urgent ? "warning" : "secondary"}>{tile.count}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No urgent actions right now.</p>
            )}

            <Separator />

            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Net revenue", formatCentsAsCurrency(ops.netRevenueMtdCents)],
                ["Commissions", formatCentsAsCurrency(ops.commissionsMtdCents)],
                [
                  "Owner due",
                  counts.ownerPayoutsDueCount > 0
                    ? formatCentsAsCurrency(counts.ownerPayoutsDueCents)
                    : "—",
                ],
                ["Trips (MTD)", String(ops.tripsStartingThisMonth)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Open leads
                </p>
                <Button variant="link" size="sm" className="h-auto px-0 text-xs" asChild>
                  <Link href="/admin/inquiries">View all</Link>
                </Button>
              </div>
              {followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Inbox clear.</p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border">
                  {followUps.map((inquiry) => (
                    <li key={inquiry.id}>
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="flex items-start gap-2 px-3 py-2 transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{inquiry.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {inquiry.message?.slice(0, 64) || inquiry.email}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <StatusBadge status={inquiry.stage} />
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {formatDistanceToNowStrict(new Date(inquiry.updatedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
