import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { inquiryStageEnum, inquiryOutcomeEnum } from "@/database/schema";
import { ADMIN_LIST_DEFAULT_PAGE_SIZE } from "@/shared/admin/list-pagination";

/**
 * Shared search params config for inquiries page.
 * Used by both Server Component (createSearchParamsCache) and Client (useQueryStates).
 */
export const inquirySearchParams = {
  search: parseAsString.withDefault(""),
  stage: parseAsStringEnum(inquiryStageEnum.enumValues),
  outcome: parseAsStringEnum(inquiryOutcomeEnum.enumValues),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(ADMIN_LIST_DEFAULT_PAGE_SIZE),
};

export const inquirySearchParamsCache = createSearchParamsCache(inquirySearchParams);
