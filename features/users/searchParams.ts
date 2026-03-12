import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { userStatusEnum } from "@/database/schema";

/**
 * Shared search params config for users page.
 * Used by both Server Component (createSearchParamsCache) and Client (useQueryStates).
 * Single source of truth - no duplication between page and filters.
 */
export const userSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(userStatusEnum.enumValues),
  isAdmin: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const userSearchParamsCache = createSearchParamsCache(userSearchParams);

export const serializeUserParams = createSerializer(userSearchParams);
