import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { postCategoryEnum, postStatusEnum } from "@/database/schema";

/**
 * Shared search params config for blog page.
 * Uses database enums as single source of truth.
 * Used by both Server Component (createSearchParamsCache) and Client (useQueryStates).
 */
export const blogSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(postStatusEnum.enumValues),
  category: parseAsStringEnum(postCategoryEnum.enumValues),
  featured: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const blogSearchParamsCache = createSearchParamsCache(blogSearchParams);

export const serializeBlogParams = createSerializer(blogSearchParams);
