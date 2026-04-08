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
  onSubmit: (paymentMethod: "request" | "instant") => void;
  /** When not signed in, opens booking auth (modal) instead of submitting */
  onNeedAuth?: () => void;
}

export default function BookingSubmitButton({
  user,
  boat,
  isSubmitting,
  onSubmit,
  onNeedAuth,
}: BookingSubmitButtonProps) {
  const needsAuth = !user;
  const isDisabled = isSubmitting;

  const handleClick = (method: "request" | "instant") => {
    if (needsAuth) {
      onNeedAuth?.();
      return;
    }
    onSubmit(method);
  };

  return (
    <div className="mt-6 sm:mt-8">
      <div className="space-y-3 sm:space-y-4">
        {needsAuth && (
          <p className="text-center text-sm text-gray-600 px-1">
            Sign in to submit. Your charter details stay on this page.
          </p>
        )}

        {/* Instant Book Button */}
        {boat.instantBook && (
          <Button
            type="button"
            onClick={() => handleClick("instant")}
            disabled={isDisabled}
            className={`w-full h-12 sm:h-14 font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 ${
              needsAuth
                ? "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-sm sm:text-base">Processing...</span>
              </div>
            ) : needsAuth ? (
              "Sign in to pay"
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
          type="button"
          onClick={() => handleClick("request")}
          disabled={isDisabled}
          variant="outline"
          className={`w-full h-12 sm:h-14 font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 ${
            boat.instantBook ? "mt-1 sm:mt-2" : ""
          } ${
            needsAuth
              ? "text-primary border-primary hover:bg-primary hover:text-white"
              : "text-primary border-primary hover:bg-primary hover:text-white"
          } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm sm:text-base">Processing...</span>
            </div>
          ) : needsAuth ? (
            "Sign in to send request"
          ) : (
            "Send Booking Request"
          )}
        </Button>

        {/* Terms and Privacy */}
        {user && (
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4 px-2">
            By submitting your booking you agree to the{" "}
            <span className="text-primary underline hover:no-underline cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-primary underline hover:no-underline cursor-pointer">
              Privacy Policy
            </span>
            . Message & data rates may apply. You can opt out of receiving text messages at any time
            in your account settings or by replying STOP.
          </p>
        )}
      </div>
    </div>
  );
}
