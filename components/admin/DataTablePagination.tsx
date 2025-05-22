"use client";

import { usePagination } from "@/hooks/usePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  searchParams: Record<string, string | undefined>;
  baseUrl: string;
  itemName: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  searchParams,
  baseUrl,
  itemName,
}: DataTablePaginationProps) {
  const { pages, hasNextPage, hasPreviousPage } = usePagination({
    currentPage,
    totalPages,
  });

  // Calculate the range of items being displayed
  const startItem = totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // Helper function to create pagination URLs
  const createPageUrl = (page: number, newItemsPerPage?: number) => {
    const params = new URLSearchParams();
    
    // Preserve existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // Set page number
    params.set('page', page.toString());
    
    // Set items per page if provided
    if (newItemsPerPage) {
      params.set('limit', newItemsPerPage.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Available page sizes
  const pageSizes = [10, 25, 50, 100];

  // Don't show pagination if there's no data
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-lg border-t px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalCount}</span> {itemName}
        </div>
        <Select
          defaultValue={itemsPerPage.toString()}
          onValueChange={(value) => {
            window.location.href = createPageUrl(1, parseInt(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createPageUrl(currentPage - 1)}
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
                    href={createPageUrl(page)}
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
              href={createPageUrl(currentPage + 1)}
              aria-disabled={!hasNextPage}
              className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
} 