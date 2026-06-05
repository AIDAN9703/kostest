/**
 * lib/search-params.ts
 * A unified module for handling search parameters in both client and server contexts
 */

import { SearchParamsType } from "@/shared/lib/types/types";

/**
 * Parse string or string[] params to a typed value
 */
export function parseStringParam(param: string | string[] | undefined | null): string | null {
  if (param === undefined || param === null) return null;
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Parse string or string[] params to a number
 */
export function parseNumberParam(param: string | string[] | undefined | null): number | null {
  const stringValue = parseStringParam(param);
  if (stringValue === null) return null;
  
  const num = Number(stringValue);
  return isNaN(num) ? null : num;
}

/**
 * Parse comma-separated string or string[] params to string array
 */
export function parseArrayParam(param: string | string[] | undefined | null): string[] {
  if (param === undefined || param === null) return [];
  
  // If it's already an array, return it
  if (Array.isArray(param)) return param;
  
  // Otherwise split by comma
  return param.split(',').filter(Boolean);
}

/**
 * Extract map bounding box from search parameters
 */
export function extractBoundingBox(params: Record<string, string | string[] | undefined>) {
  const ne_lat = parseNumberParam(params.ne_lat);
  const ne_lng = parseNumberParam(params.ne_lng);
  const sw_lat = parseNumberParam(params.sw_lat);
  const sw_lng = parseNumberParam(params.sw_lng);
  
  if (ne_lat !== null && ne_lng !== null && sw_lat !== null && sw_lng !== null) {
    return {
      ne: { lat: ne_lat, lng: ne_lng },
      sw: { lat: sw_lat, lng: sw_lng }
    };
  }
  
  return undefined;
}

/**
 * Normalize search parameters to a structured object
 * Can be used in server components
 */
export function normalizeSearchParams(
  params: Record<string, string | string[] | undefined>
): SearchParamsType {
  // Create a sanitized object
  const normalizedParams: SearchParamsType = {};
  
  // Copy values, filtering out undefined
  for(const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      normalizedParams[key as keyof SearchParamsType] = value;
    }
  }
  
  return normalizedParams;
}