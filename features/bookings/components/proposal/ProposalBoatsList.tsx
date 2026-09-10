"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { formatBoatLocal } from "@/shared/lib/utils/date-helpers";
import type { ProposalBooking } from "@/features/bookings/lib/proposal.types";

interface ProposalBoatsListProps {
  bookings: ProposalBooking[];
}

const DEFAULT_IMAGE = "/images/herooption22.jpg";

function formatWindow(start: Date | null, timezone: string | null): string | null {
  if (!start) return null;
  const label = formatBoatLocal(start, timezone, "EEE, MMM d · h:mm a zzz");
  return label || null;
}

/** Flat boat rows — hairlines come from the page's divide-y container. */
export function ProposalBoatsList({ bookings }: ProposalBoatsListProps) {
  // Charter parties can sail different windows per boat — call out any boat
  // whose start differs from the lead's (the one in Trip Details above).
  const leadStart = bookings[0]?.startDateTime
    ? new Date(bookings[0].startDateTime).getTime()
    : null;

  return (
    <>
      {bookings.map((booking) => {
        const ownStart = booking.startDateTime
          ? new Date(booking.startDateTime).getTime()
          : null;
        const differsFromLead =
          leadStart != null && ownStart != null && ownStart !== leadStart;
        return (
        <Link
          key={booking.id}
          href={`/boats/${booking.boatId}`}
          className="group flex items-center justify-between gap-4 py-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-light-main">
              <Image
                src={booking.boatMainImage ?? DEFAULT_IMAGE}
                alt={booking.boatName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary group-hover:underline">
                {booking.boatName}
              </p>
              <p className="text-xs text-slate-500">
                {differsFromLead ? formatWindow(booking.startDateTime, booking.timezone) : "Base charter"}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium text-primary">
            {formatCentsAsCurrency(booking.basePriceCents)}
          </span>
        </Link>
        );
      })}
    </>
  );
}
