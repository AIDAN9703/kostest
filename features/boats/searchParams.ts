import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { boatCategoryEnum } from "@/database/schema";
import { ADMIN_LIST_DEFAULT_PAGE_SIZE } from "@/shared/admin/list-pagination";

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
  limit: parseAsInteger.withDefault(ADMIN_LIST_DEFAULT_PAGE_SIZE),
};

export const boatSearchParamsCache = createSearchParamsCache(boatSearchParams);
