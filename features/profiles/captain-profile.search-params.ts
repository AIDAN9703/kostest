import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { captainStatusEnum } from "@/database/schema";

export const captainProfileListSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(captainStatusEnum.enumValues),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(25),
};

export const captainProfileListSearchParamsCache = createSearchParamsCache(
  captainProfileListSearchParams
);

export const serializeCaptainProfileListParams = createSerializer(
  captainProfileListSearchParams
);
