"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "next-auth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Clock, ArrowLeft, MessageCircle, CreditCard } from "lucide-react";
import { formatCurrency } from "@/shared/utils/general-utils";
import { BookingRequest } from "@/features/_validation/validations";
import { SafeBoatData, BookingWithDetails } from "@/shared/types/booking.types";
import { PricingTier } from "@/shared/types/types";
import BoatSummary from "./BoatSummary";
import { createBookingRequest } from "@/features/bookings/actions/request";
import { createInstantBooking } from "@/features/bookings/actions/instant";

interface BookingDetailsContentProps {
  user: User | null;
}

interface BookingState {
  data: BookingWithDetails | null;
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
    timeLeft: 600, // 10 minutes default
    error: null
  });

  // Parse URL data on mount
  useEffect(() => {
    try {
      const dataParam = searchParams.get('data');
      if (!dataParam) {
        setBookingState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "No booking data found" 
        }));
        return;
      }

      const parsedData = JSON.parse(decodeURIComponent(dataParam)) as BookingWithDetails;
      
      if (!parsedData.boat || !parsedData.selectedTier) {
        setBookingState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Invalid booking data" 
        }));
        return;
      }

      setBookingState(prev => ({
        ...prev,
        data: parsedData,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      console.error("Failed to parse booking data:", error);
      setBookingState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to load booking data" 
      }));
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (!bookingState.data || bookingState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setBookingState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingState.data, bookingState.timeLeft]);

  // Handle redirect when time expires
  useEffect(() => {
    if (bookingState.timeLeft === 0 && bookingState.data) {
      router.push(`/boats/${bookingState.data.boatId}`);
    }
  }, [bookingState.timeLeft, bookingState.data, router]);

  const calculateTotalPrice = useCallback(() => {
    if (!bookingState.data) return 0;
    
    const { selectedTier, boat } = bookingState.data;
    let total = selectedTier.price;
    
    // Note: Captain fee would be calculated on backend based on boat settings
    // For now, just return base price + cleaning fee
    
    if (boat.cleaningFee) {
      total += boat.cleaningFee;
    }
    
    return total;
  }, [bookingState.data]);

  const handleBookingSubmit = useCallback(async (paymentMethod: 'request' | 'instant') => {
    if (!bookingState.data || !user) return;

    setBookingState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const bookingPayload: BookingRequest & { boatId: string } = {
        startDateTime: bookingState.data.startDateTime,
        pricingTierId: bookingState.data.selectedTier.id,
        numberOfPassengers: bookingState.data.numberOfPassengers,
        needsCaptain: bookingState.data.needsCaptain,
        specialRequests: bookingState.data.specialRequests,
        boatId: bookingState.data.boatId,
      };

      let result;
      if (paymentMethod === 'instant') {
        result = await createInstantBooking(bookingPayload);
      } else {
        result = await createBookingRequest(bookingPayload);
      }

      if (result.success) {
        if (paymentMethod === 'instant' && 'paymentUrl' in result && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          router.push(`/profile/bookings`);
        }
      } else {
        setBookingState(prev => ({ 
          ...prev, 
          error: result.error || "Failed to create booking" 
        }));
      }
    } catch (error) {
      console.error("Booking submission failed:", error);
      setBookingState(prev => ({ 
        ...prev, 
        error: "An unexpected error occurred" 
      }));
    } finally {
      setBookingState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [bookingState.data, user, router]);

  if (bookingState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (bookingState.error || !bookingState.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {bookingState.error || "Booking Expired"}
            </h3>
            <p className="text-gray-600 mb-4">
              {bookingState.error || "This booking session has expired. Please start over."}
            </p>
            <Button onClick={() => router.push('/boats')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Boats
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { boat, selectedTier } = bookingState.data;
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            Complete Your Booking
          </h1>
        </div>

        {/* Booking Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <BoatSummary
              boat={boat}
              bookingData={bookingState.data}
              selectedTier={selectedTier}
              timeLeft={bookingState.timeLeft}
            />
          </CardContent>
        </Card>

        {/* Error Display */}
        {bookingState.error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-4">
              <div className="text-red-600 text-sm">
                {bookingState.error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {boat.instantBook && (
            <Button
              onClick={() => handleBookingSubmit('instant')}
              disabled={bookingState.isSubmitting || bookingState.timeLeft === 0}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {bookingState.isSubmitting ? "Processing..." : `Pay Now ${formatCurrency(totalPrice)}`}
            </Button>
          )}
          
          <Button
            onClick={() => handleBookingSubmit('request')}
            disabled={bookingState.isSubmitting || bookingState.timeLeft === 0}
            variant={boat.instantBook ? "outline" : "default"}
            className="w-full h-12 font-semibold"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {bookingState.isSubmitting ? "Processing..." : "Send Booking Request"}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
} 