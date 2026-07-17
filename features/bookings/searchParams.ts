import {
  createSearchParamsCache,
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
import { ADMIN_LIST_DEFAULT_PAGE_SIZE } from "@/shared/admin/list-pagination";

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
  /** Ownership scope: null = all, "mine" = assigned to me, "unassigned" = nobody's yet. */
  scope: parseAsStringEnum(["mine", "unassigned"] as const),
  /** Trip-date scope: null = all, "upcoming" = starts today or later, "past" = already started. */
  time: parseAsStringEnum(["upcoming", "past"] as const),
  /** Layout for the bookings page — "table" (default) or "calendar". */
  view: parseAsStringEnum(["table", "calendar"] as const).withDefault("table"),
  /** Opens the new booking modal when true (e.g. from dashboard or quick actions). */
  newBooking: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(ADMIN_LIST_DEFAULT_PAGE_SIZE),
};

export const bookingSearchParamsCache =
  createSearchParamsCache(bookingSearchParams);
