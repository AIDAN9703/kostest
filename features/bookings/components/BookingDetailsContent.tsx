"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingSummary from "./BookingSummary";
import BookingAuthSection from "./BookingAuthSection";
import KnowBeforeYouGo from "./KnowBeforeYouGo";
import BookingPricingSection from "./BookingPricingSection";
import BookingSubmitButton from "./BookingSubmitButton";
import { BookingRequest } from "@/features/_validation/validations";
import { BookingWithDetails } from "@/shared/types/booking.types";


import { createBookingRequest } from "@/features/bookings/actions/request";
import { createInstantBooking } from "@/features/bookings/actions/instant";
import CharterDetailsForm from "./CharterDetailsForm";
import { calculateBookingPrice } from "@/shared/utils/pricing-utils";

interface BookingDetailsContentProps {
  user: any;
}





export default function BookingDetailsContent({ user }: BookingDetailsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookingData, setBookingData] = useState<BookingWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Parse URL data on mount
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      console.log('No data param found');
      return;
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam)) as BookingWithDetails;
      if (!parsedData.boat || !parsedData.selectedTier) {
        router.push('/boats');
        return;
      }
      setBookingData(parsedData);
    } catch (error) {
      console.error("Failed to parse booking data:", error);
      router.push('/');
    }
  }, [searchParams, router]);



  const calculateTotalPrice = useCallback(() => {
    if (!bookingData) return 0;
    
    const { selectedTier, boat } = bookingData;
    
    // Use universal pricing function for consistency
    const priceBreakdown = calculateBookingPrice(
      selectedTier.price,
      boat.cleaningFee || 0,
      0 // Captain fee included in base price
    );
    
    return priceBreakdown.totalPrice;
  }, [bookingData]);

  const handleBookingSubmit = useCallback(async (paymentMethod: 'request' | 'instant') => {
    if (!bookingData || !user) {
      router.push('/sign-in');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingPayload: BookingRequest & { boatId: string } = {
        startDateTime: bookingData.startDateTime,
        pricingTierId: bookingData.selectedTier.id,
        numberOfPassengers: bookingData.numberOfPassengers,
        needsCaptain: bookingData.needsCaptain,
        boatId: bookingData.boatId,
      };

      const result = paymentMethod === 'instant' 
        ? await createInstantBooking(bookingPayload)
        : await createBookingRequest(bookingPayload);

      if (result.success) {
        if (paymentMethod === 'instant' && 'paymentUrl' in result && result.paymentUrl) {
          // For instant booking, we'll handle success after Stripe payment
          window.location.href = result.paymentUrl;
        } else {
          // For request booking, redirect to success page
          const params = new URLSearchParams({
            type: 'request',
            bookingId: result.booking?.id || '',
            boatName: bookingData.boat.name || '',
            conversationId: ('conversationId' in result) ? result.conversationId || '' : ''
          });
          router.push(`/booking-success?${params.toString()}`);
        }
      }
    } catch (error) {
      console.error("Booking submission failed:", error);
      // Let the user try again - no complex error state needed
    } finally {
      setIsSubmitting(false);
    }
  }, [bookingData, user, router]);

  // Simple check - if no data, let loading.tsx handle it or redirect
  if (!bookingData) {
    return null; // Let your loading.tsx handle this
  }

  const { boat, selectedTier } = bookingData;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
       
           <h1 className="text-sm font-bold font-poppins text-gray-900 mb-4">
            You're almost done!
          </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className=" w-full lg:col-span-2">
            {/* Yacht Details Card - OpenTable Style */}
            <BookingSummary
              boat={{
                id: boat.id,
                name: boat.name,
                mainImage: boat.mainImage,
                instantBook: boat.instantBook,
                cleaningFee: boat.cleaningFee,
                locationLabel: boat.locationLabel,
                timezone: boat.timezone // Pass timezone for proper boat time display
              }}
              selectedTier={selectedTier}
              bookingData={{
                startDateTime: bookingData.startDateTime,
                numberOfPassengers: bookingData.numberOfPassengers
              }}
            />

            {/* Charter details */}
              <div className="py-4">
                
                <BookingAuthSection user={user} />

                {/* Checkboxes */}
                <CharterDetailsForm />
              </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* What to know before you go */}
            <KnowBeforeYouGo boatName={boat.name} />

            {/* Pricing Summary */}
            <BookingPricingSection
              boat={boat}
              selectedTier={selectedTier}
              bookingData={{
                needsCaptain: bookingData.needsCaptain,
                numberOfPassengers: bookingData.numberOfPassengers
              }}
            />
          </div>
        </div>

        {/* Bottom Action Section */}
        <BookingSubmitButton
          user={user}
          boat={{ instantBook: boat.instantBook }}
          isSubmitting={isSubmitting}
          onSubmit={handleBookingSubmit}
        />
      </div>
    </div>
  );
} 