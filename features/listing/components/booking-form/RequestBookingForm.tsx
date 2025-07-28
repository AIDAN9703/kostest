"use client";

import { useState } from "react";
import { Boat } from "@/shared/types/types";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema, BookingRequest } from "@/features/_validation/validations";
import { MessageCircle, Anchor } from "lucide-react";

// Import components
import { PricingDisplay } from "./shared/PricingDisplay";
import { DateSelection, TimeSelection, PassengerSelection } from "./shared/BookingDetails";
import { CaptainSelection } from "./shared/CaptainSelection";
import { SpecialRequests } from "./shared/SpecialRequests";
import { PriceSummary } from "./shared/PriceSummary";

// Import hooks
import { useSimpleFormPersistence } from "./hooks/useSimpleFormPersistence";
import { useBookingFormState } from "./hooks/useBookingFormState";
import { useActivePricingTiers } from "./hooks/usePriceCalculation";



interface RequestBookingFormProps {
  boat: Boat;
}

export default function RequestBookingForm({ boat }: RequestBookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const activePricingTiers = useActivePricingTiers(boat);

  const form = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      startDateTime: "",
      pricingTierId: "",
      numberOfPassengers: 1,
      needsCaptain: boat.crewRequired,
      specialRequests: "",
    },
    mode: "onChange"
  });

  const { clearFormData } = useSimpleFormPersistence({
    form,
    boatId: boat.id
  });

  // Consolidated form state and pricing calculations
  const formState = useBookingFormState({
    form,
    boat
  });

  if (activePricingTiers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Anchor className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">No pricing available</h3>
        <p className="text-gray-600 text-sm">No pricing options are currently available for this boat</p>
      </div>
    );
  }

  const handleSubmit = (data: BookingRequest) => {
    if (!formState.selectedPricingTier) {
      form.setError("pricingTierId", { 
        message: "Please select a duration option" 
      });
      return;
    }

    // DEBUG: Log the timezone conversion for testing
    if (data.startDateTime) {
      console.log('🚀 Booking Submission Debug:', {
        selectedDateTime: data.startDateTime,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utcTime: new Date(data.startDateTime).toISOString(),
        localDisplay: new Date(data.startDateTime).toLocaleString(),
        pricingTier: formState.selectedPricingTier?.name
      });
    }

    // Clear form data and navigate to booking details
    clearFormData();
    
    // Prepare booking data with safe boat properties and selected tier
    const bookingData = {
      ...data,
      boatId: boat.id,
      // Only pass safe boat properties
      boat: {
        id: boat.id,
        name: boat.name,
        mainImage: boat.mainImage,
        instantBook: boat.instantBook,
        cleaningFee: boat.cleaningFee,
        locationLabel: boat.locationLabel
      },
      selectedTier: formState.selectedPricingTier
    };

    // Navigate to booking details page with minimal data
    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify(bookingData))
    });
    
    router.push(`/booking-details?${params.toString()}`);
  };
  
  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <DateSelection 
            control={form.control}
            currentDate={formState.parsedDateTime.date}
          />

          <PricingDisplay 
            boat={boat} 
            control={form.control} 
            selectedPricingTier={formState.selectedPricingTier}
          />

          <TimeSelection 
            control={form.control}
            currentTime={formState.parsedDateTime.time}
            endTime={formState.endTime}
          />

          <PassengerSelection 
            boat={boat} 
            control={form.control}
            setValue={form.setValue}
          />

          <CaptainSelection 
            boat={boat} 
            control={form.control}
          />

          <SpecialRequests 
            control={form.control}
          />

          <PriceSummary 
            boat={boat}
            selectedPricingTier={formState.selectedPricingTier}
            needsCaptain={formState.needsCaptain}
            totalPrice={formState.priceBreakdown.totalPrice}
            isRequest={true}
          />

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold text-white transition-colors text-sm rounded-lg bg-gray-800 hover:bg-gray-900"
            disabled={!formState.isFormValid}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Continue to Request
            </div>
          </Button>
        </form>
      </Form>
    </div>
  );
} 