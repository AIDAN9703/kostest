"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { updateBookingSingleField } from "@/features/bookings/booking.mutations";
import type {
  BookingSingleEditableField,
  BookingSingleFieldUpdate,
} from "@/features/bookings/booking-single-field-update";

const TOAST_LABELS: Record<BookingSingleEditableField, string> = {
  customerName: "Customer name",
  customerEmail: "Customer email",
  customerPhone: "Customer phone",
  numberOfPassengers: "Passengers",
  needsCaptain: "Captain requested",
  pickupLocation: "Pickup location",
  dropoffLocation: "Drop-off location",
  startDateTime: "Trip start",
  endDateTime: "Trip end",
  boatId: "Boat",
};

export function useBookingSingleFieldEdit(bookingId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeField, setActiveField] = useState<BookingSingleEditableField | null>(null);
  const [draft, setDraft] = useState<unknown>(null);

  function cancelEdit() {
    setActiveField(null);
    setDraft(null);
  }

  function openField(field: BookingSingleEditableField, initialValue: unknown) {
    setActiveField(field);
    setDraft(initialValue);
  }

  function saveField(buildPayload: () => BookingSingleFieldUpdate | null) {
    if (!activeField) return;

    startTransition(async () => {
      try {
        const payload = buildPayload();
        if (!payload) return;

        const result = await updateBookingSingleField(bookingId, payload);
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Could not save",
            description: result.error ?? "Unknown error",
          });
          return;
        }

        toast({ title: "Saved", description: `${TOAST_LABELS[activeField]} updated.` });
        cancelEdit();
        router.refresh();
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: e instanceof Error ? e.message : "Something went wrong",
        });
      }
    });
  }

  return {
    isPending,
    activeField,
    draft,
    setDraft,
    openField,
    cancelEdit,
    saveField,
  };
}
