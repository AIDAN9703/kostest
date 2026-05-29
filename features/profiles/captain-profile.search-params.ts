import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { captainStatusEnum } from "@/database/schema";

export const captainProfileListSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(captainStatusEnum.enumValues),
};

export const captainProfileListSearchParamsCache = createSearchParamsCache(
  captainProfileListSearchParams
);
