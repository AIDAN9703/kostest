"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";

interface BookingSubmitButtonProps {
  user?: {
    name?: string | null;
    id: string;
  } | null;
  boat: {
    instantBook: boolean;
  };
  isSubmitting: boolean;
  onSubmit: (paymentMethod: 'request' | 'instant') => void;

}

export default function BookingSubmitButton({ 
  user, 
  boat, 
  isSubmitting, 
  onSubmit
}: BookingSubmitButtonProps) {
  const isDisabled = !user || isSubmitting;

  return (
    <div className="mt-6 sm:mt-8">
      <div className="space-y-3 sm:space-y-4">
        {/* Instant Book Button */}
        {boat.instantBook && (
          <Button
            onClick={user ? () => onSubmit('instant') : undefined}
            disabled={isDisabled}
            className={`w-full h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 ${
              isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500' : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-sm sm:text-base">Processing...</span>
              </div>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        )}

        {/* "Or" divider - only show when both buttons are present */}
        {boat.instantBook && (
          <div className="flex items-center justify-center pt-1">
            <span className="text-sm text-gray-400 font-medium">or</span>
          </div>
        )}

        {/* Request Booking Button */}
        <Button
          onClick={user ? () => onSubmit('request') : undefined}
          disabled={isDisabled}
          variant="outline"
          className={`w-full h-12 sm:h-14 text-primary border-primary hover:bg-primary hover:text-white font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 ${
            boat.instantBook ? 'mt-1 sm:mt-2' : ''
          } ${
            isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-300' : ''
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm sm:text-base">Processing...</span>
            </div>
          ) : (
            "Send Booking Request"
          )}
        </Button>

        {/* Terms and Privacy */}
        {user && (
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4 px-2">
            By submitting your booking you agree to the{' '}
            <span className="text-primary underline hover:no-underline cursor-pointer">Terms of Service</span>
            {' and '}
            <span className="text-primary underline hover:no-underline cursor-pointer">Privacy Policy</span>.
            {' '}Message & data rates may apply. You can opt out of receiving text messages at any time in your account settings or by replying STOP.
          </p>
        )}
      </div>
    </div>
  );
}
