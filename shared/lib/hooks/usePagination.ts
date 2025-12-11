import { useMemo } from 'react';

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

interface UsePaginationReturn {
  pages: number[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Custom hook to calculate pagination range
 * @param currentPage Current active page
 * @param totalPages Total number of pages
 * @param siblingCount Number of siblings to show on each side of current page (default 2)
 * @returns Array of page numbers and ellipsis to display
 */
export function usePagination({
  currentPage,
  totalPages,
  siblingCount = 1,
}: UsePaginationProps): UsePaginationReturn {
  // Generate array of page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Calculate if we have next/previous pages
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    pages,
    hasNextPage,
    hasPreviousPage,
  };
} 