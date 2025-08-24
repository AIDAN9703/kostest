"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle, Calendar, MessageCircle, Home, ArrowRight, Printer } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared/utils/general-utils";
import confetti from 'canvas-confetti';

// 🎊 Subtle, classy confetti (navy, gold, white)
const fireConfetti = () => {
  console.log('🎊 Firing BIGGER boat confetti from the edges!');
  
  // Your brand colors + ocean vibes
  const colors = ['#10B981', '#3B82F6', '#0EA5E9', '#06B6D4', '#F59E0B', '#8B5CF6'];
  
  // Create BIG emoji shapes
  const bigBoat = confetti.shapeFromText({ text: '🛥️', scalar: 5 });
  const bigSailboat = confetti.shapeFromText({ text: '⛵', scalar: 5 });
  const bigWave = confetti.shapeFromText({ text: '🌊', scalar: 4 });
  const bigAnchor = confetti.shapeFromText({ text: '⚓', scalar: 4 });
  const bigParty = confetti.shapeFromText({ text: '🎉', scalar: 5 });
  
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
    disableForReducedMotion: true
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
      disableForReducedMotion: true
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
      disableForReducedMotion: true
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
      disableForReducedMotion: true
    });
  }, 1000);
};

interface BookingSuccessContentProps {
  user: any;
}

