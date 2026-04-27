import { Suspense } from "react";
import { userService } from "@/features/users/user.service";
import { userSearchParamsCache } from "@/features/users/searchParams";
import { AdminUserFilter } from "@/features/users/components/AdminUserFilter";
import { AdminUsersTable } from "@/features/users/components/AdminUsersTable";
import { AdminUserTablePagination } from "@/features/users/components/AdminUserTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await userSearchParamsCache.parse(searchParams);
  const params = userSearchParamsCache.all();

  const result = await userService.getAllUsers({
    search: params.search || undefined,
    status: params.status ?? undefined,
    isAdmin: params.isAdmin ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <AdminTableWrapper>
      <Suspense
        fallback={<div className="h-14 border-b border-border animate-pulse" />}
      >
        <AdminUserFilter />
      </Suspense>
      <AdminUsersTable users={result.users} />
      <AdminUserTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
