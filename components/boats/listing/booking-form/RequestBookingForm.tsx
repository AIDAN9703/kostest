"use client";

import { useState, useCallback } from "react";
import { Boat } from "@/lib/types/types";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema, BookingRequest } from "@/lib/validation/validations";
import { createBookingRequest } from "@/lib/actions/booking/request";
import { MessageCircle, Anchor } from "lucide-react";
import { calculateEndTime } from "@/lib/utils/booking-utils";
import { signIn } from "next-auth/react";

// Import simplified components
import { useSimpleFormPersistence } from "./hooks/useSimpleFormPersistence";
import { usePriceCalculation, useActivePricingTiers } from "./hooks/usePriceCalculation";
import { PricingDisplay } from "./shared/PricingDisplay";
import { BookingDetails } from "./shared/BookingDetails";
import { CaptainSelection } from "./shared/CaptainSelection";
import { SpecialRequests } from "./shared/SpecialRequests";
import { PriceSummary } from "./shared/PriceSummary";

interface RequestBookingFormProps {
  boat: Boat;
  user: User | undefined;
}

export default function RequestBookingForm({ boat, user }: RequestBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple auth state
  const isAuthenticated = !!user;
  
  // Simple auth requirement function
  const requireAuth = useCallback((callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      signIn(undefined, { callbackUrl: `/boats/${boat.id}` });
    }
  }, [isAuthenticated, boat.id]);

  // Get active pricing tiers
  const activePricingTiers = useActivePricingTiers(boat);

  // Form setup with persistence
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

  // Form persistence (session-based)
  const { clearFormData } = useSimpleFormPersistence({
    form,
    boatId: boat.id
  });

  // Get current form values for calculations
  const selectedPricingTierId = form.watch("pricingTierId");
  const selectedStartTime = form.watch("startTime");
  const needsCaptain = form.watch("needsCaptain");
  
  // Calculate pricing
  const priceBreakdown = usePriceCalculation({
    boat,
    selectedPricingTierId,
    needsCaptain,
  });

  // Calculate end time
  const endTime = selectedStartTime && priceBreakdown.selectedPricingTier 
    ? calculateEndTime(selectedStartTime, priceBreakdown.selectedPricingTier.hours)
    : "";

  // Check if boat has pricing tiers
  if (activePricingTiers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Anchor className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">No pricing available</h3>
        <p className="text-gray-600 text-sm">No pricing options are currently available for this boat</p>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (data: BookingRequest) => {
    if (!priceBreakdown.selectedPricingTier) {
      form.setError("pricingTierId", { 
        message: "Please select a duration option" 
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const bookingData = { ...data, boatId: boat.id };
      const result = await createBookingRequest(bookingData);
      
      if (result.success) {
        toast({
          title: "Booking request submitted",
          description: result.message || "Your request has been submitted successfully",
        });
        
        // Clear saved form data on successful submission
        clearFormData();
        form.reset();
      } else {
        toast({
          title: "Booking failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission with authentication check
  const onSubmit = (data: BookingRequest) => {
    requireAuth(() => handleSubmit(data));
  };

  const isFormValid = !!(
    form.formState.isValid && 
    priceBreakdown.selectedPricingTier &&
    !isSubmitting
  );
  
  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Pricing Display */}
          <PricingDisplay 
            boat={boat} 
            control={form.control} 
            selectedPricingTier={priceBreakdown.selectedPricingTier}
          />

          {/* Booking Details */}
          <BookingDetails 
            boat={boat} 
            control={form.control}
            setValue={form.setValue}
            endTime={endTime}
          />

          {/* Captain Selection */}
          <CaptainSelection 
            boat={boat} 
            control={form.control}
          />

          {/* Special Requests */}
          <SpecialRequests 
            control={form.control}
          />

          {/* Price Summary */}
          <PriceSummary 
            boat={boat}
            selectedPricingTier={priceBreakdown.selectedPricingTier}
            needsCaptain={needsCaptain}
            totalPrice={priceBreakdown.totalPrice}
            isRequest={true}
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 font-semibold text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md rounded-lg border-0 bg-gray-800 hover:bg-gray-900"
            disabled={!isFormValid}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Submitting Request...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {isAuthenticated ? "Send Request" : "Continue to Request"}
              </div>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 