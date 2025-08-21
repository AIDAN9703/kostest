"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { PricingTiers } from "@/features-admin/boats/components/forms/PricingTiers";
import { NumberInput } from "@/features-admin/boats/components/forms/FormHelpers";

export function PricingSection() {
  const form = useFormContext();
  return (
    <div className="p-8 border-b border-gray-200">
      <div className="space-y-8">
        <div className="space-y-4">
          <FormField control={form.control} name="pricingTiers" render={({ field }) => (
            <FormItem>
              <PricingTiers tiers={field.value || []} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Additional Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput name="depositAmount" label="Security Deposit ($)" placeholder="Security deposit amount" defaultToZero />
            <NumberInput name="cleaningFee" label="Cleaning Fee ($)" placeholder="Cleaning fee" defaultToZero />
          </div>
        </div>
      </div>
    </div>
  );
}


