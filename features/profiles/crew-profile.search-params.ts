import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { crewStatusEnum } from "@/database/schema";

export const crewProfileListSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(crewStatusEnum.enumValues),
};

export const crewProfileListSearchParamsCache = createSearchParamsCache(
  crewProfileListSearchParams
);
