"use client";

import { useState } from "react";
import { Boat } from "@/lib/types/types";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema, BookingRequest } from "@/lib/validation/validations";
import { MessageCircle, Anchor } from "lucide-react";
import { calculateEndTime } from "@/lib/utils/booking-utils";

// Import components
import { useSimpleFormPersistence } from "./hooks/useSimpleFormPersistence";
import { usePriceCalculation, useActivePricingTiers } from "./hooks/usePriceCalculation";
import { PricingDisplay } from "./shared/PricingDisplay";
import { BookingDetails } from "./shared/BookingDetails";
import { CaptainSelection } from "./shared/CaptainSelection";
import { SpecialRequests } from "./shared/SpecialRequests";
import { PriceSummary } from "./shared/PriceSummary";

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
      startDate: undefined as unknown as Date,
      startTime: "",
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

  const selectedPricingTierId = form.watch("pricingTierId");
  const selectedStartTime = form.watch("startTime");
  const needsCaptain = form.watch("needsCaptain");
  
  const priceBreakdown = usePriceCalculation({
    boat,
    selectedPricingTierId,
    needsCaptain,
  });

  const endTime = selectedStartTime && priceBreakdown.selectedPricingTier 
    ? calculateEndTime(selectedStartTime, priceBreakdown.selectedPricingTier.hours)
    : "";

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
    if (!priceBreakdown.selectedPricingTier) {
      form.setError("pricingTierId", { 
        message: "Please select a duration option" 
      });
      return;
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
        cleaningFee: boat.cleaningFee
      },
      selectedTier: priceBreakdown.selectedPricingTier
    };

    // Navigate to booking details page with minimal data
    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify(bookingData))
    });
    
    router.push(`/booking-details?${params.toString()}`);
  };

  const isFormValid = form.formState.isValid && priceBreakdown.selectedPricingTier;
  
  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <PricingDisplay 
            boat={boat} 
            control={form.control} 
            selectedPricingTier={priceBreakdown.selectedPricingTier}
          />

          <BookingDetails 
            boat={boat} 
            control={form.control}
            setValue={form.setValue}
            endTime={endTime}
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
            selectedPricingTier={priceBreakdown.selectedPricingTier}
            needsCaptain={needsCaptain}
            totalPrice={priceBreakdown.totalPrice}
            isRequest={true}
          />

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold text-white transition-colors text-sm rounded-lg bg-gray-800 hover:bg-gray-900"
            disabled={!isFormValid}
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