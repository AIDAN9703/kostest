import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { getBlogPosts } from '@/features-admin/blog/actions/admin-blog-actions';
import BlogTable from '@/features-admin/blog/components/BlogTable';
import BlogTableSkeleton from '@/features-admin/blog/components/BlogTableSkeleton';
import { DataTablePagination } from '@/features-admin/_layout/DataTablePagination';

// Constants
const ITEMS_PER_PAGE = 10;

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Await searchParams before using its properties (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  // Parse and validate page number and limit
  const currentPage = resolvedParams.page ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = resolvedParams.limit ? Math.max(10, Math.min(100, parseInt(resolvedParams.limit))) : ITEMS_PER_PAGE;
  const status = resolvedParams.status;
  const category = resolvedParams.category;
  const search = resolvedParams.search;

  return (
    <div className="space-y-6">
      {/* Blog Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Suspense fallback={<BlogTableSkeleton />}>
          <BlogTableComponent 
            page={currentPage}
            limit={limit}
            status={status}
            category={category}
            search={search}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function BlogTableComponent({
  page,
  limit,
  status,
  category,
  search,
}: {
  page: number;
  limit: number;
  status?: string;
  category?: string;
  search?: string;
}) {
  const { posts, pagination } = await getBlogPosts({
    page,
    limit,
    status,
    category,
    search,
  });

  return (
    <>
      <BlogTable 
        posts={posts}
        currentStatus={status}
        currentCategory={category}
        currentSearch={search}
      />
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalCount={pagination.total}
          itemsPerPage={limit}
          searchParams={{ status, category, search }}
          baseUrl="/admin/blog"
          itemName="posts"
        />
      )}
    </>
  );
} 