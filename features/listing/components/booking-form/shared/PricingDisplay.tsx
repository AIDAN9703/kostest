"use client";

import { useState } from "react";
import { PricingTier } from "@/shared/lib/types/types";
import { cn, formatCurrency } from "@/shared/lib/utils/general-utils";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { Timer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";

interface PricingDisplayProps {
  activeTiers: PricingTier[];
  control: Control<BookingRequest>;
  selectedPricingTier?: PricingTier | null;
}

export function PricingDisplay({ activeTiers, control, selectedPricingTier }: PricingDisplayProps) {
  const [open, setOpen] = useState(false);

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
          <Select onValueChange={field.onChange} value={field.value} open={open} onOpenChange={setOpen}>
            <SelectTrigger className="w-full border-0 border-b border-gray-100 bg-transparent rounded-none p-4 h-auto focus:outline-hidden focus:ring-0 focus-visible:ring-0 ring-0 ring-offset-0 focus:ring-offset-0 shadow-none hover:bg-transparent [&>svg:last-child]:hidden">
              <div className="flex items-center gap-3 w-full cursor-pointer">
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-primary">
                    {selectedPricingTier ? `${selectedPricingTier.hours}hr Charter` : "Select Duration"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedPricingTier ? selectedPricingTier.name || "Standard" : "Choose your charter length"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Timer className={cn("h-5 w-5 text-primary transition-transform", open && "rotate-180")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-3xl shadow-none p-2">
               {activeTiers.map(tier => (
                 <SelectItem key={tier.id} value={tier.id} className="p-4 hover:bg-gray-50">
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