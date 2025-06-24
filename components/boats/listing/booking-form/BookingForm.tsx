"use client";

import { useState, useEffect } from "react";
import { Boat } from "@/lib/types/types";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/general-utils";
import { calculateEndTime } from "@/lib/utils/booking-utils";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema, BookingRequest } from "@/lib/validation/validations";
import { createBookingRequest } from "@/lib/actions/booking/request";
import { createInstantBooking } from "@/lib/actions/booking/instant";
import { Form } from "@/components/ui/form";
import { MessageCircle, Zap, Anchor } from "lucide-react";

// Import our modular components
import { PricingDisplay } from "./PricingDisplay";
import { BookingDetails } from "./BookingDetails";
import { CaptainSelection } from "./CaptainSelection";
import { SpecialRequests } from "./SpecialRequests";
import { PriceSummary } from "./PriceSummary";
import { AuthModal } from "./AuthModal";

interface BookingFormProps {
  variant: "REQUEST" | "INSTANT";
  boat: Boat;
  user: User | undefined;
}

// Form data persistence helpers
const FORM_STORAGE_KEY = "booking-form-data";

const saveFormData = (data: Partial<BookingRequest>) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Could not save form data to localStorage:", error);
  }
};

const loadFormData = (): Partial<BookingRequest> | null => {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn("Could not load form data from localStorage:", error);
    return null;
  }
};

const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.warn("Could not clear form data from localStorage:", error);
  }
};

export default function BookingForm({ variant, boat, user }: BookingFormProps) {
  const router = useRouter();
  const isRequest = variant === "REQUEST";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExpandedForm, setShowExpandedForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN");

  // Check if boat has pricing tiers
  if (!boat.pricingTiers || boat.pricingTiers.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <Anchor className="h-5 w-5 text-gray-400" />
        </div>
        <h3 className="font-semibold text-navy-900 mb-2">No pricing available</h3>
        <p className="text-gray-600 text-sm">No pricing options available for this boat</p>
      </div>
    );
  }

  // Filter active pricing tiers and sort by hours
  const activePricingTiers = boat.pricingTiers
    .filter(tier => tier.isActive)
    .sort((a, b) => a.hours - b.hours);

  // Load saved form data on mount
  const savedData = loadFormData();
  
  // Initialize form with saved data or defaults
  const form = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      startDate: savedData?.startDate ? new Date(savedData.startDate) : undefined as unknown as Date,
      startTime: savedData?.startTime || "",
      pricingTierId: savedData?.pricingTierId || "",
      numberOfPassengers: savedData?.numberOfPassengers || 1,
      needsCaptain: savedData?.needsCaptain ?? boat.crewRequired,
      specialRequests: savedData?.specialRequests || "",
    },
    mode: "onChange"
  });
  
  // Watch for form changes and save to localStorage
  const formValues = form.watch();
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormData(formValues);
    }, 500); // Debounce saves
    
    return () => clearTimeout(timer);
  }, [formValues]);

  // Watch for pricing tier changes to show selected tier info
  const selectedPricingTierId = form.watch("pricingTierId");
  const selectedStartTime = form.watch("startTime");
  const needsCaptain = form.watch("needsCaptain");
  
  const selectedPricingTier = activePricingTiers.find(tier => tier.id === selectedPricingTierId);

  // Calculate end time when start time and pricing tier change
  const endTime = selectedStartTime && selectedPricingTier 
    ? calculateEndTime(selectedStartTime, selectedPricingTier.hours)
    : "";

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedPricingTier) return 0;
    
    const basePrice = selectedPricingTier.price;
    const captainFee = (needsCaptain || boat.crewRequired) ? 100 : 0;
    const cleaningFee = boat.cleaningFee || 0;
    const subtotal = basePrice + captainFee + cleaningFee;
    const taxAmount = subtotal * 0.08; // 8% tax
    
    return subtotal + taxAmount;
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Form data is already saved in localStorage, so it will persist
    router.refresh(); // Refresh to get the user session
  };

  // Handle form submission
  async function onSubmit(data: BookingRequest) {
    if (!selectedPricingTier) {
      toast({
        title: "Error",
        description: "Please select a duration option",
        variant: "destructive",
      });
      return;
    }

    // If no user, show auth modal instead
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const bookingData = {
        ...data,
        boatId: boat.id,
      };

      if (isRequest) {
        const result = await createBookingRequest(bookingData);
      
        if (result.success) {
          toast({
            title: "Booking request submitted",
            description: result.message || "Your request has been submitted successfully",
          });
          clearFormData(); // Clear saved data on successful submission
          router.refresh();
        } else {
          toast({
            title: "Booking failed",
            description: result.error || "Please try again",
            variant: "destructive",
          });
        }
      } else {
        const result = await createInstantBooking(bookingData);
        
        if (result.success) {
          toast({
            title: "Redirecting to payment",
            description: result.message || "Taking you to the payment page",
          });
          
          clearFormData(); // Clear saved data on successful submission
          
          if (result.paymentUrl) {
            window.location.href = result.paymentUrl;
          } else {
            router.refresh();
          }
        } else {
          toast({
            title: "Booking failed",
            description: result.error || "Please try again",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="space-y-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          {/* Pricing Display */}
          <PricingDisplay 
            boat={boat} 
            control={form.control} 
            selectedPricingTier={selectedPricingTier}
          />

          {/* Booking Details */}
          <BookingDetails 
            boat={boat} 
            control={form.control}
            getValues={form.getValues}
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
            isExpanded={showExpandedForm}
            onToggle={() => setShowExpandedForm(!showExpandedForm)}
          />

          {/* Price Summary */}
          <PriceSummary 
            boat={boat}
            selectedPricingTier={selectedPricingTier}
            needsCaptain={needsCaptain}
            totalPrice={calculateTotalPrice()}
            isRequest={isRequest}
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="outline"
            className={cn(
              "w-full h-9 text-primary font-bold transition-all duration-200 text-sm shadow-lg hover:shadow-xl rounded-lg",
              isRequest 
                ? "bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800" 
                : "bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
            )}
            disabled={isSubmitting || !selectedPricingTier}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                {isRequest ? "Submitting..." : "Processing..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isRequest ? <MessageCircle className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                {user ? 
                  (isRequest ? "Send Request" : "Book & Pay Now") :
                  (isRequest ? "Continue to Request" : "Continue to Book")
                }
              </div>
            )}
          </Button>
        </form>
      </Form>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        onAuthModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
} 