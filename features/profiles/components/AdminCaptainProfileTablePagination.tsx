"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { serializeCaptainProfileListParams } from "../captain-profile.search-params";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AdminCaptainProfileTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminCaptainProfileTablePagination({
  totalCount,
  totalPages,
  page,
  limit,
}: AdminCaptainProfileTablePaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const basePath = "/admin/captains";

  const makeHref = (newPage: number) => {
    const query = serializeCaptainProfileListParams(searchParams, { page: newPage });
    if (!query) return basePath;
    return query.startsWith("?") ? `${basePath}${query}` : `${basePath}?${query}`;
  };

  return (
    <div className="flex-shrink-0 border-t border-border bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground">
          Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
          <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{" "}
          <span className="font-medium">{totalCount}</span> captains
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link
              href={makeHref(1)}
              aria-label="First page"
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link
              href={makeHref(page - 1)}
              aria-label="Previous page"
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>

          <span className="px-3 text-sm text-foreground">
            Page {page} of {totalPages}
          </span>

          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link
              href={makeHref(page + 1)}
              aria-label="Next page"
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link
              href={makeHref(totalPages)}
              aria-label="Last page"
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronsRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
