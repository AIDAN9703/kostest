"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingRequestSchema,
  BookingRequest,
} from "@/features/_validation/validations";
import { Boat, PricingTier } from "@/shared/lib/types/types";
import { createDateTimeISO } from "@/shared/lib/utils/date-helpers";

export type BookingBoat = Boat & { pricingTiers?: PricingTier[] | null };

/** Bookable tiers, cheapest-duration first. */
function getActivePricingTiers(boat: BookingBoat): PricingTier[] {
  return (
    boat.pricingTiers?.filter((t) => t.isActive).sort((a, b) => a.hours - b.hours) ?? []
  );
}

/**
 * Booking form state, kept deliberately small.
 *
 * `date` and `time` are plain UI state. The form's `startDateTime` is *derived*
 * from them (combined in the boat's timezone) — there's no pending/commit dance.
 * When either is missing, `startDateTime` is cleared so the form stays invalid.
 */
export function useBookingForm({ boat }: { boat: BookingBoat }) {
  const activeTiers = useMemo(
    () => getActivePricingTiers(boat),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boat.pricingTiers]
  );

  const form = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      startDateTime: "",
      pricingTierId: activeTiers[0]?.id ?? "",
      numberOfPassengers: 1,
      needsCaptain: boat.crewRequired,
    },
    mode: "onChange",
  });

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>("");

  // Derive startDateTime from date + time.
  useEffect(() => {
    const next = date && time ? createDateTimeISO(date, time, boat) : "";
    if (form.getValues("startDateTime") !== next) {
      form.setValue("startDateTime", next, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  const pricingTierId = form.watch("pricingTierId");
  const selectedTier = useMemo<PricingTier | null>(
    () => boat.pricingTiers?.find((t) => t.id === pricingTierId) ?? null,
    [boat.pricingTiers, pricingTierId]
  );

  const isComplete = !!(date && time && selectedTier);
  const isValid = form.formState.isValid && isComplete;

  return {
    form,
    activeTiers,
    date,
    setDate,
    time,
    setTime,
    selectedTier,
    isComplete,
    isValid,
  };
}
