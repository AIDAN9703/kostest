"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  CheckCircle,
  Calendar,
  Home,
  Printer,
  Download,
  Share2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import confetti from "canvas-confetti";

// 🎊 Subtle, classy confetti (navy, gold, white)
const fireConfetti = () => {
  if (process.env.NODE_ENV === "development") {
    console.log("🎊 Firing confetti animation");
  }

  // Your brand colors + ocean vibes
  const colors = [
    "#10B981",
    "#3B82F6",
    "#0EA5E9",
    "#06B6D4",
    "#F59E0B",
    "#8B5CF6",
  ];

  // Create BIG emoji shapes
  const bigBoat = confetti.shapeFromText({ text: "🛥️", scalar: 5 });
  const bigSailboat = confetti.shapeFromText({ text: "⛵", scalar: 5 });
  const bigWave = confetti.shapeFromText({ text: "🌊", scalar: 4 });
  const bigAnchor = confetti.shapeFromText({ text: "⚓", scalar: 4 });
  const bigParty = confetti.shapeFromText({ text: "🎉", scalar: 5 });

  // 🚀 MAIN EXPLOSION from bottom center
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { y: 1.0, x: 0.5 }, // WAY at the bottom
    colors: colors,
    shapes: [bigBoat, bigSailboat, bigParty],
    scalar: 2, // Even bigger on screen
    gravity: 0.6,
    startVelocity: 60, // Shoot up faster
    ticks: 500, // Stay longer
    disableForReducedMotion: true,
  });

  // 🎯 LEFT CANNON from far left
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 45, // Shoot diagonally up-right
      spread: 80,
      origin: { x: -0.2, y: 1.0 }, // Far left bottom
      colors: colors,
      shapes: [bigWave, bigAnchor, bigSailboat],
      scalar: 2,
      gravity: 0.7,
      startVelocity: 50,
      ticks: 400,
      disableForReducedMotion: true,
    });
  }, 400);

  // 🎯 RIGHT CANNON from far right
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 135, // Shoot diagonally up-left
      spread: 80,
      origin: { x: 1.2, y: 1.0 }, // Far right bottom
      colors: colors,
      shapes: [bigWave, bigAnchor, bigBoat],
      scalar: 2,
      gravity: 0.7,
      startVelocity: 50,
      ticks: 400,
      disableForReducedMotion: true,
    });
  }, 600);

  // 🌟 FINALE BURST from very bottom
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 1.1, x: 0.5 }, // Even lower
      colors: colors,
      shapes: [bigBoat, bigSailboat, bigParty],
      scalar: 1.8,
      gravity: 0.5,
      startVelocity: 45,
      ticks: 600,
      disableForReducedMotion: true,
    });
  }, 1000);
};

interface BookingSuccessClientProps {
  user: any;
}

