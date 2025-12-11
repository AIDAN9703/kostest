import { boatCategoryEnum } from "@/database/schema";
import { SupportedTimezones } from "../utils/date-helpers";

// Location data for map and search
export interface LocationData {
  formatted_address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  viewport?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
  bounds?: {
    ne_lat: number;
    ne_lng: number;
    sw_lat: number;
    sw_lng: number;
  };
  place_id: string;
  name: string;
  raw: google.maps.places.PlaceResult;
  isValid: boolean;
}


// Define the Pricing Tier type separately for clarity
export interface PricingTier {
  id: string;
  boatId: string;
  hours: number;
  price: number;
  name?: string | null;
  description?: string | null;
  isActive: boolean;
  isDefault?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
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
  cancellationPolicy?: string | null;
  timezone?: SupportedTimezones | null;
  
  // Pricing tiers - comes from a join/separate query (not in the boats table)
  pricingTiers?: PricingTier[];
  
  // Deprecated fields that may still appear in some data
  hourlyRate?: number;
  homePort?: string;
  currentLocation?: string;
  
  halfDayPrice?: number | null;
  fullDayPrice?: number | null;
  weeklyRate?: number | null;
  monthlyRate?: number | null;
  cleaningFee?: number | null;
  taxRate?: number | null;
  depositAmount?: number | null;
  locationLabel?: string | null;
  availableDestinations?: string[] | null;
  active: boolean;
  featured?: boolean | null;
  featuredOrder?: number | null;
  searchRankingScore?: number | null;
  crewRequired: boolean;
  crewIncluded: boolean;
  crewSize?: number | null;
  primaryCaptainId?: string | null;
  dayCharter: boolean;
  termCharter: boolean;
  minimumCharterDays?: number | null;
  minRentalHours?: number | null;
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
  // Rating and reviews data
  averageRating?: number | null;
  totalReviews?: number | null;
  // Booking options
  instantBook: boolean;
  basePrice?: number | null;
  ownerName?: string;
  
  // Location coordinates for map display - runtime property from SQL query
  locationCoordinates?: {
    lat: number;
    lng: number;
  } | null;
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


export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}; 
