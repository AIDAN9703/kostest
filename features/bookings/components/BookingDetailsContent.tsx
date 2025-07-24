"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "next-auth";
import { PricingTier } from "@/shared/types/types";
import { BookingRequest } from "@/features/_validation/validations";
import { createInstantBooking } from "@/features/bookings/actions/instant";
import { createBookingRequest } from "@/features/bookings/actions/request";
import { toast } from "@/shared/hooks/use-toast";
import { Anchor, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

// Component Imports
import BoatSummary from "./BoatSummary";
import BookingAuthFlow from "./BookingAuthFlow";
import PricingSummary from "./PricingSummary";
import BookingSubmit from "./BookingSubmit";

interface BookingDetailsContentProps {
  user?: User;
}

interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
  locationLabel: string | null;
}

interface BookingFormData extends BookingRequest {
  boatId: string;
  boat: SafeBoatData;
  selectedTier: PricingTier;
}

interface BookingState {
  data: BookingFormData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  timeLeft: number;
  error: string | null;
}

export default function BookingDetailsContent({ user }: BookingDetailsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookingState, setBookingState] = useState<BookingState>({
    data: null,
    isLoading: true,
    isSubmitting: false,
    timeLeft: 600, // 10 minutes
    error: null
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | undefined>(user);


  // Timer countdown
  useEffect(() => {
    if (bookingState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setBookingState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bookingState.timeLeft]);

  // Initialize booking data
  useEffect(() => {
    const bookingDataParam = searchParams.get('data');
    
    if (!bookingDataParam) {
      // Try to restore from localStorage if available
      const savedBookingData = localStorage.getItem('booking-data-backup');
      if (savedBookingData) {
        try {
          const parsedData = JSON.parse(savedBookingData);
          setBookingState(prev => ({
            ...prev,
            data: parsedData,
            isLoading: false,
            error: null
          }));
          localStorage.removeItem('booking-data-backup'); // Clean up after restore
          return;
        } catch (error) {
          console.error('Failed to restore booking data from localStorage:', error);
          localStorage.removeItem('booking-data-backup'); // Clean up invalid data
        }
      }
      
      router.push('/');
      return;
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(bookingDataParam));
      
      if (!parsedData.boat || !parsedData.selectedTier || !parsedData.boatId) {
        throw new Error('Missing required booking data');
      }

      setBookingState(prev => ({
        ...prev,
        data: parsedData,
        isLoading: false,
        error: null
      }));
      
      // Backup to localStorage for Google sign-in protection
      localStorage.setItem('booking-data-backup', JSON.stringify(parsedData));
      
    } catch (error) {
      console.error('Failed to initialize booking data:', error);
      setBookingState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid booking data'
      }));
      
      toast({
        title: "Booking data error",
        description: "Please start a new booking",
        variant: "destructive"
      });
      
      router.push('/');
    }
  }, [searchParams, router]);

  // Handle authentication completion
  const handleAuthComplete = useCallback((user: any) => {
    setIsAuthenticated(true);
    setAuthenticatedUser(user);
    toast({
      title: "Authentication successful",
      description: "You can now complete your booking",
    });
  }, []);

  const handleBookingSubmit = useCallback(async () => {
    const { data } = bookingState;
    
    if (!data) {
      toast({
        title: "Cannot submit booking",
        description: "Booking data is missing",
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated || !authenticatedUser) {
      toast({
        title: "Authentication required",
        description: "Please complete authentication to continue",
        variant: "destructive"
      });
      return;
    }

    setBookingState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const bookingPayload = {
        startDate: new Date(data.startDate),
        startTime: data.startTime,
        pricingTierId: data.pricingTierId,
        numberOfPassengers: data.numberOfPassengers,
        needsCaptain: data.needsCaptain,
        specialRequests: data.specialRequests || "",
        boatId: data.boatId,
      };

      const result = data.boat.instantBook 
        ? await createInstantBooking(bookingPayload)
        : await createBookingRequest(bookingPayload);

      if (result.success) {
        if (data.boat.instantBook) {
          const paymentUrl = (result as any).paymentUrl;
          if (paymentUrl) {
            window.location.assign(paymentUrl);
          } else {
            throw new Error('Payment URL not provided');
          }
        } else {
          toast({
            title: "Request submitted successfully",
            description: "We'll contact you within 24 hours to confirm availability",
          });
          router.push('/profile/bookings');
        }
      } else {
        throw new Error(result.error || 'Booking submission failed');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setBookingState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [bookingState, isAuthenticated, authenticatedUser, router]);

  // Loading state
  if (bookingState.isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (bookingState.error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center py-20">
            <Anchor className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Error</h3>
            <p className="text-gray-600 mb-4">{bookingState.error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { data } = bookingState;

  // Don't render anything if we don't have data
  if (!data) {
    return null;
  }

  const { boat, selectedTier } = data;

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Boat Summary Component with integrated timer */}
          <BoatSummary 
            boat={boat}
            bookingData={data}
            selectedTier={selectedTier}
            timeLeft={bookingState.timeLeft}
          />

          {/* Authentication Flow Component */}
          {!isAuthenticated ? (
            <div>
              <BookingAuthFlow onAuthComplete={handleAuthComplete} />
            </div>
          ) : (
            <div className="flex items-center space-x-3 py-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Account verified</p>
                <p className="text-xs text-gray-600 truncate">
                  {authenticatedUser?.email}
                </p>
              </div>
            </div>
          )}

          {/* Pricing Summary Component - Always visible */}
          <PricingSummary 
            boat={boat}
            selectedTier={selectedTier}
            bookingData={data}
          />

          {/* Submit Button */}
          {isAuthenticated && (
            <BookingSubmit
              boat={boat}
              isSubmitting={bookingState.isSubmitting}
              isAuthenticated={isAuthenticated}
              onSubmit={handleBookingSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
} 