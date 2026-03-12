"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { serializeBlogParams } from "@/features/blog/searchParams";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AdminBlogTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminBlogTablePagination({
  totalCount,
  totalPages,
  page,
  limit,
}: AdminBlogTablePaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const basePath = "/admin/blog";

  const makeHref = (newPage: number) => {
    const query = serializeBlogParams(searchParams, { page: newPage });
    if (!query) return basePath;
    return query.startsWith("?")
      ? `${basePath}${query}`
      : `${basePath}?${query}`;
  };

  return (
    <div className="flex-shrink-0 border-t border-border px-6 py-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground">
          Showing <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(page * limit, totalCount)}
          </span>{" "}
          of <span className="font-medium">{totalCount}</span> posts
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

          <span className="text-sm text-foreground px-3">
            Page {page} of {totalPages}
          </span>

          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link
              href={makeHref(page + 1)}
              aria-label="Next page"
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link
              href={makeHref(totalPages)}
              aria-label="Last page"
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            >
              <ChevronsRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
