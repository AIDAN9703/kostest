"use client";

import { User } from "next-auth";
import { PricingTier } from "@/shared/types/types";
import { BookingRequest } from "@/features/_validation/validations";

// Safe boat data interface - only includes necessary and safe properties
interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
  locationLabel: string | null;
}
import { formatCurrency } from "@/shared/utils/general-utils";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, MessageSquare, Loader2 } from "lucide-react";

interface BookingSummaryProps {
  boat: SafeBoatData;
  bookingData: BookingRequest & { boat: SafeBoatData; selectedTier: PricingTier };
  selectedTier: PricingTier;
  user?: User;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function BookingSummary({ 
  boat, 
  bookingData, 
  selectedTier, 
  user, 
  isSubmitting, 
  onSubmit 
}: BookingSummaryProps) {
  if (!selectedTier) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <p className="text-slate-500 text-center">No pricing tier selected</p>
      </div>
    );
  }

  const basePrice = selectedTier.price;
  const cleaningFee = boat.cleaningFee || 0;
  const captainFee = 0; // Captain service included
  const subtotal = basePrice + cleaningFee;
  const taxAmount = subtotal * 0.08; // 8% tax
  const totalPrice = subtotal + taxAmount;
  
  const tierName = selectedTier.name || `${selectedTier.hours}hr Charter`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Charter summary</h3>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 space-y-5">
        <div className="space-y-4">
          {/* Base Price */}
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">{tierName}</span>
            <span className="font-semibold text-slate-900">{formatCurrency(basePrice)}</span>
          </div>
          
          {/* Captain Service */}
          <div className="flex justify-between items-center">
            <span className="text-slate-700">Captain Service</span>
            <span className="font-medium text-emerald-600">Included</span>
          </div>
          
          {/* Cleaning Fee */}
          {cleaningFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Cleaning Fee</span>
              <span className="font-semibold text-slate-900">{formatCurrency(cleaningFee)}</span>
            </div>
          )}
        </div>
        
        {/* Subtotal and Tax */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-700">Subtotal</span>
            <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-700">Tax (8%)</span>
            <span className="font-semibold text-slate-900">{formatCurrency(taxAmount)}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="pt-4 border-t border-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Request Disclaimer */}
        {!boat.instantBook && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800 font-medium text-center">
              No payment required - this is a request for availability
            </div>
          </div>
        )}

        {/* Instant Book Notice */}
        {boat.instantBook && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="text-sm text-emerald-800 font-medium text-center">
              Payment will be processed immediately upon confirmation
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="p-6 pt-0">
        <Button 
          onClick={onSubmit}
          disabled={!user || isSubmitting}
          className={`w-full h-12 font-semibold text-white transition-all duration-200 rounded-lg ${
            boat.instantBook 
              ? 'bg-primary hover:bg-primary/90 disabled:bg-primary/50' 
              : 'bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400'
          } disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : !user ? (
            "Sign in to continue"
          ) : (
            <div className="flex items-center gap-2">
              {boat.instantBook ? (
                <>
                  Book instantly
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Submit request
                </>
              )}
            </div>
          )}
        </Button>

        {!user && (
          <p className="text-xs text-slate-500 text-center mt-3">
            Please sign in above to complete your booking
          </p>
        )}
      </div>
    </div>
  );
} 