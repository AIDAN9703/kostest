"use client";

import { useQueryStates } from "nuqs";
import { inquirySearchParams } from "@/features/inquiries/searchParams";
import { AdminListPagination } from "@/shared/admin/components/AdminListPagination";

interface AdminInquiryTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminInquiryTablePagination(props: AdminInquiryTablePaginationProps) {
  const [, setFilters] = useQueryStates(inquirySearchParams, {
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <AdminListPagination
      {...props}
      entityLabel="inquiries"
      onPageChange={(page) => setFilters({ page })}
      onLimitChange={(limit) => setFilters({ limit, page: 1 })}
    />
  );
}
