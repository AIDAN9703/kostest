'use client';

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { 
  parseStringParam, 
  parseNumberParam, 
  parseBooleanParam, 
  parseArrayParam,
  createSearchQueryString
} from "@/shared/utils/search-params-utils";

type ParamValue = string | number | boolean | null | undefined;

/**
 * Custom hook for managing URL search parameters in a consistent way
 * @returns Functions and state for managing URL search parameters
 */
export function useSearchURL() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * Updates the URL with new search parameters while preserving existing ones
   */
  const updateSearchParams = useCallback(
    (params: Record<string, ParamValue>) => {
      startTransition(() => {
        // Create a new URLSearchParams instance with all current parameters
        const newSearchParams = new URLSearchParams(searchParams.toString());
        
        // Update or remove each parameter
        Object.entries(params).forEach(([key, value]) => {
          if (value === null || value === undefined) {
            newSearchParams.delete(key);
          } else {
            newSearchParams.set(key, String(value));
          }
        });
        
        const queryString = newSearchParams.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
      });
    },
    [router, pathname, searchParams]
  );

  /**
   * Clears all search parameters and navigates to the base page
   */
  const clearSearchParams = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  return {
    searchParams,
    isPending,
    updateSearchParams,
    clearSearchParams,
    // Expose our standard parameter parsing utilities
    parseStringParam,
    parseNumberParam,
    parseBooleanParam,
    parseArrayParam
  };
} 