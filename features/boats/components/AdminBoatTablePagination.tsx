"use client";

import { useQueryStates } from "nuqs";
import { boatSearchParams } from "@/features/boats/searchParams";
import { AdminListPagination } from "@/shared/admin/components/AdminListPagination";

interface AdminBoatTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminBoatTablePagination(props: AdminBoatTablePaginationProps) {
  const [, setFilters] = useQueryStates(boatSearchParams, {
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <AdminListPagination
      {...props}
      entityLabel="boats"
      onPageChange={(page) => setFilters({ page })}
      onLimitChange={(limit) => setFilters({ limit, page: 1 })}
    />
  );
}
