"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Mail, Calendar, Home, Ship } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/shared/utils/general-utils";
import { format } from "date-fns";
import Image from "next/image";
import confetti from "canvas-confetti";

// 🎊 Confetti animation
const fireConfetti = () => {
  const colors = [
    "#10B981",
    "#3B82F6",
    "#0EA5E9",
    "#06B6D4",
    "#F59E0B",
    "#8B5CF6",
  ];
  const bigBoat = confetti.shapeFromText({ text: "🛥️", scalar: 5 });
  const bigSailboat = confetti.shapeFromText({ text: "⛵", scalar: 5 });
  const bigParty = confetti.shapeFromText({ text: "🎉", scalar: 5 });

  confetti({
    particleCount: 60,
    spread: 100,
    origin: { y: 1.0, x: 0.5 },
    colors: colors,
    shapes: [bigBoat, bigSailboat, bigParty],
    scalar: 2,
    gravity: 0.6,
    startVelocity: 60,
    ticks: 500,
    disableForReducedMotion: true,
  });
};

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }

    // Fetch booking details and verify payment
    const fetchBooking = async () => {
      try {
        // First, try to verify payment status (this will update booking if webhook hasn't fired)
        try {
          await fetch(`/api/bookings/${bookingId}/verify-payment`, {
            method: 'POST',
          });
        } catch (verifyError) {
          // Don't fail if verification fails, just log it
          console.warn("Payment verification failed:", verifyError);
        }

        // Then fetch booking details
        const response = await fetch(`/api/bookings/${bookingId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();

        if (!data.success || !data.data) {
          throw new Error("Booking not found");
        }

        setBooking(data.data);

        // Trigger animation after a short delay
        setTimeout(() => {
          setShowAnimation(true);
          setTimeout(() => fireConfetti(), 300);
        }, 100);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError((err as Error).message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gold/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gold/10 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 ring-1 ring-red-100 mb-4">
              <CheckCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Booking Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error ||
                "We couldn't find your booking details. Please contact support if you believe this is an error."}
            </p>
            <Button onClick={() => router.push("/profile/bookings")}>
              Go to My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Format booking date
  const bookingDate = booking.startDateTime
    ? format(new Date(booking.startDateTime), "EEEE, MMM d, yyyy 'at' h:mma")
    : "TBD";

  const customerName =
    booking.customerName ||
    (booking.userFirstName && booking.userLastName
      ? `${booking.userFirstName} ${booking.userLastName}`
      : booking.userEmail || "Customer");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gold/10">
      <div
        className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-700 ${showAnimation ? "opacity-100" : "opacity-0"}`}
      >
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 sm:px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 ring-4 ring-green-200 mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-700">
              Your booking has been confirmed and a confirmation email has been
              sent to your inbox.
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Boat Info */}
              {booking.boatMainImage && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={booking.boatMainImage}
                    alt={booking.boatName || "Boat"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Ship className="w-4 h-4" />
                    Boat
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {booking.boatName || "Boat"}
                  </h2>
                  {booking.boatCategory && (
                    <p className="text-sm text-gray-600">
                      {booking.boatCategory}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    Booking Date
                  </div>
                  <p className="text-gray-900 font-medium">{bookingDate}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Mail className="w-4 h-4" />
                    Booking ID
                  </div>
                  <p className="text-gray-900 font-mono text-sm">
                    {booking.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {booking.totalAmount && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Paid</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirmed
              </span>
              {booking.paymentStatus === "PAID" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Payment Received
                </span>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Check your email for the booking confirmation</li>
                <li>• Review trip details and arrival instructions</li>
                <li>• Prepare valid IDs for all passengers</li>
                <li>• Contact us if you have any questions</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/profile/bookings">
                  <Calendar className="w-4 h-4 mr-2" />
                  View My Bookings
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/boats">
                  <Ship className="w-4 h-4 mr-2" />
                  Browse More Boats
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Support */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
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

