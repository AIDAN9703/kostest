"use client";

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
import { DateSelection } from "./shared/DateSelection";
import { TimeSelection } from "./shared/TimeSelection";
import { PassengerSelection } from "./shared/PassengerSelection";
import { CaptainSelection } from "./shared/CaptainSelection";
import { PriceSummary } from "./shared/PriceSummary";
import { FormHeader } from "./shared/FormHeader";

// Import hooks
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
      // Preselect the lowest active tier by default
      pricingTierId: activePricingTiers[0]?.id || "",
      numberOfPassengers: 1,
      needsCaptain: boat.crewRequired,
    },
    mode: "onChange"
  });

  // Temporarily disable form persistence to avoid incorrect default overrides

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



    // Navigate to booking details
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
    <div className="bg-white p-7 w-full max-w-[560px]" style={{ fontFamily: 'Poppins, var(--font-sans)' }}>
      <FormHeader 
        price={formState.selectedPricingTier?.price}
        hours={formState.selectedPricingTier?.hours}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DateSelection 
            control={form.control}
            currentDate={formState.parsedDateTime.date}
            boatId={boat.id}
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
            boatId={boat.id}
            selectedDate={formState.parsedDateTime.date}
            duration={formState.selectedPricingTier?.hours}
          />

          <PassengerSelection 
            boat={boat} 
            control={form.control}
            setValue={form.setValue}
            show={!!(formState.parsedDateTime.date && formState.parsedDateTime.time && formState.selectedPricingTier)}
          />

          <CaptainSelection 
            boat={boat} 
            control={form.control}
          />

          <PriceSummary 
            boat={boat}
            selectedPricingTier={formState.selectedPricingTier}
            needsCaptain={formState.needsCaptain}
            totalPrice={formState.priceBreakdown.totalPrice}
            isRequest={true}
            show={!!(formState.parsedDateTime.date && formState.parsedDateTime.time && formState.selectedPricingTier)}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 font-semibold text-white transition-colors text-sm rounded-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-0"
              disabled={!formState.isFormValid}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Continue to Request
              </div>
            </Button>
            <div className="mt-4 text-center text-xs text-gray-500">
              You won't be charged yet
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 