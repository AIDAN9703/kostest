"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import {
  parseStringParam,
  parseNumberParam,
  parseArrayParam,
} from "@/shared/lib/utils/search-params-utils";

type ParamValue = string | number | boolean | null | undefined;

export function useSearchURL() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useCallback(
    (params: Record<string, ParamValue>) => {
      startTransition(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
          if (value === null || value === undefined) {
            newSearchParams.delete(key);
          } else {
            newSearchParams.set(key, String(value));
          }
        });

        const queryString = newSearchParams.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
      });
    },
    [router, pathname, searchParams],
  );

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
    parseStringParam,
    parseNumberParam,
    parseArrayParam,
  };
}
