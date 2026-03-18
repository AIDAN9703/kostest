"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { ProfileBooking } from "@/features/bookings/booking.types";

interface BookingCardProps {
  booking: ProfileBooking;
}

const statusConfig = {
  confirmed: { color: "bg-emerald-100 text-emerald-800", label: "Confirmed" },
  approved: {
    color: "bg-blue-100 text-white",
    label: "Approved - Awaiting Payment",
  },
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
};

export function BookingCard({ booking }: BookingCardProps) {
  const statusStyle =
    statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Link href={`/profile/bookings/${booking.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg">
        <Image
          src={booking.image}
          alt={booking.boatName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-white">{booking.boatName}</h3>
              <p className="mt-0.5 text-sm text-white/90">{booking.date}</p>
              <p className="mt-1 text-sm font-medium text-white">{formatCurrency(booking.price)}</p>
            </div>
            <Badge className={`shrink-0 text-xs ${statusStyle.color}`}>{statusStyle.label}</Badge>
          </div>
        </div>
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Link>
  );
}
