"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  CheckCircle,
  Calendar,
  Home,
  Ship,
} from "lucide-react";
import Link from "next/link";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import confetti from "canvas-confetti";

const BRAND_COLORS = [
  "#10B981",
  "#3B82F6",
  "#0EA5E9",
  "#06B6D4",
  "#F59E0B",
  "#8B5CF6",
];

function fireConfetti() {
  const bigBoat = confetti.shapeFromText({ text: "\u{1F6E5}\uFE0F", scalar: 5 });
  const bigSailboat = confetti.shapeFromText({ text: "\u26F5", scalar: 5 });
  const bigParty = confetti.shapeFromText({ text: "\u{1F389}", scalar: 5 });
  const bigWave = confetti.shapeFromText({ text: "\u{1F30A}", scalar: 4 });

  confetti({
    particleCount: 60,
    spread: 100,
    origin: { y: 1.0, x: 0.5 },
    colors: BRAND_COLORS,
    shapes: [bigBoat, bigSailboat, bigParty],
    scalar: 2,
    gravity: 0.6,
    startVelocity: 60,
    ticks: 500,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 45,
      spread: 80,
      origin: { x: -0.2, y: 1.0 },
      colors: BRAND_COLORS,
      shapes: [bigWave, bigSailboat],
      scalar: 2,
      gravity: 0.7,
      startVelocity: 50,
      ticks: 400,
      disableForReducedMotion: true,
    });
  }, 400);

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 135,
      spread: 80,
      origin: { x: 1.2, y: 1.0 },
      colors: BRAND_COLORS,
      shapes: [bigWave, bigBoat],
      scalar: 2,
      gravity: 0.7,
      startVelocity: 50,
      ticks: 400,
      disableForReducedMotion: true,
    });
  }, 600);
}

interface BookingSummary {
  id: string;
  bookingType: string;
  customerName: string;
  startDateTime: string;
  endDateTime: string | null;
  numberOfPassengers: number;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  totalAmountCents: number | null;
  basePriceCents: number | null;
  cleaningFeeCents: number | null;
  serviceFeeCents: number | null;
  captainFeeCents: number | null;
  depositAmountCents: number | null;
}

type VerifyState = "loading" | "verified" | "processing" | "error";

export default function PaymentSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");

  const [state, setState] = useState<VerifyState>("loading");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const verify = useCallback(async () => {
    if (!sessionId) {
      setState("error");
      return;
    }

    try {
      const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
      const data = await res.json();

      if (res.status === 202) {
        // Webhook hasn't processed yet — retry with backoff
        setState("processing");
        const delay = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
        setTimeout(() => setRetryCount((c) => c + 1), delay);
        return;
      }

      if (res.ok && data.success && data.bookingId) {
        setBooking(data.booking);
        setState("verified");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, [sessionId, retryCount]);

  useEffect(() => {
    if (cancelled) {
      router.push("/profile/bookings");
      return;
    }
    verify();
  }, [verify, cancelled, router]);

  useEffect(() => {
    if (state === "verified") {
      setTimeout(() => {
        setShowAnimation(true);
        setTimeout(() => fireConfetti(), 500);
      }, 100);
    }
  }, [state]);

  // Redirect on persistent error
  useEffect(() => {
    if (state === "error") {
      const timer = setTimeout(() => router.push("/profile/bookings"), 5000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  if (state === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gold/10">
        <div className="mx-auto max-w-md px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
              <CheckCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mb-3 text-2xl font-semibold text-gray-900">
              Verification Failed
            </h1>
            <p className="mb-6 text-gray-600">
              We couldn&apos;t verify your payment. You&apos;ll be redirected to
              your bookings shortly.
            </p>
            <Button onClick={() => router.push("/profile/bookings")}>
              Go to My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "loading" || state === "processing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gold/10">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-gray-600">
            {state === "processing"
              ? "Finalizing your booking..."
              : "Confirming your payment..."}
          </p>
        </div>
      </div>
    );
  }

  const bookingDate = booking?.startDateTime
    ? format(new Date(booking.startDateTime), "EEEE, MMM d, yyyy 'at' h:mma")
    : null;

  const duration =
    booking?.startDateTime && booking?.endDateTime
      ? Math.round(
          (new Date(booking.endDateTime).getTime() -
            new Date(booking.startDateTime).getTime()) /
            (1000 * 60 * 60),
        )
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gold/10">
      <div
        className={`mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 transition-all duration-700 ${
          showAnimation ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Success Header */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-10 text-center sm:px-8">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 ring-4 ring-green-200">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-700">
              Your payment was successful and a confirmation email is on its
              way.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Boat Image */}
              {booking?.boatMainImage && (
                <div className="relative h-48 overflow-hidden rounded-lg">
                  <Image
                    src={booking.boatMainImage}
                    alt={booking.boatName || "Boat"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Booking Info */}
              <div className="space-y-4">
                {booking?.boatName && (
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                      <Ship className="h-4 w-4" />
                      Boat
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {booking.boatName}
                    </h2>
                    {booking.boatCategory && (
                      <p className="text-sm text-gray-600">
                        {booking.boatCategory}
                      </p>
                    )}
                  </div>
                )}

                {bookingDate && (
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Date & Time
                    </div>
                    <p className="font-medium text-gray-900">
                      {bookingDate}
                      {duration ? ` \u2022 ${duration} hours` : ""}
                    </p>
                  </div>
                )}

                {booking?.id && (
                  <div>
                    <div className="mb-1 text-sm text-gray-500">Booking ID</div>
                    <p className="font-mono text-sm text-gray-900">
                      {booking.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            {booking?.totalAmountCents && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="space-y-2 text-sm">
                  {booking.basePriceCents != null &&
                    booking.basePriceCents > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Base price</span>
                        <span>
                          {formatCentsAsCurrency(booking.basePriceCents)}
                        </span>
                      </div>
                    )}
                  {booking.cleaningFeeCents != null &&
                    booking.cleaningFeeCents > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Cleaning fee</span>
                        <span>
                          {formatCentsAsCurrency(booking.cleaningFeeCents)}
                        </span>
                      </div>
                    )}
                  {booking.captainFeeCents != null &&
                    booking.captainFeeCents > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Captain fee</span>
                        <span>
                          {formatCentsAsCurrency(booking.captainFeeCents)}
                        </span>
                      </div>
                    )}
                  {booking.serviceFeeCents != null &&
                    booking.serviceFeeCents > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Card processing fee</span>
                        <span>
                          {formatCentsAsCurrency(booking.serviceFeeCents)}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900">
                    <span>Total Paid</span>
                    <span className="text-green-600">
                      {formatCentsAsCurrency(booking.totalAmountCents)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                <CheckCircle className="mr-1 h-4 w-4" />
                Confirmed
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                Payment Received
              </span>
            </div>

            {/* Next Steps */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">
                What&apos;s Next?
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>&bull; Check your email for the booking confirmation</li>
                <li>&bull; Review trip details and arrival instructions</li>
                <li>&bull; Prepare valid IDs for all passengers</li>
                <li>&bull; Contact us if you have any questions</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/profile/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  View My Bookings
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/boats/search">
                  <Ship className="mr-2 h-4 w-4" />
                  Browse More Boats
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Support */}
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{" "}
            <a
              href="mailto:bookings@kossailing.com"
              className="text-primary hover:underline"
            >
              bookings@kossailing.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
