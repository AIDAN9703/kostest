"use client";

import { useFormContext } from "react-hook-form";
import { PackagePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { normalizeCurrency } from "@/shared/lib/constants/currencies";
import { BoatAddOns } from "@/features/boats/components/forms/BoatAddOns";
import type { AddOnListItem } from "@/features/add-ons/add-on.types";

export function BoatAddOnsSection({ availableAddOns }: { availableAddOns: AddOnListItem[] }) {
  const form = useFormContext();
  const currency = normalizeCurrency(form.watch("currency"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PackagePlus className="h-4 w-4" />
          Add-ons offered
        </CardTitle>
        <CardDescription>
          Choose which catalog add-ons this boat offers. Override the price per boat, or mark one
          complimentary (free/included).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="boatAddOns"
          render={({ field }) => (
            <FormItem>
              <BoatAddOns
                value={field.value || []}
                onChange={field.onChange}
                availableAddOns={availableAddOns}
                currency={currency}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
