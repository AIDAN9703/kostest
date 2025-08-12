"use client";

import React, { createContext, useContext, PropsWithChildren } from "react";
import { UseFormReturn } from "react-hook-form";
import { Boat } from "@/shared/types/types";
import { BookingRequest } from "@/features/_validation/validations";
import { useBookingFormState } from "./useBookingFormState";

interface BookingFormContextValue extends ReturnType<typeof useBookingFormState> {
  form: UseFormReturn<BookingRequest>;
  boat: Boat;
}

const BookingFormContext = createContext<BookingFormContextValue | null>(null);

export function BookingFormProvider({
  form,
  boat,
  children,
}: PropsWithChildren<{ form: UseFormReturn<BookingRequest>; boat: Boat }>) {
  const state = useBookingFormState({ form, boat });
  const value: BookingFormContextValue = { ...state, form, boat };
  return (
    <BookingFormContext.Provider value={value}>{children}</BookingFormContext.Provider>
  );
}

export function useBookingForm() {
  const ctx = useContext(BookingFormContext);
  if (!ctx) throw new Error("useBookingForm must be used within BookingFormProvider");
  return ctx;
}


