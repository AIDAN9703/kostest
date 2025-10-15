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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FieldDropdown } from "@/shared/components/FieldDropdown";
import { User } from "@/database/types";
import { StatusBadge, RoleBadge } from "@/shared/utils/badge-utils";

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

  // Define columns
  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      columnHelper.accessor("firstName", {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          const initials =
            `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-50">
                    <UserCircle2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  @{user.username}
                </div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <div className="text-sm text-gray-900">
            {info.getValue() || "No email"}
          </div>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <div className="text-sm">
            <RoleBadge role={info.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <div className="text-sm">
            <StatusBadge status={info.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone",
        cell: (info) => {
          const phone = info.getValue();
          return <div className="text-sm text-gray-900">{phone || "—"}</div>;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: (info) => {
          const date = info.getValue();
          return (
            <div className="text-sm text-gray-900">
              {date ? new Date(date).toLocaleDateString() : "No date"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Link href={`/admin/users/${user.id}`} prefetch={false}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  title="View"
                >
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
              <Link href={`/admin/users/${user.id}/edit`} prefetch={false}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this user?")) {
                      onDelete(user.id);
                    }
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
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
      {/* Table Container with proper overflow */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-slate-50 px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-2 cursor-pointer select-none group"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-slate-400 group-hover:text-slate-600">
                            {{
                              asc: <ChevronUp className="h-4 w-4" />,
                              desc: <ChevronDown className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-50" />
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
              <tr
                key={row.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
