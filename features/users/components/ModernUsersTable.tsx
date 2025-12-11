"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
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
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCircle2,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/database/types";
import { StatusBadge, RoleBadge } from "@/shared/lib/utils/badge-utils";

// Props interface with proper types
interface ModernUsersTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
  onDelete?: (userId: string) => void;
  onUpdateField?: (userId: string, field: string, value: string) => void;
  onPageChange?: (page: number) => void;
}

const columnHelper = createColumnHelper<User>();

export function ModernUsersTable({
  users,
  pagination,
  loading,
  onDelete,
  onUpdateField,
  onPageChange,
}: ModernUsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Define columns - simplified and more compact
  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      columnHelper.accessor("firstName", {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <UserCircle2 className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("phoneNumber", {
        header: "Phone",
        cell: (info) => {
          const phone = info.getValue();
          return <div className="text-sm text-gray-600">{phone || "—"}</div>;
        },
      }),

      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => <RoleBadge role={info.getValue()} />,
      }),

      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),

      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: (info) => {
          const date = info.getValue();
          return (
            <div className="text-sm text-gray-600">
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
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
                      href={`/admin/users/${user.id}`}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </Link>
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this user?"
                            )
                          ) {
                            onDelete(user.id);
                          }
                        }}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onDelete]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <UserCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or add a new user.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Table Container - Responsive without horizontal scroll */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-1 cursor-pointer select-none group"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400 group-hover:text-gray-600">
                            {{
                              asc: <ChevronUp className="h-3.5 w-3.5" />,
                              desc: <ChevronDown className="h-3.5 w-3.5" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronUp className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalCount}</span>{" "}
              users
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
                disabled={pagination.page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-gray-700 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
