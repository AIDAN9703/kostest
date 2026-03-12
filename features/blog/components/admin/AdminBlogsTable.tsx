"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { FileText, Eye, Edit, Trash2, MoreVertical, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { BlogListItem } from "@/features/blog/blog.types";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatDate } from "@/shared/lib/utils/general-utils";
import { useDeleteBlogPost } from "@/features/blog/hooks/useBlogMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

const categoryLabels: Record<string, string> = {
  FLEET_NEWS: "Fleet News",
  CONSERVATION: "Conservation",
  TIPS_ADVICE: "Tips & Advice",
  CASE_STUDY: "Case Study",
  COMPANY_NEWS: "Company News",
  SAFETY: "Safety",
  EVENTS: "Events",
};

interface AdminBlogsTableProps {
  posts: BlogListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
}

const columnHelper = createColumnHelper<BlogListItem>();

export function AdminBlogsTable({
  posts,
  pagination,
  loading,
}: AdminBlogsTableProps) {
  const { toast } = useToast();
  const deletePost = useDeleteBlogPost();

  const handleDelete = (post: BlogListItem) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    deletePost.mutate(post.id, {
      onSuccess: (result) => {
        if (result.success) {
          toast({ title: "Post deleted successfully" });
        } else {
          toast({
            title: "Error",
            description: result.error ?? "Failed to delete post",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        });
      },
    });
  };

  const columns = useMemo<ColumnDef<BlogListItem, any>[]>(
    () => [
      columnHelper.accessor("title", {
        id: "post",
        header: "Post",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-14 rounded overflow-hidden bg-muted shrink-0">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.imageAlt || post.title}
                    width={56}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-foreground text-sm truncate block min-w-0">
                    {post.title}
                  </span>
                  {post.isFeatured && (
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-current shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {post.excerpt}
                </p>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),

      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {categoryLabels[info.getValue()] ?? info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor("author", {
        header: "Author",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || "—"}
          </span>
        ),
      }),

      columnHelper.accessor("publishedAt", {
        header: "Date",
        cell: ({ row }) => {
          const post = row.original;
          const date =
            post.status === "PUBLISHED" && post.publishedAt
              ? post.publishedAt
              : post.createdAt;
          return (
            <span className="text-sm text-muted-foreground">
              {date ? formatDate(date) : "—"}
            </span>
          );
        },
      }),

      columnHelper.accessor("viewCount", {
        header: "Views",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() ?? 0}
          </span>
        ),
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  {post.status === "PUBLISHED" && (
                    <DropdownMenuItem asChild>
                      <a
                        href={`/news/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View on site
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => handleDelete(post)}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No blog posts found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new post.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={
                      cell.column.id === "post"
                        ? "px-4 py-3 overflow-hidden"
                        : "px-4 py-3"
                    }
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