export default function BookingSuccessClient({
  user,
}: BookingSuccessClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAnimation, setShowAnimation] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "verified" | "error"
  >("loading");
  const [verifiedBookingId, setVerifiedBookingId] = useState<string | null>(
    null
  );

  // Get booking data from URL params
  const bookingType = searchParams.get("type");
  const bookingId = searchParams.get("bookingId");
  const boatName = searchParams.get("boatName");
  const boatImage = searchParams.get("boatImage");
  const totalAmount = searchParams.get("totalAmount");
  const sessionId = searchParams.get("session_id");
  const startDateTime = searchParams.get("startDateTime");
  const hours = searchParams.get("hours");
  const basePrice = searchParams.get("basePrice");
  const cleaningFee = searchParams.get("cleaningFee");
  const serviceFee = searchParams.get("serviceFee");

  // Verify Stripe payment for instant bookings
  useEffect(() => {
    if (bookingType === "instant" && sessionId) {
      const verifyPayment = async () => {
        try {
          const response = await fetch(
            `/api/stripe/verify?session_id=${sessionId}`
          );
          const data = await response.json();

          if (response.ok && data.success) {
            setVerificationStatus("verified");
            setVerifiedBookingId(data.bookingId);
          } else {
            setVerificationStatus("error");
            console.error("Payment verification failed:", data.error);
          }
        } catch (error) {
          setVerificationStatus("error");
          console.error("Payment verification error:", error);
        }
      };

      verifyPayment();
    } else if (bookingType === "request" && bookingId) {
      // Request bookings don't need payment verification
      setVerificationStatus("verified");
      setVerifiedBookingId(bookingId);
    } else {
      setVerificationStatus("error");
    }
  }, [bookingType, sessionId, bookingId]);

  useEffect(() => {
    // Trigger animation after verification
    if (verificationStatus === "verified") {
      const timer = setTimeout(() => {
        setShowAnimation(true);
        // Fire confetti right when the check mark appears (after 500ms delay)
        setTimeout(() => {
          fireConfetti();
        }, 800);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus]);

  // Redirect if verification fails
  useEffect(() => {
    if (verificationStatus === "error") {
      const timer = setTimeout(() => router.push("/profile/bookings"), 3000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus, router]);

  // Error state
  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gold/10">
        <div className="relative max-w-3xl mx-auto px-6 py-16">
          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 ring-1 ring-red-100 mb-6">
              <CheckCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {bookingType === "instant"
                ? "We could not verify your payment. You can review your booking status in your profile."
                : "We could not verify your booking. We'll redirect you to your bookings shortly."}
            </p>
            <Button onClick={() => router.push("/profile/bookings")}>
              Go to My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !bookingType ||
    (!bookingId && !sessionId) ||
    verificationStatus !== "verified"
  ) {
    return null;
  }

  const isInstantBook = bookingType === "instant";
  const isRequest = bookingType === "request";

  const formattedDate = startDateTime
    ? format(new Date(startDateTime), "EEEE, MMM d, yyyy 'at' h:mma")
    : null;

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF functionality
  const handleDownloadPDF = () => {
    // Create a printable version of the booking details
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Confirmation - ${boatName || "Boat Booking"}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; color: #333; }
              .header { border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; color: #10B981; margin: 0; }
              .subtitle { color: #666; margin: 5px 0 0 0; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #374151; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-item { }
              .info-label { font-size: 12px; text-transform: uppercase; color: #6B7280; margin-bottom: 5px; }
              .info-value { font-weight: 500; }
              .price-breakdown { background: #F9FAFB; padding: 20px; border-radius: 8px; }
              .price-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .price-total { border-top: 1px solid #D1D5DB; padding-top: 10px; font-weight: 600; font-size: 16px; }
              .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
              .status-confirmed { background: #D1FAE5; color: #065F46; }
              .status-pending { background: #FEF3C7; color: #92400E; }
              .next-steps { }
              .next-steps li { margin-bottom: 8px; }
              @media print { body { margin: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${isInstantBook ? "Booking Confirmed" : "Booking Request Submitted"}</h1>
              <p class="subtitle">Booking #${verifiedBookingId || bookingId || "Processing..."}</p>
              <span class="status ${isInstantBook ? "status-confirmed" : "status-pending"}">
                ${isInstantBook ? "Confirmed" : "Under Review"}
              </span>
            </div>
            
            <div class="section">
              <h2 class="section-title">Trip Details</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Boat</div>
                  <div class="info-value">${boatName || "—"}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Date & Time</div>
                  <div class="info-value">${formattedDate || "—"}${hours ? ` • ${hours} hours` : ""}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Price Breakdown</h2>
              <div class="price-breakdown">
                <div class="price-row">
                  <span>Base price</span>
                  <span>${basePrice ? formatCurrency(parseFloat(basePrice)) : "—"}</span>
                </div>
                ${
                  cleaningFee
                    ? `
                <div class="price-row">
                  <span>Cleaning fee</span>
                  <span>${formatCurrency(parseFloat(cleaningFee))}</span>
                </div>
                `
                    : ""
                }
                ${
                  serviceFee
                    ? `
                <div class="price-row">
                  <span>Service fee</span>
                  <span>${formatCurrency(parseFloat(serviceFee))}</span>
                </div>
                `
                    : ""
                }
                <div class="price-row price-total">
                  <span>Total</span>
                  <span>${totalAmount ? formatCurrency(parseFloat(totalAmount)) : "—"}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Next Steps</h2>
              <ul class="next-steps">
                <li>Check your email for confirmation details</li>
                <li>Review trip details and arrival time</li>
                <li>Prepare valid IDs for all passengers</li>
              </ul>
            </div>

            <div class="section">
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mma")}
              </p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${isInstantBook ? "Booking Confirmed" : "Booking Request"} - ${boatName}`,
          text: `I just ${isInstantBook ? "confirmed" : "submitted"} a booking for ${boatName} on ${formattedDate}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div
        className={`max-w-7xl 2xl:max-w-8xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10 xl:py-12 2xl:py-16 transition-all duration-700 ${showAnimation ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 xl:mb-10 gap-4">
          <div>
            <h1 className="text-sm font-bold font-poppins text-gray-900">
              {isInstantBook ? "Booking Confirmed!" : "Request Submitted!"}
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Booking #{verifiedBookingId || bookingId || "Processing..."}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium self-start sm:self-auto ${isInstantBook ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
          >
            {isInstantBook ? "Confirmed" : "Under Review"}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-12 2xl:gap-16 items-start">
          <div className="w-full xl:col-span-2 2xl:col-span-3 space-y-4 sm:space-y-6 xl:space-y-8">
            {/* Boat Summary */}
            <div className="bg-white">
              <div className="flex gap-3 sm:gap-4 xl:gap-6">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={boatImage || "/images/herooption13.jpeg"}
                    alt={boatName || "Boat"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900 truncate">
                    {boatName || "Boat Booking"}
                  </h2>
                  <p className="text-sm xl:text-base text-gray-600 mt-1 break-words">
                    {formattedDate || "—"}
                    {hours ? ` • ${hours} hours` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Status */}
            <div className="bg-white">
              <h3 className="text-sm xl:text-base font-semibold text-gray-900 mb-3 xl:mb-4">
                Booking Status
              </h3>
              <p className="text-sm xl:text-base text-gray-700 leading-relaxed">
                {isInstantBook
                  ? "Your booking is confirmed! You will receive a confirmation email shortly with all the details."
                  : "Your booking request is under review. Our team will confirm your booking shortly and send you an email with next steps."}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-white">
              <h3 className="text-sm xl:text-base font-semibold text-gray-900 mb-3 xl:mb-4">
                Next Steps
              </h3>
              <ul className="space-y-2 sm:space-y-3 xl:space-y-4 text-sm xl:text-base text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Check your email for confirmation details</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Review trip details and arrival time</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Prepare valid IDs for all passengers</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 xl:space-y-8 xl:sticky xl:top-6 2xl:top-8 self-start">
            {/* Price Breakdown */}
            <div className="bg-white">
              <h3 className="text-sm xl:text-base font-semibold text-gray-900 mb-4 xl:mb-6">
                Price Breakdown
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 xl:p-5">
                <div className="space-y-3 xl:space-y-4 text-sm xl:text-base">
                  <div className="flex justify-between text-gray-700">
                    <span>Base price</span>
                    <span className="font-medium">
                      {basePrice ? formatCurrency(parseFloat(basePrice)) : "—"}
                    </span>
                  </div>
                  {cleaningFee && (
                    <div className="flex justify-between text-gray-700">
                      <span>Cleaning fee</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(cleaningFee))}
                      </span>
                    </div>
                  )}
                  {serviceFee && (
                    <div className="flex justify-between text-gray-700">
                      <span>Service fee</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(serviceFee))}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3 xl:pt-4">
                    <div className="flex justify-between text-gray-900 font-bold text-base xl:text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {totalAmount
                          ? formatCurrency(parseFloat(totalAmount))
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 xl:space-y-4">
              {/* Primary Actions */}
              <div className="space-y-2">
                <Link
                  href="/profile/bookings"
                  className="w-full inline-flex items-center justify-center px-4 py-3 xl:px-6 xl:py-4 border border-gray-300 rounded-lg text-sm xl:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  <Calendar className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                  View My Bookings
                </Link>
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center px-4 py-3 xl:px-6 xl:py-4 rounded-lg text-sm xl:text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors touch-manipulation"
                >
                  <Home className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                  Back to Home
                </Link>
              </div>

              {/* Secondary Actions */}
              <div className="border-t border-gray-200 pt-3 xl:pt-4">
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Save & Share
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation group"
                  >
                    <Printer className="w-4 h-4 xl:w-5 xl:h-5 text-gray-600 group-hover:text-gray-900 mb-1" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                      Print
                    </span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation group"
                  >
                    <Download className="w-4 h-4 xl:w-5 xl:h-5 text-gray-600 group-hover:text-gray-900 mb-1" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                      PDF
                    </span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation group"
                  >
                    <Share2 className="w-4 h-4 xl:w-5 xl:h-5 text-gray-600 group-hover:text-gray-900 mb-1" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                      Share
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
