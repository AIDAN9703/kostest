"use client";

import { UserFilters } from "@/features/users/components/UserFilters";
import { ModernUsersTable } from "@/features/users/components/ModernUsersTable";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { type UserFilterInput } from "@/features/users/user.validation";

export default function UsersPage() {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      status: parseAsString,
      role: parseAsString,
      page: parseAsInteger.withDefault(1),
    },
    {
      clearOnDefault: true,
    }
  );

  const apiFilters: UserFilterInput = Object.fromEntries(
    Object.entries({ ...filters, limit: 10 }).map(([key, value]) => [
      key,
      value ?? undefined,
    ])
  ) as UserFilterInput;

  const { data, isLoading, error } = useUsers(apiFilters);
  const deleteUser = useDeleteUser();

  const handleDelete = (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    deleteUser.mutate(userId);
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

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
