"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, Ship } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { PAYMENT_DISPLAY_DESCRIPTIONS } from "@/shared/lib/utils/payment-display";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingHeaderProps {
  booking: Pick<
    BookingDetails,
    | "id"
    | "boatId"
    | "boatName"
    | "boatTimezone"
    | "customerName"
    | "startDateTime"
    | "endDateTime"
    | "bookingStatus"
    | "paymentDisplayStatus"
  >;
}

const BOOKING_STATUS_HINT: Record<string, string> = {
  DRAFT: "Sent to customer as a quote; not accepted or paid yet.",
  PENDING: "Request waiting for approval before customer can pay.",
  APPROVED: "Approved — customer still needs to complete payment.",
  CONFIRMED: "Paid and locked in.",
  CANCELLED: "Cancelled — check cancellation reason and payment status for details.",
  COMPLETED: "Trip finished.",
};

function tripSubtitle(
  startIso: Date | null | undefined,
  endIso: Date | null | undefined,
  boatTimezone: string | null,
  boatName: string | null | undefined
): string {
  const parts: string[] = [];
  if (boatName) parts.push(boatName);

  if (startIso) {
    const parsed = parseDateTimeInBoatTimezone(
      typeof startIso === "string" ? startIso : startIso.toISOString(),
      { timezone: boatTimezone ?? undefined }
    );
    if (parsed?.date) {
      parts.push(format(parsed.date, "EEE, MMM d, yyyy"));
      if (endIso) {
        const end = parseDateTimeInBoatTimezone(
          typeof endIso === "string" ? endIso : endIso.toISOString(),
          { timezone: boatTimezone ?? undefined }
        );
        if (end?.date) {
          const hours = Math.round(
            (end.date.getTime() - parsed.date.getTime()) / (1000 * 60 * 60)
          );
          if (hours > 0) parts.push(`${hours} hr`);
        }
      }
    }
  }

  return parts.join(" · ");
}

/**
 * Compact booking detail header — mirrors the spreadsheet/CRM aesthetic from
 * /test. Replaces the older big-image header (`AdminBookingProfileHeader`).
 *
 * Layout (left → right):
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ ← Back to bookings                                              │
 *   │                                                                 │
 *   │ BOOKING #ABC123                       [booking status]          │
 *   │ Hannah Aldridge                       [payment status]          │
 *   │ 40ft Schaefer · Wed, Apr 29, 2026 · 12 hr                       │
 *   └─────────────────────────────────────────────────────────────────┘
 */
export function AdminBookingHeader({ booking }: AdminBookingHeaderProps) {
  const router = useRouter();
  const paymentDesc =
    PAYMENT_DISPLAY_DESCRIPTIONS[booking.paymentDisplayStatus] ?? "—";
  const shortId = booking.id.slice(0, 6).toUpperCase();
  const subtitle = tripSubtitle(
    booking.startDateTime,
    booking.endDateTime,
    booking.boatTimezone,
    booking.boatName
  );

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/bookings")}
        className="-ml-2 h-8 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to bookings
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Booking #{shortId}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {booking.customerName || "Unnamed customer"}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            {booking.boatId && booking.boatName ? (
              <Link
                href={`/admin/boats/${booking.boatId}`}
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <Ship className="h-3.5 w-3.5" />
                {booking.boatName}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Ship className="h-3.5 w-3.5" />—
              </span>
            )}
            {subtitle && booking.boatName ? (
              <span aria-hidden>·</span>
            ) : null}
            <span>
              {subtitle.replace(
                booking.boatName ? `${booking.boatName} · ` : "",
                ""
              )}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Status
            </span>
            <StatusBadge
              status={booking.bookingStatus}
              title={
                BOOKING_STATUS_HINT[booking.bookingStatus.toUpperCase()] ??
                "Current state for this booking."
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Payment
            </span>
            <StatusBadge status={booking.paymentDisplayStatus} title={paymentDesc} />
          </div>
        </div>
      </div>
    </div>
  );
}
