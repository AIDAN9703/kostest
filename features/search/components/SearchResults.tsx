"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Boat, BoatLocation } from "@/shared/lib/types/types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/shared/components/ui/pagination";
import { ArrowUpDown, Check, Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";
import BoatCard from "@/shared/components/ui/boat-card";
import { useSearchURL } from "@/features/search/hooks/useSearchURL";
import { usePagination } from "@/shared/lib/hooks/usePagination";
import FilterModal from "./FilterModal";
import SearchResultsFallback from "./SearchResultsFallback";
import { parseStringParam } from "@/shared/lib/utils/search-params-utils";
import { BoatWithTiers } from "@/features/boats/boat.types";

interface SearchResultsProps {
  initialResults: BoatWithTiers[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  locations?: BoatLocation[];
}

// Sort options
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "length_asc", label: "Length: Small to Large" },
  { value: "length_desc", label: "Length: Large to Small" },
  { value: "newest", label: "Newest First" },
];

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

export default function SearchResults({
  initialResults,
  totalCount,
  currentPage,
  totalPages,
  locations = [],
}: SearchResultsProps) {
  const { searchParams, isPending, updateSearchParams } = useSearchURL();

  // Get current sort from URL or default to featured
  const currentSort = useMemo(
    () => parseStringParam(searchParams.get("sort")) || "featured",
    [searchParams]
  );

  // Handle sort change
  const handleSort = useCallback(
    (sort: string) => {
      updateSearchParams({
        sort,
        page: 1, // Reset to first page when sort changes
      });
    },
    [updateSearchParams]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page });
    },
    [updateSearchParams]
  );

  // Get sort label for display
  const getSortLabel = useCallback((sort: string) => {
    const option = SORT_OPTIONS.find((option) => option.value === sort);
    return option?.label || "Featured";
  }, []);

  // Use a state variable for FilterModal visibility
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Use custom pagination hook
  const { pages, hasNextPage, hasPreviousPage } = usePagination({
    currentPage,
    totalPages,
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Check for various filter parameters
    if (searchParams.has("date")) count++;
    if (searchParams.has("minPrice") || searchParams.has("maxPrice")) count++;
    if (searchParams.has("minLength") || searchParams.has("maxLength")) count++;
    if (searchParams.has("minYear") || searchParams.has("maxYear")) count++;
    if (searchParams.has("passengers") && searchParams.get("passengers") !== "1") count++;
    if (searchParams.has("cabins") && searchParams.get("cabins") !== "0") count++;
    if (searchParams.has("bathrooms") && searchParams.get("bathrooms") !== "0") count++;
    if (searchParams.has("category")) count++;
    if (searchParams.has("features")) count++;

    return count;
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        {totalCount > 0 && (
          <p className="text-gray-500 text-sm mt-1">
            Showing page {currentPage} of {totalPages} &middot;{" "}
            <span className="font-medium">{totalCount}</span> boat
            {totalCount !== 1 && "s"} found
          </p>
        )}

        <div className="flex items-center gap-3">
          {/* Filter Button with Badge */}
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-gray-200 hover:border-gray-300 hover:bg-white
                     focus:border-[#2C3E50] focus:ring-[#2C3E50] transition-all relative"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#2C3E50] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sort: click/tap menu (hover-only broke on touch devices) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-4 rounded-2xl border-gray-200 hover:border-gray-300 hover:bg-white
                           focus:border-[#2C3E50] focus:ring-[#2C3E50] transition-all gap-2 min-w-[180px] justify-between"
                  aria-label="Sort results"
                >
                  <span className="truncate">{getSortLabel(currentSort)}</span>
                  <ArrowUpDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-50 w-[min(100vw-2rem,220px)] rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => handleSort(option.value)}
                    className={cn(
                      "cursor-pointer justify-between gap-2 rounded-lg px-3 py-2 text-sm focus:bg-gray-50",
                      currentSort === option.value
                        ? "text-[#2C3E50] font-medium"
                        : "text-gray-700"
                    )}
                  >
                    {option.label}
                    {currentSort === option.value ? (
                      <Check className="h-4 w-4 shrink-0 text-[#2C3E50]" aria-hidden />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

      {/* Results Grid */}
      {initialResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-5">
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
                className="col-span-full grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-5 w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                {initialResults.map((boat) => (
                  <motion.div key={boat.id} variants={itemVariants} layout>
                    <BoatCard
                      boat={boat}
                      index={0}
                      variant="search"
                      showDetails={true}
                      showPrice={true}
                      showLocation={true}
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
        <SearchResultsFallback />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-12">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/boats/search?page=${currentPage - 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                aria-disabled={!hasPreviousPage}
                className={!hasPreviousPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pages.map((page) => {
              // Show first page, last page, current page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/boats/search?page=${page}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              // Show ellipsis for gaps
              if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href={`/boats/search?page=${currentPage + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                aria-disabled={!hasNextPage}
                className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
