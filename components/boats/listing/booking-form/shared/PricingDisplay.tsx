"use client";

import { useState } from "react";
import { Boat } from "@/lib/types/types";
import { formatCurrency } from "@/lib/utils/general-utils";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";
import { cn } from "@/lib/utils/general-utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Clock, ChevronDown } from "lucide-react";

interface PricingDisplayProps {
  boat: Boat;
  control: Control<BookingRequest>;
  selectedPricingTier?: any;
}

export function PricingDisplay({ boat, control, selectedPricingTier }: PricingDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter active pricing tiers and sort by hours
  const activePricingTiers = boat.pricingTiers
    ?.filter(tier => tier.isActive)
    .sort((a, b) => a.hours - b.hours) || [];

  if (activePricingTiers.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No pricing options available
      </div>
    );
  }

  return (
    <FormField
      control={control}
      name="pricingTierId"
      render={({ field }) => (
        <FormItem>
          {/* Sleek Horizontal Display */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 hover:border-coral-400 focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-coral-500" />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPricingTier ? `${selectedPricingTier.hours}hr Charter` : "Select Duration"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedPricingTier ? selectedPricingTier.name || "Standard" : "Choose your charter length"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedPricingTier && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-coral-600">
                      {formatCurrency(selectedPricingTier.price)}
                    </div>
                    <div className="text-xs text-gray-500">plus fees</div>
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </button>

          {/* Popup Modal */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
                Select Charter Duration
              </DialogTitle>
              <div className="space-y-2">
                {activePricingTiers.map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      field.onChange(tier.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all duration-200",
                      field.value === tier.id
                        ? "border-coral-500 bg-coral-50"
                        : "border-gray-200 hover:border-coral-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {tier.hours}hr Charter
                        </div>
                        {tier.name && (
                          <div className="text-sm text-gray-600">
                            {tier.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-coral-600">
                          {formatCurrency(tier.price)}
                        </div>
                        <div className="text-xs text-gray-500">plus fees</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 