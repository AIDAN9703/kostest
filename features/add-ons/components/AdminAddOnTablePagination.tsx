"use client";

import { useQueryStates } from "nuqs";
import { addOnSearchParams } from "@/features/add-ons/searchParams";
import { AdminListPagination } from "@/shared/admin/components/AdminListPagination";

interface Props {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminAddOnTablePagination(props: Props) {
  const [, setFilters] = useQueryStates(addOnSearchParams, {
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <AdminListPagination
      {...props}
      entityLabel="add-ons"
      onPageChange={(page) => setFilters({ page })}
      onLimitChange={(limit) => setFilters({ limit, page: 1 })}
    />
  );
}
