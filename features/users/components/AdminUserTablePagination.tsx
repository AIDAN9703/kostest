"use client";

import { useQueryStates } from "nuqs";
import { userSearchParams } from "@/features/users/searchParams";
import { AdminListPagination } from "@/shared/admin/components/AdminListPagination";

interface AdminUserTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminUserTablePagination(props: AdminUserTablePaginationProps) {
  const [, setFilters] = useQueryStates(userSearchParams, {
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <AdminListPagination
      {...props}
      entityLabel="users"
      onPageChange={(page) => setFilters({ page })}
      onLimitChange={(limit) => setFilters({ limit, page: 1 })}
    />
  );
}
