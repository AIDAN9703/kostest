"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean } from "nuqs";
import BookingSummary from "./BookingSummary";
import BookingAuthSection from "./BookingAuthSection";
import KnowBeforeYouGo from "./KnowBeforeYouGo";
import BookingPricingSection from "./BookingPricingSection";
import BookingSubmitButton from "./BookingSubmitButton";
import CharterDetailsForm from "./CharterDetailsForm";
import { useBoat } from "./BoatProvider";
import { calculateBookingPrice } from "@/shared/utils/pricing-utils";
import { BookingRequest } from "@/features/_validation/validations";
import { createInstantBooking } from "@/features/bookings/actions/instant";
import { createBookingRequest } from "@/features/bookings/actions/request";
import type { Session } from "next-auth";

export default function BookingDetailsClient({ user }: { user: Session['user'] | null }) {
  const router = useRouter();
  const boat = useBoat();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ NUQS MAGIC: Replace all the complex state management with this
  const [bookingState] = useQueryStates({
    startDateTime: parseAsString,
    pricingTierId: parseAsString,
    numberOfPassengers: parseAsInteger.withDefault(1),
    needsCaptain: parseAsBoolean.withDefault(false),
  });

  const { startDateTime, pricingTierId, numberOfPassengers, needsCaptain } = bookingState;
  const isFormComplete = !!(startDateTime && pricingTierId && numberOfPassengers);

  // Simple redirect if no booking data
  useEffect(() => {
    if (!isFormComplete) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No booking data found, redirecting to boat page');
      }
      router.push(`/boats/${boat.id}`);
    }
  }, [isFormComplete, boat.id, router]);

  const selectedTier = useMemo(() => {
    return boat.pricingTiers?.find((t) => t.id === pricingTierId) || null;
  }, [boat.pricingTiers, pricingTierId]);

  const priceBreakdown = useMemo(() => {
    if (!selectedTier || !boat) return null;
    return calculateBookingPrice(
      selectedTier.price,
      boat.cleaningFee || 0,
      0
    );
  }, [selectedTier, boat]);

  const safeBoat = useMemo(() => ({
    id: boat.id,
    name: boat.name,
    mainImage: boat.mainImage ?? null,
    instantBook: !!boat.instantBook,
    cleaningFee: boat.cleaningFee ?? null,
    locationLabel: boat.locationLabel ?? null,
    timezone: (boat.timezone as string | null) ?? null,
  }), [boat]);

  const handleBookingSubmit = useCallback(async (paymentMethod: 'request' | 'instant') => {
    if (!isFormComplete || !user || !boat || !priceBreakdown) {
      router.push('/sign-in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload: BookingRequest & { boatId: string } = {
        startDateTime: startDateTime!,
        pricingTierId: selectedTier!.id,
        numberOfPassengers: numberOfPassengers!,
        needsCaptain: !!needsCaptain,
        boatId: boat.id,
      };

    const result = paymentMethod === 'instant'
      ? await createInstantBooking(payload)
      : await createBookingRequest(payload);

    if (result?.success) {
      if (paymentMethod === 'instant' && 'paymentUrl' in result && result.paymentUrl) {
        // For instant bookings, redirect to Stripe (stateless flow)
        window.location.href = result.paymentUrl;
      } else if (paymentMethod === 'request' && 'booking' in result && result.booking) {
        // For request bookings, go to success page with booking data
        const params = new URLSearchParams({
          type: 'request',
          bookingId: result.booking.id || '',
          boatName: boat.name || '',
          boatImage: boat.mainImage || '',
          startDateTime: startDateTime!,
          hours: String(selectedTier!.hours || ''),
          basePrice: String(priceBreakdown.basePrice),
          cleaningFee: String(priceBreakdown.cleaningFee),
          serviceFee: String(priceBreakdown.serviceFee),
          totalAmount: String(priceBreakdown.totalPrice),
        });
        router.push(`/bookings/${boat.id}/success?${params.toString()}`);
      }
    }
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormComplete, user, boat, startDateTime, selectedTier, numberOfPassengers, needsCaptain, router, priceBreakdown]);

  // Show loading while nuqs initializes or if missing data
  if (!isFormComplete) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl 2xl:max-w-8xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10 xl:py-12 2xl:py-16">
        <h1 className="text-sm font-bold font-poppins text-gray-900 mb-4 sm:mb-6 xl:mb-8">You're almost done!</h1>
        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-12 2xl:gap-16 items-start">
          <div className="w-full xl:col-span-2 2xl:col-span-3">
            <BookingSummary
              boat={safeBoat}
              selectedTier={selectedTier}
              bookingData={{
                startDateTime: startDateTime!,
                numberOfPassengers: numberOfPassengers!
              }}
            />

            <div className="py-4 sm:py-6 xl:py-8">
              <BookingAuthSection user={user} />
              <CharterDetailsForm />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 xl:space-y-8 xl:sticky xl:top-6 2xl:top-8 self-start">
            <KnowBeforeYouGo boatName={boat.name} />
            <BookingPricingSection
              boat={safeBoat}
              selectedTier={selectedTier!}
              bookingData={{
                needsCaptain: !!needsCaptain,
                numberOfPassengers: numberOfPassengers!
              }}
            />
            <div className="hidden xl:block">
              <BookingSubmitButton
                user={user}
                boat={{ instantBook: boat.instantBook }}
                isSubmitting={isSubmitting}
                onSubmit={handleBookingSubmit}
              />
            </div>
          </div>
        </div>
        {/* Mobile sticky action bar */}
        <div className="xl:hidden fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 py-3 safe-area-pb">
          <BookingSubmitButton
            user={user}
            boat={{ instantBook: boat.instantBook }}
            isSubmitting={isSubmitting}
            onSubmit={handleBookingSubmit}
          />
        </div>
      </div>
    </div>
  );
}
