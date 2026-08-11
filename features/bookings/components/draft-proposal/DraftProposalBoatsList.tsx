"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { DraftProposalBooking } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalBoatsListProps {
  bookings: DraftProposalBooking[];
}

const DEFAULT_IMAGE = "/images/herooption22.jpg";

/** Flat boat rows — hairlines come from the page's divide-y container. */
export function DraftProposalBoatsList({ bookings }: DraftProposalBoatsListProps) {
  return (
    <>
      {bookings.map((booking) => (
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
              <p className="text-xs text-slate-500">Base charter</p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium text-primary">
            {formatCentsAsCurrency(booking.basePriceCents)}
          </span>
        </Link>
      ))}
    </>
  );
}
