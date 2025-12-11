import { useQueryStates } from "nuqs";
import { useMemo, useCallback } from "react";

/**
 * Unified admin filter hook that handles:
 * - URL state management with nuqs
 * - Null to undefined conversion for API
 * - Data fetching with TanStack Query
 * - Delete mutations
 * - Common handlers (delete, page change)
 * 
 * This eliminates 20+ lines of boilerplate from each admin list page
 */
export function useAdminFilters<
  TFilterSchema extends Record<string, any>,
  TFilterInput extends Record<string, any>,
  TData = any
>({
  filterSchema,
  useDataHook,
  useDeleteHook,
  limit = 10,
}: {
  filterSchema: TFilterSchema;
  useDataHook: (filters: TFilterInput) => { data: TData; isLoading: boolean; error: any };
  useDeleteHook: () => { mutate: (id: string) => void };
  limit?: number;
}) {
  // 1. URL state management with nuqs
  const [filters, setFilters] = useQueryStates(filterSchema, {
    clearOnDefault: true, // Automatically removes params from URL when set to null
  });

  // 2. Convert null to undefined for API type safety
  // TanStack Query and API routes expect undefined, not null
  const apiFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries({ ...filters, limit }).map(([key, value]) => [
          key,
          value ?? undefined,
        ])
      ) as TFilterInput,
    [filters, limit]
  );

  // 3. Fetch data with TanStack Query
  const { data, isLoading, error } = useDataHook(apiFilters);

  // 4. Delete mutation
  const deleteMutation = useDeleteHook();

  // 5. Common handlers
  const handleDelete = useCallback(
    (id: string, confirmMessage = "Are you sure? This action cannot be undone.") => {
      if (!confirm(confirmMessage)) return;
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page } as any);
    },
    [setFilters]
  );

  return {
    // State
    filters,
    setFilters,
    
    // Data
    data,
    isLoading,
    error,
    
    // Handlers
    handleDelete,
    handlePageChange,
  };
}

