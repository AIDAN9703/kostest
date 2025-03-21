import { boatCategoryEnum } from "@/database/schema";
import { z } from "zod";
import { ProfileFormValues } from "@/lib/validations";
import { LucideIcon } from 'lucide-react';

// User profile types
export type BoatingExperience = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | null;

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  boatingExperience?: BoatingExperience;
  profileImage?: string | null;
  coverImage?: string | null;
  profileCompletionPercentage?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileUpdateResponse {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface Boat {
  id: string;
  ownerId: string;
  ownerEmail?: string | null;
  name: string;
  displayTitle?: string | null;
  category?: typeof boatCategoryEnum.enumValues[number] | null;
  make?: string | null;
  model?: string | null;
  yearBuilt?: number | null;
  lengthFt: number;
  capacity: number;
  cabins?: number | null;
  bathrooms?: number | null;
  showers?: number | null;
  sleeps?: number | null;
  beam?: number | null;
  draft?: number | null;
  weight?: number | null;
  cruisingSpeed?: number | null;
  maxSpeed?: number | null;
  range?: number | null;
  description?: string | null;
  features: string[];
  amenities?: string[] | null;
  safetyEquipment?: string[] | null;
  specialInstructions?: string | null;
  parkingInfo?: string | null;
  rules?: string | null;
  dockInfo?: string | null;
  mainImage?: string | null;
  primaryPhotoAbsPath?: string | null;
  galleryImages?: string[] | null;
  virtualTourUrl?: string | null;
  videoUrl?: string | null;
  hourlyRate: number;
  halfDayPrice?: number | null;
  fullDayPrice?: number | null;
  weeklyRate?: number | null;
  monthlyRate?: number | null;
  seasonalRates?: unknown;
  cleaningFee?: number | null;
  taxRate?: number | null;
  depositAmount?: number | null;
  homePort?: string | null;
  currentLocation?: string | null;
  availableDestinations?: string[] | null;
  seasonalLocations?: unknown;
  active: boolean;
  featured?: boolean | null;
  featuredOrder?: number | null;
  crewRequired: boolean;
  crewIncluded: boolean;
  crewSize?: number | null;
  primaryCaptainId?: string | null;
  dayCharter: boolean;
  termCharter: boolean;
  minimumCharterDays?: number | null;
  fuelIncluded: boolean;
  fuelCapacity?: number | null;
  waterCapacity?: number | null;
  hullId?: string | null;
  registrationNumber?: string | null;
  insuranceInfo?: string | null;
  insuranceExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastMaintenanceDate?: Date | null;
  nextMaintenanceDate?: Date | null;
  maintenanceNotes?: string | null;
  location?: any;
  latitude?: number | null;
  longitude?: number | null;
  listBoat?: boolean;
  primaryPhoto?: string | null;
  galleryPhotos?: string[] | null;
  youtubeLink?: string | null;
  numOfPassengers?: number;
  numOfCabins?: number | null;
  numOfBathrooms?: number | null;
  numOfShowers?: number | null;
  sleepsNum?: number | null;
  grossTonnage?: number | null;
  parkingNotes?: string | null;
  instructionsAndRules?: string | null;
  crewNum?: number | null;
}

// Search params type for filtering boats
export type SearchParamsType = {
  [key: string]: string | string[] | undefined;
  category?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  minLength?: string;
  maxLength?: string;
  passengers?: string;
  location?: string;
  date?: string;
  page?: string;
  sort?: string;
  features?: string | string[];
  amenities?: string | string[];
};

// Location type for map markers
export interface BoatLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  price: number;
  imageUrl?: string;
  // For grouped markers
  count?: number;
  groupedBoats?: BoatLocation[];
}

// Search results type
export interface SearchResults {
  boats: Boat[];
  totalCount: number;
  totalPages: number;
  locations: BoatLocation[];
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
export type { BookingRequest, ProfileFormValues } from "../lib/validations"; 

// Navigation types
export interface NavigationItem {
  href: string;
  label: string;
  children?: Array<NavigationItem | HeaderItem>;
}

export interface HeaderItem {
  type: 'header';
  label: string;
}

export interface QuickLink {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}

export interface FeaturedItem {
  icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
  href: string;
} 