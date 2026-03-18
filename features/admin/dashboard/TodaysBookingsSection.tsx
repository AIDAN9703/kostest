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
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { format } from "date-fns";
import type { BookingListItem } from "@/features/bookings/booking.types";

type Range = "today" | "week";

interface TodaysBookingsSectionProps {
  todaysBookings: BookingListItem[];
  weeksBookings: BookingListItem[];
}

export function TodaysBookingsSection({
  todaysBookings,
  weeksBookings,
}: TodaysBookingsSectionProps) {
  const [range, setRange] = useState<Range>("today");
  const bookings = range === "today" ? todaysBookings : weeksBookings;
  const rangeLabel = range === "today" ? "Today" : "This week";
  const title = `${rangeLabel}'s Bookings`;

  return (
    <SectionCard
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
              Today&apos;s Bookings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setRange("week")}
              className={range === "week" ? "bg-accent" : ""}
            >
              This Week&apos;s Bookings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      subtitle={
        range === "today"
          ? "Bookings scheduled for today"
          : "Next 7 days from today"
      }
    >
      <div className="flex-1 p-6">
        {bookings.length === 0 ? (
          <EmptyState
            emoji="📅"
            title={
              range === "today" ? "No bookings today" : "No bookings this week"
            }
            description={
              range === "today"
                ? "Bookings for today will appear here."
                : "Bookings for this week will appear here."
            }
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/10 p-4 shadow-sm transition-all hover:shadow-md hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {booking.customerName ?? "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {booking.boatName ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={booking.bookingStatus} />
                    <StatusBadge status={booking.paymentDisplayStatus} />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(booking.startDateTime), "MMM d, h:mm a")}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
