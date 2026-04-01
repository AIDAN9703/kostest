import {
  createSearchParamsCache,
  createSerializer,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

const SORT_VALUES = ["date-desc", "date-asc", "amount-desc"];
const TYPE_VALUES = ["all", "booking", "inquiry"];

/**
 * Admin → All page: filters + sort (URL-synced via nuqs).
 */
/** `yyyy-MM-dd` from `<input type="date">`; empty = no bound */
export const adminAllSearchParams = {
  q: parseAsString.withDefault(""),
  type: parseAsStringEnum(TYPE_VALUES).withDefault("all"),
  sort: parseAsStringEnum(SORT_VALUES).withDefault("date-desc"),
  dateFrom: parseAsString.withDefault(""),
  dateTo: parseAsString.withDefault(""),
};

export const adminAllSearchParamsCache = createSearchParamsCache(adminAllSearchParams);

export const serializeAdminAllParams = createSerializer(adminAllSearchParams);
