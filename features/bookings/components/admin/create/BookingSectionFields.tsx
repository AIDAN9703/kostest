"use client";

import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import { BoatSelect } from "@/features/boats/components/BoatSelect";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import type { BoatForAdminSelect } from "@/features/boats/boat.types";
import type { BookingSectionData, PricingTierOption } from "./types";

interface BookingSectionFieldsProps {
  section: BookingSectionData;
  onChange: (updates: Partial<BookingSectionData>) => void;
  pricingTiers: PricingTierOption[];
  tiersByBoat: Record<string, PricingTierOption[]>;
  /** For group form: show "same dates" checkbox */
  showSameDatesOption?: boolean;
  sameAsFirstBooking?: boolean;
  onSameDatesChange?: (checked: boolean) => void;
  /** When true, dates come from parent */
  useSharedDates?: boolean;
  sharedStartDateTime?: string;
  sharedEndDateTime?: string;
  onSharedStartChange?: (v: string) => void;
  onSharedEndChange?: (v: string) => void;
  index?: number;
}

export function BookingSectionFields({
  section,
  onChange,
  pricingTiers,
  tiersByBoat,
  showSameDatesOption = false,
  sameAsFirstBooking = false,
  onSameDatesChange,
  useSharedDates = false,
  sharedStartDateTime = "",
  sharedEndDateTime = "",
  onSharedStartChange,
  onSharedEndChange,
  index = 0,
}: BookingSectionFieldsProps) {
  const startDateTime = useSharedDates ? sharedStartDateTime : section.startDateTime;
  const endDateTime = useSharedDates ? sharedEndDateTime : section.endDateTime;
  const setStartDateTime = (v: string) =>
    useSharedDates ? onSharedStartChange?.(v) : onChange({ startDateTime: v });
  const setEndDateTime = (v: string) =>
    useSharedDates ? onSharedEndChange?.(v) : onChange({ endDateTime: v });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Boat *</Label>
        <BoatSelect
          value={section.boatId}
          selectedBoat={section.boat}
          onChange={(boatId, boat) => {
            const tiers = tiersByBoat[boatId] || [];
            const defaultTier = tiers.find((t) => t.isDefault) ?? tiers[0];
            onChange({
              boatId,
              boat: boat ?? undefined,
              pricingTierId: section.usePricingTier ? defaultTier?.id ?? "" : "",
              basePrice: section.usePricingTier ? (defaultTier?.price ?? 0) : section.basePrice,
              depositAmount: boat?.depositAmount ?? null,
            });
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`use-tier-${index}`}
          checked={section.usePricingTier}
          onCheckedChange={(checked) => {
            const useTier = !!checked;
            const tiers = tiersByBoat[section.boatId] || [];
            const defaultTier = tiers.find((t) => t.isDefault) ?? tiers[0];
            onChange({
              usePricingTier: useTier,
              pricingTierId: useTier ? (defaultTier?.id ?? "") : "",
              basePrice: useTier ? (defaultTier?.price ?? 0) : section.basePrice,
            });
          }}
        />
        <Label htmlFor={`use-tier-${index}`} className="text-sm font-normal cursor-pointer">
          Use pricing tier
        </Label>
      </div>

      {section.usePricingTier ? (
        <div className="space-y-2">
          <Label>Pricing Tier</Label>
          <Select
            value={section.pricingTierId}
            onValueChange={(tierId) => {
              const tier = pricingTiers.find((t) => t.id === tierId);
              onChange({
                pricingTierId: tierId,
                basePrice: tier?.price ?? section.basePrice,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {(tiersByBoat[section.boatId] || []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name || `${t.hours} hrs`} · {formatCurrency(t.price)}
                </SelectItem>
              ))}
              {(!section.boatId || (tiersByBoat[section.boatId]?.length ?? 0) === 0) && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Select boat first
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Base Price ($) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 450"
            value={section.basePrice || ""}
            onChange={(e) => onChange({ basePrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Deposit ($)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder={section.boat?.depositAmount != null ? `Default: ${section.boat.depositAmount}` : "Optional"}
          value={section.depositAmount != null && section.depositAmount > 0 ? section.depositAmount : ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange({ depositAmount: v === "" ? null : parseFloat(v) || 0 });
          }}
        />
        <p className="text-xs text-muted-foreground">
          {section.boat?.depositAmount != null
            ? `Boat default: ${formatCurrency(section.boat.depositAmount)}. Leave empty to use default.`
            : "Optional. Override the boat default if needed."}
        </p>
      </div>

      {showSameDatesOption && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`same-dates-${index}`}
            checked={sameAsFirstBooking}
            onCheckedChange={(c) => onSameDatesChange?.(!!c)}
          />
          <Label htmlFor={`same-dates-${index}`} className="text-sm font-normal cursor-pointer">
            Use same dates & times as first booking
          </Label>
        </div>
      )}

      {(!showSameDatesOption || !sameAsFirstBooking) && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Start Date & Time *</Label>
            <DateTimePicker
              value={startDateTime}
              onChange={setStartDateTime}
              placeholder="Select start"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>End Date & Time{!section.usePricingTier && " *"}</Label>
            <DateTimePicker
              value={endDateTime}
              onChange={setEndDateTime}
              placeholder={
                section.usePricingTier
                  ? "Optional (uses tier duration)"
                  : "Required for custom pricing"
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
