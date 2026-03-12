import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { boatCategoryEnum } from "@/database/schema";

/**
 * Shared search params config for boats page.
 * Used by both Server Component (createSearchParamsCache) and Client (useQueryStates).
 */
export const boatSearchParams = {
  search: parseAsString.withDefault(""),
  category: parseAsStringEnum(boatCategoryEnum.enumValues),
  featured: parseAsBoolean,
  active: parseAsBoolean,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  minLength: parseAsInteger,
  maxLength: parseAsInteger,
  minCapacity: parseAsInteger,
  maxCapacity: parseAsInteger,
  minYear: parseAsInteger,
  maxYear: parseAsInteger,
  minSleeps: parseAsInteger,
  minBathrooms: parseAsInteger,
  locationLabel: parseAsString,
  crewRequired: parseAsBoolean,
  instantBook: parseAsBoolean,
  dayCharter: parseAsBoolean,
  termCharter: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const boatSearchParamsCache = createSearchParamsCache(boatSearchParams);

export const serializeBoatParams = createSerializer(boatSearchParams);
