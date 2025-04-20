'use client';

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

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
   * Creates a query string from parameters
   */
  const createQueryString = useCallback(
    (params: Record<string, ParamValue>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      // Update or remove each parameter
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          newSearchParams.delete(key);
        } else if (typeof value === 'boolean') {
          // Convert boolean values to 'on'/'off' or just delete if false
          if (value) {
            newSearchParams.set(key, 'on');
          } else {
            newSearchParams.delete(key);
          }
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  /**
   * Updates the URL with new search parameters
   */
  const updateSearchParams = useCallback(
    (params: Record<string, ParamValue>) => {
      startTransition(() => {
        const queryString = createQueryString(params);
        router.push(`${pathname}?${queryString}`);
      });
    },
    [router, pathname, createQueryString]
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
    createQueryString,
    updateSearchParams,
    clearSearchParams
  };
} 