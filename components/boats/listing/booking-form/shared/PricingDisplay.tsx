"use client";

import { Boat } from "@/lib/types/types";
import { formatCurrency } from "@/lib/utils/general-utils";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface PricingDisplayProps {
  boat: Boat;
  control: Control<BookingRequest>;
  selectedPricingTier?: any;
}

export function PricingDisplay({ boat, control, selectedPricingTier }: PricingDisplayProps) {
  // Filter and sort pricing tiers once
  const activeTiers = boat.pricingTiers
    ?.filter(tier => tier.isActive)
    .sort((a, b) => a.hours - b.hours) || [];

  if (activeTiers.length === 0) {
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
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full border border-gray-300 rounded-lg p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                                  <Clock className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPricingTier ? `${selectedPricingTier.hours}hr Charter` : "Select Duration"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedPricingTier ? selectedPricingTier.name || "Standard" : "Choose your charter length"}
                  </div>
                </div>
                {selectedPricingTier && (
                  <div className="text-right mr-3">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(selectedPricingTier.price)}
                    </div>
                    <div className="text-xs text-gray-500">plus fees</div>
                  </div>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              {activeTiers.map(tier => (
                <SelectItem key={tier.id} value={tier.id} className="p-3">
                  <div className="flex items-center justify-between w-full">
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
                    <div className="text-right ml-4">
                      <div className="font-bold text-primary">
                        {formatCurrency(tier.price)}
                      </div>
                      <div className="text-xs text-gray-500">plus fees</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 