import { useMemo } from 'react';

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
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
  siblingCount = 2 
}: UsePaginationProps) {
  return useMemo(() => {
    // Return empty array for invalid pagination
    if (totalPages <= 0 || currentPage <= 0) {
      return [];
    }
    
    const range: (number | string)[] = [];
    
    // Calculate range of pages to show
    for (
      let i = Math.max(2, currentPage - siblingCount);
      i <= Math.min(totalPages - 1, currentPage + siblingCount);
      i++
    ) {
      range.push(i);
    }
    
    // Add first page if not already in range
    if (range.length > 0 && typeof range[0] === 'number' && range[0] > 2) {
      range.unshift('...');
    }
    
    if (range.length === 0 || (typeof range[0] === 'number' && range[0] > 1)) {
      range.unshift(1);
    }
    
    // Add last page if not already in range
    if (range.length > 0) {
      const lastItem = range[range.length - 1];
      if (typeof lastItem === 'number' && lastItem < totalPages - 1) {
        range.push('...');
      }
    }
    
    // Check if we need to add the last page
    if (totalPages > 1) {
      const lastItem = range[range.length - 1];
      if (range.length === 0 || (typeof lastItem === 'number' && lastItem < totalPages)) {
        range.push(totalPages);
      }
    }
    
    return range;
  }, [currentPage, totalPages, siblingCount]);
} 