export default function BookingSuccessContent({ user }: BookingSuccessContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAnimation, setShowAnimation] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'error'>('loading');
  const [verifiedBookingId, setVerifiedBookingId] = useState<string | null>(null);
  
  // Get booking data from URL params
  const bookingType = searchParams.get('type'); // 'request' or 'instant'
  const bookingId = searchParams.get('bookingId');
  const boatName = searchParams.get('boatName');
  const totalAmount = searchParams.get('totalAmount');
  const conversationId = searchParams.get('conversationId');
  const sessionId = searchParams.get('session_id'); // For Stripe instant bookings

  // Verify Stripe payment for instant bookings
  useEffect(() => {
    if (bookingType === 'instant' && sessionId) {
      const verifyPayment = async () => {
        try {
          const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
          const data = await response.json();
          
          if (response.ok && data.success) {
            setVerificationStatus('verified');
            setVerifiedBookingId(data.bookingId);
          } else {
            setVerificationStatus('error');
            console.error('Payment verification failed:', data.error);
          }
        } catch (error) {
          setVerificationStatus('error');
          console.error('Payment verification error:', error);
        }
      };
      
      verifyPayment();
    } else if (bookingType === 'request' && bookingId) {
      // Request bookings don't need payment verification
      setVerificationStatus('verified');
      setVerifiedBookingId(bookingId);
    } else {
      setVerificationStatus('error');
    }
  }, [bookingType, sessionId, bookingId]);

  useEffect(() => {
    // Trigger animation after verification
    if (verificationStatus === 'verified') {
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
    if (verificationStatus === 'error') {
      const timer = setTimeout(() => router.push('/profile/bookings'), 3000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus, router]);



  // Error state
  if (verificationStatus === 'error') {
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
              {bookingType === 'instant'
                ? 'We could not verify your payment. You can review your booking status in your profile.'
                : 'We could not verify your booking. We’ll redirect you to your bookings shortly.'}
            </p>
            <Button onClick={() => router.push('/profile/bookings')}>
              Go to My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingType || (!bookingId && !sessionId) || verificationStatus !== 'verified') {
    return null;
  }

  const isInstantBook = bookingType === 'instant';
  const isRequest = bookingType === 'request';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className={`relative overflow-hidden transition-all duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          className="relative"
          style={{
            backgroundImage: "url('/images/herooption13.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white/0" />
          <div className="absolute inset-0" style={{ backgroundImage: "url('/assets/subtle-pattern.svg')", opacity: 0.15 }} />
          <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/70 ring-1 ring-white/60 backdrop-blur mb-6 transition-transform duration-700 ${showAnimation ? 'scale-100' : 'scale-90'}`}>
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
             
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {isInstantBook ? 'Your booking has been confirmed!' : 'Your request has been submitted!'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 lg:-mt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Summary Card (slightly more transparent) */}
            <div className={`rounded-2xl border border-white/40 bg-white/60 backdrop-blur shadow-xl p-6 lg:p-8 transition-all duration-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                    {boatName || 'Your Booking'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Booking #{verifiedBookingId || bookingId || 'Processing...'}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap ${
                  isInstantBook ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                }`}>
                  {isInstantBook ? 'Confirmed' : 'Pending Review'}
                </div>
              </div>
              {totalAmount && (
                <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(parseFloat(totalAmount))}
                  </span>
                </div>
              )}
            </div>

                        {/* Important Information Section */}
            <div className={`transition-all duration-700 delay-100 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <h3 className="text-lg font-medium text-gray-900 underline mb-6">Important information</h3>
              
              <div className="space-y-5">
                {/* Booking Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking status</h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {isInstantBook
                      ? "Your booking is confirmed! The owner has been notified and you'll receive a confirmation email with all trip details shortly."
                      : "Your request is under review. The owner typically responds within 24 hours. You'll be notified via email and in-app messaging."}
                  </div>
                </div>

                {!isInstantBook && (
                  /* Payment Process */
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment process</h4>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      Once approved, you'll receive a secure payment link via email. You can complete payment directly through our website using credit card or bank transfer.
                    </div>
                  </div>
                )}

                {/* Check-in Instructions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Check-in instructions</h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {isInstantBook 
                      ? "Arrive 15 minutes before departure. The captain will greet you at the dock and provide a safety briefing. Please bring a valid ID and any special requests mentioned during booking."
                      : "Once approved, you'll receive detailed check-in instructions including the exact dock location, parking information, and the captain's contact details."
                    }
                  </div>
                </div>

                {/* What to Bring */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What to bring</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>Valid photo ID</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>Sunscreen & sunglasses</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>Towels & swimwear</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>Snacks & drinks</span>
                    </div>
                  </div>
                </div>

                {/* Weather Policy */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Weather policy</h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    Charters may be rescheduled for safety due to severe weather. You'll be notified at least 2 hours before departure if changes are needed.
                  </div>
                </div>

                {isInstantBook && (
                  /* Confirmation Details */
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-2">Your confirmation</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmation sent to</span>
                        <span className="text-gray-900">Your email</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calendar invite</span>
                        <span className="text-gray-900">Included</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions Card (slightly more transparent) */}
            <div className={`rounded-2xl border border-white/40 bg-white/60 backdrop-blur shadow-xl p-6 lg:p-8 transition-all duration-700 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <div className="space-y-3">
                <Link href="/profile/bookings" className="block group">
                  <div className="flex items-center gap-4 p-4 transition-all duration-200">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">View my bookings</div>
                      <div className="text-sm text-gray-600">See your upcoming trips</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
                {(conversationId || isRequest) && (
                  <Link href="/messages" className="block group">
                    <div className="flex items-center gap-4 p-4 transition-all duration-200">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Go to messages</div>
                        <div className="text-sm text-gray-600">Chat with the owner</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                )}
                <Link href="/" className="block group">
                  <div className="flex items-center gap-4 p-4 transition-all duration-200">
                    <Home className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Back to home</div>
                      <div className="text-sm text-gray-600">Explore more boats</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
                {isInstantBook && (
                  <button onClick={() => window.print()} className="w-full group">
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-200">
                      <Printer className="w-4 h-4" />
                      <span className="text-sm font-medium">Print confirmation</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Support Section (no card styling) */}
            <div className={`transition-all duration-700 delay-400 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Need help?</h3>
              <p className="text-sm text-gray-600 mb-3">Our team is here for any questions about your booking.</p>
              <a href="mailto:contact@kosyachts.com" className="text-primary font-medium hover:underline text-sm">
                contact@kosyachts.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}