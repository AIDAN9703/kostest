"use client";

import { useState, useCallback, useTransition, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Boat, BoatLocation } from "@/types/types";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { formatCurrency } from "@/lib/utils";
import { Anchor, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import BoatCard from "@/components/ui/boat-card";

interface SearchResultsProps {
  initialResults: Boat[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  locations?: BoatLocation[];
}

// Sort options
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'length_asc', label: 'Length: Small to Large' },
  { value: 'length_desc', label: 'Length: Large to Small' },
  { value: 'newest', label: 'Newest First' }
];

export default function SearchResults({ 
  initialResults, 
  totalCount, 
  currentPage, 
  totalPages,
  locations = []
}: SearchResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [boats, setBoats] = useState<Boat[]>(initialResults);
  
  // Update boats when initialResults change
  useEffect(() => {
    setBoats(initialResults);
  }, [initialResults]);
  
  // Get current sort from URL or default to featured
  const currentSort = searchParams.get('sort') || 'featured';
  
  // Create a URL with updated search parameters
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      // Update or remove each parameter
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  // Handle sort change
  const handleSort = useCallback((sort: string) => {
    startTransition(() => {
      const queryString = createQueryString({
        sort,
        page: 1 // Reset to first page when sort changes
      });
      router.push(`${pathname}?${queryString}`);
    });
  }, [router, pathname, createQueryString]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      const queryString = createQueryString({ page });
      router.push(`${pathname}?${queryString}`);
    });
  }, [router, pathname, createQueryString]);
  
  // Get sort label for display
  const getSortLabel = useCallback((sort: string) => {
    const option = SORT_OPTIONS.find(option => option.value === sort);
    return option?.label || 'Featured';
  }, []);
  
  // Calculate pagination range
  const paginationRange = useMemo(() => {
    const delta = 2; // Number of pages to show before and after current page
    const range: (number | string)[] = [];
    
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
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
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          {totalCount > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              Showing page {currentPage} of {totalPages}
            </p>
          )}
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
          <div className="relative group">
            <Button
              variant="outline"
              className="h-11 px-4 rounded-2xl border-gray-200 hover:border-gray-300 hover:bg-white
                       focus:border-[#2C3E50] focus:ring-[#2C3E50] transition-all gap-2 min-w-[180px] justify-between"
            >
              <span>{getSortLabel(currentSort)}</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            
            {/* Sort Options Dropdown */}
            <div className="absolute right-0 mt-2 w-[220px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                      currentSort === option.value ? "text-[#2C3E50] font-medium" : "text-gray-700"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {boats.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full flex justify-center py-12"
              >
                <Loader2 className="h-8 w-8 animate-spin text-[#2C3E50]" />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {boats.map((boat, idx) => (
                  <motion.div
                    key={boat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <BoatCard 
                      boat={boat}
                      index={idx}
                      variant="search"
                      showDetails={true}
                      showPrice={true}
                      showLocation={true}
                      aspectRatio={16/9}
                      highlightFeatured={true}
                      showRating={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Anchor className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No boats found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your search filters or explore our featured boats.
          </p>
          <Button 
            onClick={() => router.push('/boats/search')}
            className="mt-6 bg-[#1E293B] hover:bg-[#2C3E50]"
          >
            Reset Filters
          </Button>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-12">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
            )}
            
            {paginationRange.map((page, i) => (
              <PaginationItem key={i}>
                {typeof page === 'number' ? (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                ) : (
                  <span className="px-4 py-2 text-sm text-gray-400">...</span>
                )}
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
} 