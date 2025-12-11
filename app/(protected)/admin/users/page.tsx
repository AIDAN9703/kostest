"use client";

import { UserFilters } from "@/features/users/components/UserFilters";
import { ModernUsersTable } from "@/features/users/components/ModernUsersTable";
import { parseAsString, parseAsInteger } from "nuqs";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { useAdminFilters } from "@/shared/admin/hooks/useAdminFilters";
import { type UserFilterInput } from "@/features/users/user.validation";

export default function UsersPage() {
  // Shared hook eliminates all boilerplate (null conversion, handlers, etc.)
  const {
    filters,
    setFilters,
    data,
    isLoading,
    error,
    handleDelete,
    handlePageChange,
  } = useAdminFilters({
    filterSchema: {
      search: parseAsString.withDefault(""),
      status: parseAsString,
      role: parseAsString,
      page: parseAsInteger.withDefault(1),
    },
    useDataHook: useUsers,
    useDeleteHook: useDeleteUser,
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Failed to load users. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white rounded-3xl shadow-xs border border-gray-200/70">
      {/* Filters */}
      <UserFilters filters={filters} setFilters={setFilters} />

      {/* Table */}
      <ModernUsersTable
        users={data?.data || []}
        pagination={{
          page: data?.meta?.pagination?.page || 1,
          limit: data?.meta?.pagination?.limit || 10,
          totalCount: data?.meta?.pagination?.totalCount || 0,
          totalPages: data?.meta?.pagination?.totalPages || 0,
        }}
        loading={isLoading}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
