"use client";

import { Boat } from "@/lib/types/types";
import { formatCurrency } from "@/lib/utils/general-utils";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";

interface PricingDisplayProps {
  boat: Boat;
  control: Control<BookingRequest>;
  selectedPricingTier?: any;
}

export function PricingDisplay({ boat, control, selectedPricingTier }: PricingDisplayProps) {
  // Filter active pricing tiers and sort by hours
  const activePricingTiers = boat.pricingTiers
    ?.filter(tier => tier.isActive)
    .sort((a, b) => a.hours - b.hours) || [];

  if (activePricingTiers.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pricing options available
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Selected Price Display - Enhanced */}
      {selectedPricingTier && (
        <div className="bg-gradient-to-r from-navy-50 to-blue-50 border border-navy-200 rounded-lg p-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-navy-800">
              {selectedPricingTier.hours}hr • {selectedPricingTier.name || 'Charter'}
            </div>
            <div className="font-bold text-base text-navy-900">
              {formatCurrency(selectedPricingTier.price)}
              <span className="text-xs font-medium text-coral-600 ml-1">+fees</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Selection - Enhanced Dropdown */}
      <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
        <FormField
          control={control}
          name="pricingTierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-1">Duration</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 border-navy-200 text-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-200 bg-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activePricingTiers.map(tier => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.hours}hr - {formatCurrency(tier.price)} {tier.name && `(${tier.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 