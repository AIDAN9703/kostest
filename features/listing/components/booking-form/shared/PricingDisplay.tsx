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
import type { BookingPickerLayout } from "./booking-picker-layout";

interface PricingDisplayProps {
  activeTiers: PricingTier[];
  control: Control<BookingRequest>;
  selectedPricingTier?: PricingTier | null;
  layout?: BookingPickerLayout;
  /** ISO 4217 currency from the boat (e.g. "USD", "EUR"). Falls back to USD. */
  currency?: string;
}

export function PricingDisplay({
  activeTiers,
  control,
  selectedPricingTier,
  layout = "popover",
  currency = "USD",
}: PricingDisplayProps) {
  const [open, setOpen] = useState(false);

  if (activeTiers.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">No pricing options available</div>
    );
  }

  return (
    <FormField
      control={control}
      name="pricingTierId"
      render={({ field }) => (
        <FormItem>
          {layout === "inline" ? (
            <div className="border-b border-gray-100 p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </div>
              <div className="flex flex-col gap-2">
                {activeTiers.map((tier) => {
                  const selected = field.value === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => field.onChange(tier.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80"
                      )}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{tier.hours}hr charter</div>
                        {tier.name ? (
                          <div className="text-sm text-gray-600">{tier.name}</div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(tier.price, currency)}</div>
                        <div className="text-xs text-gray-500">plus fees</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <Select onValueChange={field.onChange} value={field.value} open={open} onOpenChange={setOpen}>
              <SelectTrigger className="h-auto w-full rounded-none border-0 border-b border-gray-100 bg-transparent p-4 shadow-none ring-0 ring-offset-0 hover:bg-transparent focus:outline-hidden focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 [&>svg:last-child]:hidden">
                <div className="flex w-full cursor-pointer items-center gap-3">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-sm font-semibold text-primary">
                      {selectedPricingTier
                        ? `${selectedPricingTier.hours}hr Charter`
                        : "Select Duration"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedPricingTier
                        ? selectedPricingTier.name || "Standard"
                        : "Choose your charter length"}
                    </div>
                  </div>
                  <Timer
                    className={cn("h-5 w-5 shrink-0 text-primary transition-transform", open && "rotate-180")}
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-3xl p-2 shadow-none">
                {activeTiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id} className="p-4 hover:bg-gray-50">
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{tier.hours}hr Charter</div>
                        {tier.name ? <div className="text-sm text-gray-600">{tier.name}</div> : null}
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-bold text-primary">{formatCurrency(tier.price, currency)}</div>
                        <div className="text-xs text-gray-500">plus fees</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
