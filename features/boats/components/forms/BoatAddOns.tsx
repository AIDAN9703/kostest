"use client";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils/general-utils";
import { getCurrencySymbol } from "@/shared/lib/constants/currencies";
import { centsToDollars, dollarsToCents } from "@/shared/lib/utils/money-utils";
import { addOnCategoryLabel } from "@/features/add-ons/add-on.constants";
import type { AddOnListItem } from "@/features/add-ons/add-on.types";
import type { BoatAddOnAssignmentInput } from "@/features/boats/boat.validation";

interface BoatAddOnsProps {
  value: BoatAddOnAssignmentInput[];
  onChange: (next: BoatAddOnAssignmentInput[]) => void;
  availableAddOns: AddOnListItem[];
  currency?: string;
}

export function BoatAddOns({ value = [], onChange, availableAddOns, currency = "USD" }: BoatAddOnsProps) {
  const symbol = getCurrencySymbol(currency);

  if (availableAddOns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        No catalog add-ons yet. Create them under <span className="font-medium">Admin → Add-ons</span>,
        then choose which this boat offers here.
      </div>
    );
  }

  const findAssignment = (addOnId: string) => value.find((v) => v.addOnId === addOnId);

  const toggleOffer = (addOn: AddOnListItem, offered: boolean) => {
    if (offered) {
      onChange([
        ...value,
        { addOnId: addOn.id, priceCents: null, isComplimentary: false, isActive: true },
      ]);
    } else {
      onChange(value.filter((v) => v.addOnId !== addOn.id));
    }
  };

  const patch = (addOnId: string, updates: Partial<BoatAddOnAssignmentInput>) =>
    onChange(value.map((v) => (v.addOnId === addOnId ? { ...v, ...updates } : v)));

  return (
    <div className="space-y-2">
      {availableAddOns.map((addOn) => {
        const assignment = findAssignment(addOn.id);
        const offered = !!assignment;
        const complimentary = assignment?.isComplimentary ?? false;
        const priceDollars =
          assignment?.priceCents != null ? String(centsToDollars(assignment.priceCents)) : "";
        const defaultLabel =
          addOn.defaultPriceCents != null
            ? `Default ${symbol}${centsToDollars(addOn.defaultPriceCents)}`
            : "Set price";

        return (
          <div
            key={addOn.id}
            className={cn(
              "rounded-xl border p-3 transition-colors",
              offered ? "border-primary/40 bg-primary/[0.03]" : "border-border"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`offer-${addOn.id}`}
                checked={offered}
                onCheckedChange={(c) => toggleOffer(addOn, !!c)}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <label htmlFor={`offer-${addOn.id}`} className="flex cursor-pointer items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{addOn.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {addOnCategoryLabel(addOn.category)}
                  </Badge>
                </label>
                {addOn.description && (
                  <p className="truncate text-xs text-muted-foreground">{addOn.description}</p>
                )}

                {offered && (
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{symbol}</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={complimentary}
                        value={complimentary ? "" : priceDollars}
                        placeholder={complimentary ? "Included" : defaultLabel}
                        onChange={(e) =>
                          patch(addOn.id, {
                            priceCents:
                              e.target.value === "" ? null : dollarsToCents(Number(e.target.value)),
                          })
                        }
                        className="h-8 w-32"
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <Switch
                        checked={complimentary}
                        onCheckedChange={(v) =>
                          patch(addOn.id, { isComplimentary: v, ...(v ? { priceCents: null } : {}) })
                        }
                      />
                      Complimentary (included free)
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
