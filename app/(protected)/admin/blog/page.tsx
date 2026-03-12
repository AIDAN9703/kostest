import { Suspense } from "react";
import { blogService } from "@/features/blog/blog.service";
import { blogSearchParamsCache } from "@/features/blog/searchParams";
import { AdminBlogFilter } from "@/features/blog/components/admin/AdminBlogFilter";
import { AdminBlogsTable } from "@/features/blog/components/admin/AdminBlogsTable";
import { AdminBlogTablePagination } from "@/features/blog/components/admin/AdminBlogTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await blogSearchParamsCache.parse(searchParams);
  const params = blogSearchParamsCache.all();

  const result = await blogService.getAllPosts({
    search: params.search || undefined,
    status: params.status ?? undefined,
    category: params.category ?? undefined,
    featured: params.featured ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <AdminTableWrapper>
      <Suspense
        fallback={<div className="h-14 border-b border-border animate-pulse" />}
      >
        <AdminBlogFilter />
      </Suspense>
      <AdminBlogsTable
        posts={result.posts}
        pagination={{
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
      />
      <AdminBlogTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
