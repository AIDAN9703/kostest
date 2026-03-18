import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import {
  bookingStatusEnum,
  bookingTypeEnum,
} from "@/database/schema";
import { PAYMENT_DISPLAY_STATUSES } from "@/shared/lib/utils/payment-display";

/**
 * Shared search params config for bookings page.
 * Uses database enums as single source of truth (matches booking.validation).
 * Used by both Server Component (createSearchParamsCache) and Client (useQueryStates).
 */
export const bookingSearchParams = {
  search: parseAsString.withDefault(""),
  bookingStatus: parseAsStringEnum(bookingStatusEnum.enumValues),
  paymentStatus: parseAsStringEnum([...PAYMENT_DISPLAY_STATUSES]),
  bookingType: parseAsStringEnum(bookingTypeEnum.enumValues),
  dateFrom: parseAsString,
  dateTo: parseAsString,
  needsCaptain: parseAsBoolean,
  minAmount: parseAsInteger,
  maxAmount: parseAsInteger,
  assignedAdminId: parseAsString,
  bookingGroupId: parseAsString,
  showOps: parseAsBoolean.withDefault(false),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const bookingSearchParamsCache =
  createSearchParamsCache(bookingSearchParams);

export const serializeBookingParams = createSerializer(bookingSearchParams);
