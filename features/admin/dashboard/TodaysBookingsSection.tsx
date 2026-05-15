"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SectionCard } from "@/shared/components/SectionCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { cn } from "@/shared/lib/utils/general-utils";
import { format } from "date-fns";
import type { BookingListItem } from "@/features/bookings/booking.types";

type Range = "today" | "week";

interface TodaysBookingsSectionProps {
  todaysBookings: BookingListItem[];
  weeksBookings: BookingListItem[];
  className?: string;
}

export function TodaysBookingsSection({
  todaysBookings,
  weeksBookings,
  className,
}: TodaysBookingsSectionProps) {
  const [range, setRange] = useState<Range>("today");
  const bookings = range === "today" ? todaysBookings : weeksBookings;
  const rangeLabel = range === "today" ? "Today" : "This week";
  const title = `${rangeLabel}'s bookings`;

  return (
    <SectionCard
      className={cn("h-full min-h-0 min-w-0 max-h-full flex-1", className)}
      title={title}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-1">
              {rangeLabel}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setRange("today")}
              className={range === "today" ? "bg-accent" : ""}
            >
              Today&apos;s bookings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setRange("week")}
              className={range === "week" ? "bg-accent" : ""}
            >
              This week&apos;s bookings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      subtitle={
        range === "today"
          ? "Scheduled charter trips for today"
          : "Trips starting in the next 7 days"
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 [scrollbar-gutter:stable]">
          {bookings.length === 0 ? (
            <EmptyState
              emoji="📅"
              title={range === "today" ? "No bookings today" : "No bookings this week"}
              description={
                range === "today"
                  ? "Trips scheduled for today will show here."
                  : "Upcoming trips in the rolling week window will show here."
              }
            />
          ) : (
            <div className="divide-y divide-border/60 space-y-0">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 transition-colors hover:bg-muted/20 last:pb-0 -mx-2 px-2 rounded-xl sm:flex-nowrap"
                >
                  <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                    <p className="truncate font-medium text-foreground">
                      {booking.customerName ?? "Unknown"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{booking.boatName ?? "—"}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <StatusBadge status={booking.bookingStatus} />
                    <StatusBadge status={booking.paymentDisplayStatus} />
                  </div>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground sm:ml-0">
                    {format(new Date(booking.startDateTime), "MMM d, h:mm a")}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground sm:order-last" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
