"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { DraftProposalBooking } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalBoatsListProps {
  bookings: DraftProposalBooking[];
}

const DEFAULT_IMAGE = "/images/herooption22.jpg";

export function DraftProposalBoatsList({ bookings }: DraftProposalBoatsListProps) {
  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/boats/${booking.boatId}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={booking.boatMainImage ?? DEFAULT_IMAGE}
                alt={booking.boatName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{booking.boatName}</p>
              <p className="text-xs text-gray-500">Base charter</p>
            </div>
          </div>
          <span className="shrink-0 font-semibold text-primary">
            {formatCentsAsCurrency(booking.basePriceCents)}
          </span>
        </Link>
      ))}
    </div>
  );
}
