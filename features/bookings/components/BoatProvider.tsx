"use client";

import React, { createContext, useContext } from "react";
import { Boat } from "@/shared/lib/types/types";

interface BoatProviderProps {
  boat: Boat;
  children: React.ReactNode;
}

const BoatContext = createContext<Boat | null>(null);

export default function BoatProvider({ boat, children }: BoatProviderProps) {
  return <BoatContext.Provider value={boat}>{children}</BoatContext.Provider>;
}

export function useBoat(): Boat {
  const ctx = useContext(BoatContext);
  if (!ctx) {
    throw new Error("useBoat must be used within BoatProvider");
  }
  return ctx;
}
