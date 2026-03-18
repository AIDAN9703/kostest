"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Users, MapPin, Anchor, CreditCard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { getOrCreatePaymentLink } from "@/features/bookings/booking.mutations";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProfileBookingDetailProps {
  booking: {
    id: string;
    bookingStatus: string;
    boatId: string;
    boatName: string;
    boatType: string;
    boatMainImage: string | null;
    date: string;
    duration: number;
    location: string;
    guests: number;
    captain: boolean | null;
    totalAmountCents: number;
    depositAmountCents: number | null;
    status: string;
  };
}

const DEFAULT_IMAGE = "/images/herooption22.jpg";

export default function ProfileBookingDetail({ booking }: ProfileBookingDetailProps) {
  const [payLoading, setPayLoading] = useState(false);
  const needsPayment = booking.bookingStatus === "APPROVED";

  const handlePay = async () => {
    setPayLoading(true);
    try {
      const result = await getOrCreatePaymentLink(booking.id);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      setPayLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
        <Image
          src={booking.boatMainImage ?? DEFAULT_IMAGE}
          alt={booking.boatName}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 800px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{booking.boatName}</h1>
          <p className="mt-1 text-white/90">{booking.boatType}</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatCentsAsCurrency(booking.totalAmountCents)}
          </p>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              booking.status === "Approved"
                ? "bg-blue-100 text-blue-800"
                : booking.status === "Confirmed"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {booking.status}
          </span>
          {needsPayment && (
            <Button onClick={handlePay} disabled={payLoading} className="gap-2">
              {payLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {payLoading ? "Loading..." : "Pay Now"}
            </Button>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">{booking.date}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">{booking.duration}h charter</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">
              {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
              {booking.captain && " · Captain included"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">{booking.location}</span>
          </div>
        </div>
        <div className="mt-8">
          <Link href={`/boats/${booking.boatId}`}>
            <Button variant="outline" className="gap-2">
              <Anchor className="h-4 w-4" />
              View boat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
