"use client";

import React, { createContext, useContext } from "react";
import { BoatWithTiers } from "@/features/boats/boat.types";

interface BoatProviderProps {
  boat: BoatWithTiers;
  children: React.ReactNode;
}

const BoatContext = createContext<BoatWithTiers | null>(null);

export default function BoatProvider({ boat, children }: BoatProviderProps) {
  return <BoatContext.Provider value={boat}>{children}</BoatContext.Provider>;
}

export function useBoat(): BoatWithTiers {
  const ctx = useContext(BoatContext);
  if (!ctx) {
    throw new Error("useBoat must be used within BoatProvider");
  }
  return ctx;
}
