"use client";

import { useQueryStates } from "nuqs";
import { blogSearchParams } from "@/features/blog/searchParams";
import { AdminListPagination } from "@/shared/admin/components/AdminListPagination";

interface AdminBlogTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminBlogTablePagination(props: AdminBlogTablePaginationProps) {
  const [, setFilters] = useQueryStates(blogSearchParams, {
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <AdminListPagination
      {...props}
      entityLabel="posts"
      onPageChange={(page) => setFilters({ page })}
      onLimitChange={(limit) => setFilters({ limit, page: 1 })}
    />
  );
}
