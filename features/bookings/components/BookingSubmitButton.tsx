"use client";

import React from "react";
import Link from "next/link";
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
  return (
    <div className="mt-8">
      <div className="space-y-4">
        {user ? (
          <div>
            {boat.instantBook && (
              <Button
                onClick={() => onSubmit('instant')}
                disabled={isSubmitting}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg rounded-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            )}

            <Button
              onClick={() => onSubmit('request')}
              disabled={isSubmitting}
              variant={boat.instantBook ? "outline" : "default"}
              className={`w-full h-14 font-semibold text-lg rounded-lg ${boat.instantBook ? 'mt-3' : ''} ${
                !boat.instantBook ? 'bg-primary/20 hover:bg-primary/30 text-white' : 'border-2 border-primary text-primary hover:bg-primary/10'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                boat.instantBook ? "Request charter" : "Continue to Payment"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By clicking "Complete charter" you agree to the <span className="text-red-600 underline">Terms of Service</span> and <span className="text-red-600 underline">Privacy Policy</span>. Message & data rates may apply. You can opt out of receiving text messages at any time in your account settings or by replying STOP.
            </p>
          </div>
        ) : (
          <div>
            <Link href="/sign-in" className="w-full block">
              <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg rounded-lg">
                Continue to Payment
              </Button>
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4">
              By clicking "Complete charter" you agree to the <span className="text-red-600 underline">Terms of Service</span> and <span className="text-red-600 underline">Privacy Policy</span>. Message & data rates may apply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
