"use client";

import { useFormContext } from "react-hook-form";
import { DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { PricingTiers } from "@/features/boats/components/forms/PricingTiers";
import { NumberInput } from "@/features/boats/components/forms/FormHelpers";

export function PricingSection() {
  const form = useFormContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-4 w-4" />
          Pricing
        </CardTitle>
        <CardDescription>Rental rates, fees, and additional pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField control={form.control} name="pricingTiers" render={({ field }) => (
          <FormItem>
            <PricingTiers tiers={field.value || []} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Additional Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput name="depositAmount" label="Security Deposit ($)" placeholder="Security deposit amount" defaultToZero />
            <NumberInput name="cleaningFee" label="Cleaning Fee ($)" placeholder="Cleaning fee" defaultToZero />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


