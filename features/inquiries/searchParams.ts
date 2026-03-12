import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";
import { inquiryStageEnum, inquiryOutcomeEnum } from "@/database/schema";

/**
 * Shared search params config for inquiries page.
 * Used by both Server Component (createSearchParamsCache) and Client (useQueryStates).
 */
export const inquirySearchParams = {
  stage: parseAsStringEnum(inquiryStageEnum.enumValues),
  outcome: parseAsStringEnum(inquiryOutcomeEnum.enumValues),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const inquirySearchParamsCache = createSearchParamsCache(inquirySearchParams);

export const serializeInquiryParams = createSerializer(inquirySearchParams);
