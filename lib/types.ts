import { boatCategoryEnum } from "@/database/schema";
import { z } from "zod";

export interface Boat {
  id: string;
  ownerId: string;
  ownerEmail?: string | null;
  name: string;
  displayTitle?: string | null;
  category: typeof boatCategoryEnum.enumValues[number];
  make?: string | null;
  model?: string | null;
  yearBuilt?: number | null;
  lengthFt: number;
  numOfPassengers: number;
  numOfCabins?: number | null;
  numOfBathrooms?: number | null;
  numOfShowers?: number | null;
  sleepsNum?: number | null;
  beam?: number | null;
  draft?: number | null;
  grossTonnage?: number | null;
  cruisingSpeed?: number | null;
  maxSpeed?: number | null;
  range?: number | null;
  description?: string | null;
  features: string[];
  specialInstructions?: string | null;
  parkingNotes?: string | null;
  instructionsAndRules?: string | null;
  dockInfo?: string | null;
  notes?: string | null;
  primaryPhoto?: string | null;
  primaryPhotoAbsPath?: string | null;
  galleryPhotos?: string[] | null;
  virtualTourUrl?: string | null;
  youtubeLink?: string | null;
  hourlyRate: number;
  halfDayPrice?: number | null;
  fullDayPrice?: number | null;
  weeklyRate?: number | null;
  monthlyRate?: number | null;
  seasonalRates?: unknown;
  additionalHours?: number | null;
  depositAmount?: number | null;
  cashValue?: number | null;
  homePort?: string | null;
  currentLocation?: string | null;
  availableDestinations?: string[] | null;
  seasonalLocations?: unknown;
  status: string;
  active: boolean;
  featured?: boolean | null;
  featuredOrder?: number | null;
  listBoat: boolean;
  crewRequired: boolean;
  crewIncluded: boolean;
  crewNum?: number | null;
  primaryCaptainId?: string | null;
  dayCharter: boolean;
  termCharter: boolean;
  minimumCharterDays?: number | null;
  preferredCharterDuration?: string | null;
  fuelIncluded: boolean;
  fuelBillingRate?: number | null;
  fuelReimbursementRate?: number | null;
  fuelPayeeType?: string | null;
  fuelCapacity?: number | null;
  waterCapacity?: number | null;
  hullId?: string | null;
  registrationNumber?: string | null;
  flagState?: string | null;
  classificationSociety?: string | null;
  insurancePhoto?: string | null;
  insurancePhotoAbsPath?: string | null;
  insuranceExpiryDate?: Date | null;
  lastSurveyDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastMaintenanceDate?: Date | null;
  nextMaintenanceDate?: Date | null;
}

/**
 * Represents the seasonal rates for a boat
 * @example
 * {
 *   "summer": { "weekday": 1000, "weekend": 1200 },
 *   "winter": { "weekday": 800, "weekend": 1000 }
 * }
 */
export const seasonalRatesSchema = z.record(
  z.string(),
  z.object({
    weekday: z.number(),
    weekend: z.number(),
  })
);

export type SeasonalRates = z.infer<typeof seasonalRatesSchema>;

/**
 * Represents the seasonal locations for a boat
 * @example
 * {
 *   "summer": { "marina": "Marina A", "city": "City A" },
 *   "winter": { "marina": "Marina B", "city": "City B" }
 * }
 */
export const seasonalLocationsSchema = z.record(
  z.string(),
  z.object({
    marina: z.string(),
    city: z.string(),
  })
);

export type SeasonalLocations = z.infer<typeof seasonalLocationsSchema>;

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Re-export booking types for convenience
export type { BookingRequest } from "./validations"; 