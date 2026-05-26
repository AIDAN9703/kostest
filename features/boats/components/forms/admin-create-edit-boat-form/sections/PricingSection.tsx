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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PricingTiers } from "@/features/boats/components/forms/PricingTiers";
import { NumberInput } from "@/features/boats/components/forms/FormHelpers";
import {
  CURRENCY_LABELS,
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
  normalizeCurrency,
} from "@/shared/lib/constants/currencies";

export function PricingSection() {
  const form = useFormContext();
  const watchedCurrency = form.watch("currency");
  const currency = normalizeCurrency(watchedCurrency);
  const symbol = getCurrencySymbol(currency);
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
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? "USD"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {CURRENCY_LABELS[code]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                All tier prices, deposits, fees, and Stripe charges for this
                boat use this currency. Pick the local currency where the boat
                operates (e.g. EUR for Greece).
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="pricingTiers" render={({ field }) => (
          <FormItem>
            <PricingTiers
              tiers={field.value || []}
              onChange={field.onChange}
              currency={currency}
            />
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Additional Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput
              name="depositAmount"
              label={`Security Deposit (${symbol})`}
              placeholder="Security deposit amount"
              defaultToZero
            />
            <NumberInput
              name="cleaningFee"
              label={`Cleaning Fee (${symbol})`}
              placeholder="Cleaning fee"
              defaultToZero
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


