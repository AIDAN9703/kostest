import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { crewStatusEnum } from "@/database/schema";

export const crewProfileListSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(crewStatusEnum.enumValues),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(25),
};

export const crewProfileListSearchParamsCache = createSearchParamsCache(
  crewProfileListSearchParams
);

export const serializeCrewProfileListParams = createSerializer(
  crewProfileListSearchParams
);
