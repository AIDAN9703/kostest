import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { addOnCategoryEnum } from "@/database/schema";
import { ADMIN_LIST_DEFAULT_PAGE_SIZE } from "@/shared/admin/list-pagination";

export const addOnSearchParams = {
  search: parseAsString.withDefault(""),
  category: parseAsStringEnum(addOnCategoryEnum.enumValues),
  active: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(ADMIN_LIST_DEFAULT_PAGE_SIZE),
};

export const addOnSearchParamsCache = createSearchParamsCache(addOnSearchParams);
